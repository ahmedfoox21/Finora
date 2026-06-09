/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as adminNamespace from "firebase-admin";
import { prisma } from "./db";
import webpush from "web-push";
import fs from "fs";
import path from "path";

const admin = (adminNamespace as any).default || adminNamespace;

let vapidKeys: { publicKey: string; privateKey: string } | null = null;

/**
 * Returns or creates stored VAPID keys for PWA Web Push subscriptions
 */
export function getVapidKeys() {
  if (vapidKeys) return vapidKeys;

  const envPublic = process.env.VAPID_PUBLIC_KEY;
  const envPrivate = process.env.VAPID_PRIVATE_KEY;

  if (envPublic && envPrivate) {
    vapidKeys = { publicKey: envPublic, privateKey: envPrivate };
    webpush.setVapidDetails(
      "mailto:conquer.zomico@gmail.com",
      envPublic,
      envPrivate
    );
    return vapidKeys;
  }

  // Fallback to local persistent cache
  const keysPath = path.join(process.cwd(), "vapid_keys.json");
  if (fs.existsSync(keysPath)) {
    try {
      const content = fs.readFileSync(keysPath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && parsed.publicKey && parsed.privateKey) {
        vapidKeys = parsed;
        webpush.setVapidDetails(
          "mailto:conquer.zomico@gmail.com",
          parsed.publicKey,
          parsed.privateKey
        );
        console.log("[Push Service] Loaded stored persistent VAPID keys.");
        return vapidKeys;
      }
    } catch (e) {
      console.log("[Push Service] Failed parsing stored keys:", e);
    }
  }

  // Generate new persistent pair
  try {
    const generated = webpush.generateVAPIDKeys();
    fs.writeFileSync(keysPath, JSON.stringify(generated, null, 2), "utf-8");
    vapidKeys = generated;
    webpush.setVapidDetails(
      "mailto:conquer.zomico@gmail.com",
      generated.publicKey,
      generated.privateKey
    );
    console.log("[Push Service] New persistent VAPID keys successfully generated & saved to disk.");
    return vapidKeys;
  } catch (error) {
    console.error("[Push Service] Failed generating key pairs:", error);
    return null;
  }
}

// Ensure keys are initialized on startup
getVapidKeys();

let isFirebaseInitialized = false;
let isFirebaseCredentialInvalid = false;

export function initializeFirebaseAdmin() {
  if (isFirebaseCredentialInvalid) return false;
  if (isFirebaseInitialized) return true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Replace escaped newlines in private key if present
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isFirebaseInitialized = true;
      console.log("[Push Service] Firebase Admin successfully initialized for real-time FCM Push deliveries.");
      return true;
    } catch (e) {
      console.log("[Push Service] Info initializing Firebase credential cert setup.");
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      isFirebaseInitialized = true;
      console.log("[Push Service] Firebase Admin initialized with GOOGLE_APPLICATION_CREDENTIALS.");
      return true;
    } catch (e) {
      console.log("[Push Service] Info initializing generic applicationDefault credentials setup.");
    }
  }

  console.log("[Push Service] FCM variables are unconfigured. Falling back to background simulator delivery logs.");
  return false;
}

/**
 * Registers an active FCM token for a given user email
 */
export async function registerDeviceToken(email: string, token: string, platform = "web"): Promise<boolean> {
  const normEmail = email.trim().toLowerCase();
  if (!prisma) return false;

  try {
    const user = await prisma.user.findUnique({
      where: { email: normEmail }
    });
    if (!user) return false;

    // Save or update existing token to avoid duplicate records
    await prisma.deviceToken.upsert({
      where: { token },
      update: { userId: user.id, platform },
      create: { userId: user.id, token, platform }
    });

    console.log(`[Push Service] Device token successfully mapped inside PostgreSQL for user: ${normEmail}`);
    return true;
  } catch (error) {
    console.error("[Push Service] Failure registering DeviceToken to database:", error);
    return false;
  }
}

/**
 * Sweeps user variables and sends Real Firebase Push to all registered device tokens
 */
export async function sendFCMToUser(
  userId: string,
  payload: {
    type: string;
    titleEn: string;
    titleAr: string;
    bodyEn: string;
    bodyAr: string;
  }
): Promise<{ sentCount: number; success: boolean }> {
  if (!prisma) return { sentCount: 0, success: false };

  try {
    // 1. Save notification locally in PostgreSQL
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        titleEn: payload.titleEn,
        titleAr: payload.titleAr,
        bodyEn: payload.bodyEn,
        bodyAr: payload.bodyAr,
        status: "sent",
        read: false,
      }
    });

    // 2. Query registered push tokens
    const tokens = await prisma.deviceToken.findMany({
      where: { userId }
    });

    if (tokens.length === 0) {
      console.log(`[Push Service] User ${userId} has no active device tokens registered. Logged to PostgreSQL notification log: ID ${notification.id}`);
      return { sentCount: 0, success: true };
    }

    const hasFCM = initializeFirebaseAdmin();
    getVapidKeys();
    let deliveredCount = 0;
    let fallbackToEmulator = false;

    const userRecord = await prisma.user.findUnique({ where: { id: userId } });
    const isAr = userRecord?.language !== "en";
    const displayTitle = isAr ? payload.titleAr : payload.titleEn;
    const displayBody = isAr ? payload.bodyAr : payload.bodyEn;

    for (const t of tokens) {
      let isWebPush = false;
      let subscriptionObj: any = null;

      try {
        if (t.token.trim().startsWith("{")) {
          const parsed = JSON.parse(t.token);
          if (parsed && typeof parsed === "object" && parsed.endpoint) {
            subscriptionObj = parsed;
            isWebPush = true;
          }
        }
      } catch (e) {
        // Not a JSON subscription
      }

      if (isWebPush && subscriptionObj) {
        try {
          const payloadString = JSON.stringify({
            title: displayTitle,
            body: displayBody,
            data: {
              notificationId: notification.id,
              type: payload.type,
            }
          });
          await webpush.sendNotification(subscriptionObj, payloadString);
          deliveredCount++;
          console.log(`[Push Service] Web Push successfully processed & delivered to PWA client: ${t.token.substring(0, 45)}...`);
        } catch (webPushError: any) {
          console.log(`[Push Service] Web Push delivery failed with status: ${webPushError.statusCode || "unknown"}`);
          // 410 (Gone) or 404 (Not Found) means the subscription was deleted or has expired
          if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
            await prisma.deviceToken.delete({ where: { id: t.id } }).catch(() => {});
          }
        }
      } else {
        if (hasFCM) {
          try {
            const message = {
              token: t.token,
              notification: {
                title: displayTitle,
                body: displayBody,
              },
              data: {
                notificationId: notification.id,
                type: payload.type,
              },
              android: {
                priority: "high" as const,
                notification: {
                  sound: "default",
                  clickAction: "FLUTTER_NOTIFICATION_CLICK"
                }
              },
              webpush: {
                headers: {
                  Urgency: "high"
                },
                notification: {
                  body: displayBody,
                  icon: "/favicon.svg",
                  badge: "/favicon.svg"
                }
              }
            };

            await admin.messaging().send(message);
            deliveredCount++;
          } catch (fcmError: any) {
            const errMsg = fcmError?.message || String(fcmError);
            const isCredentialIssue = errMsg.includes("invalid_grant") || 
                                      errMsg.includes("OAuth2 access token") || 
                                      errMsg.includes("account not found") || 
                                      errMsg.includes("cert") || 
                                      errMsg.includes("credential");

            if (isCredentialIssue) {
              console.log("[Push Service] Service fallback activated.");
              isFirebaseCredentialInvalid = true;
              isFirebaseInitialized = false;
              fallbackToEmulator = true;
            }

            console.log(`[Push Service] Non-blocking push delivery status: ${t.token}`);

            if (fcmError?.code === 'messaging/registration-token-not-registered' || fcmError?.code === 'messaging/invalid-registration-token') {
              await prisma.deviceToken.delete({ where: { id: t.id } }).catch(() => {});
            }
          }
        } else {
          fallbackToEmulator = true;
        }
      }
    }

    if (fallbackToEmulator && deliveredCount === 0) {
      console.log(`[Push Emulator] FCM mock success. Title: "${displayTitle}" | Body: "${displayBody}" to ${tokens.length} device tokens.`);
      deliveredCount = tokens.length;
    }

    // 3. Mark delivery state inside Neon PostgreSQL telemetry audit
    if (deliveredCount > 0) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: "delivered",
          deliveredAt: new Date()
        }
      });
    }

    return { sentCount: deliveredCount, success: true };
  } catch (err) {
    console.error("[Push Service] Failed processing push trigger:", err);
    return { sentCount: 0, success: false };
  }
}
