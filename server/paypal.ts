/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { prisma } from "./db";

const PAYPAL_API_SANDBOX = "https://api-m.sandbox.paypal.com";
const PAYPAL_API_LIVE = "https://api-m.paypal.com";

function getPayPalBaseUrl() {
  return process.env.PAYPAL_MODE === "live" ? PAYPAL_API_LIVE : PAYPAL_API_SANDBOX;
}

// Helper to acquire a PayPal OAuth 2.0 Access Token
async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("[PayPal Service] PayPal credentials missing. Real integrations will run in simulator mode.");
    return null;
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PayPal Service] Access token request failed:", errorText);
      return null;
    }

    const data: any = await response.json();
    return data.access_token;
  } catch (err) {
    console.error("[PayPal Service] Error acquiring access token:", err);
    return null;
  }
}

// Creates an active PayPal order for a donation amount
export async function createPayPalOrder(amount: number, currency = "USD") {
  const accessToken = await getPayPalAccessToken();

  if (!accessToken) {
    // Return simulator details to let user evaluate UI immediately
    const mockOrderId = `MOCK-PP-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    return {
      success: true,
      orderId: mockOrderId,
      isMock: true,
      msg: "Running in Finora PayPal Sandbox Simulator"
    };
  }

  try {
    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            },
            description: "Support Finora ❤️ - Donation to Ahmed Foox"
          }
        ]
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.error("[PayPal Service] Checkout creation failed:", errTxt);
      return { success: false, error: "PayPal order creation failed" };
    }

    const orderData: any = await response.json();
    return {
      success: true,
      orderId: orderData.id,
      isMock: false
    };
  } catch (e: any) {
    console.error("[PayPal Service] Error creating order:", e);
    return { success: false, error: e?.message || "Internal order error" };
  }
}

// Captures and completes the order
export async function capturePayPalOrder(orderId: string, email: string | null = null, amount: number, currency = "USD") {
  if (!prisma) {
    return { success: false, error: "PostgreSQL Database client is offline." };
  }

  // Handle mock orders
  if (orderId.startsWith("MOCK-PP-")) {
    try {
      let resolvedUserId: string | null = null;
      if (email) {
        const u = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        resolvedUserId = u?.id || null;
      }

      const donation = await prisma.donation.create({
        data: {
          userId: resolvedUserId,
          amount,
          currency,
          paypalOrderId: orderId,
          status: "completed",
          donorEmail: email || "simulator-donor@finora.app"
        }
      });

      console.log(`[PayPal Simulator] Successfully saved mock donation to Neon PostgreSQL. Log ID: ${donation.id}`);
      return { success: true, isMock: true, orderId, donation };
    } catch (dbErr) {
      console.error("[PayPal Simulator] Failed saving mock donation to DB:", dbErr);
      return { success: false, error: "Failed saving mock transaction to database" };
    }
  }

  const accessToken = await getPayPalAccessToken();
  if (!accessToken) {
    return { success: false, error: "Access token is missing" };
  }

  try {
    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.error("[PayPal Service] Capture call failed:", errTxt);
      return { success: false, error: "PayPal capture operation failed" };
    }

    const captureData: any = await response.json();
    const donorEmail = captureData.payer?.email_address || email || "anonymous@paypal.com";
    const paymentAmount = Number(captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || amount);

    let resolvedUserId: string | null = null;
    if (email) {
      const u = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      resolvedUserId = u?.id || null;
    }

    // Save donation records to Neon Database
    const donation = await prisma.donation.create({
      data: {
        userId: resolvedUserId,
        amount: paymentAmount,
        currency,
        paypalOrderId: orderId,
        status: "completed",
        donorEmail
      }
    });

    console.log(`[PayPal Service] Payment captured successfully and saved to Neon. Order ID: ${orderId}`);
    return { success: true, isMock: false, orderId, donation };
  } catch (err: any) {
    console.error("[PayPal Service] Capture error exception:", err);
    return { success: false, error: err?.message || "Capture internal exception" };
  }
}
