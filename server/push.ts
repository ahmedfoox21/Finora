/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as admin from "firebase-admin";
import { prisma } from "./db";

let isFirebaseInitialized = false;

export function initializeFirebaseAdmin() {
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
      console.error("[Push Service] Error building Firebase Admin credential:", e);
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
      console.error("[Push Service] Error using applicationDefault credentials:", e);
    }
  }

  console.warn("[Push Service] Real FCM variables are missing. Falling back to background simulator delivery logs.");
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
    let deliveredCount = 0;

    const userRecord = await prisma.user.findUnique({ where: { id: userId } });
    const isAr = userRecord?.language !== "en";
    const displayTitle = isAr ? payload.titleAr : payload.titleEn;
    const displayBody = isAr ? payload.bodyAr : payload.bodyEn;

    if (hasFCM) {
      for (const t of tokens) {
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
          console.error(`[Push Service] Failed delivering push token ${t.token}:`, fcmError?.message || fcmError);
          // If token is invalid or inactive, sweep/delete it to maintain high-performance database health
          if (fcmError?.code === 'messaging/registration-token-not-registered' || fcmError?.code === 'messaging/invalid-registration-token') {
            await prisma.deviceToken.delete({ where: { id: t.id } }).catch(() => {});
          }
        }
      }
    } else {
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
