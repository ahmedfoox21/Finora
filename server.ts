/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { registerUser, loginUser, syncState, getSyncedState } from "./server/auth";
import { generateBudgetInsights, evaluateShoppingGoal, handleFinancialChat } from "./server/gemini";
import { initializeFirebaseAdmin, registerDeviceToken } from "./server/push";
import { runScheduledNotificationsAudit, startDaemonScheduler } from "./server/scheduler";
import { createPayPalOrder, capturePayPalOrder } from "./server/paypal";
import { prisma } from "./server/db";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin configuration for FCM background pushes
initializeFirebaseAdmin();

// Spawn background notification audit scheduler
startDaemonScheduler();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse body payload
  app.use(express.json());

  // API - Auth Endpoints
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, msg: "البريد الإلكتروني وكلمة المرور مطلوبان." });
      return;
    }
    const result = await registerUser(email, password);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, msg: "البريد الإلكتروني وكلمة المرور مطلوبان." });
      return;
    }
    const result = await loginUser(email, password);
    if (result.success) {
      // Return synced state along with login details if available
      const syncedState = await getSyncedState(email);
      res.status(200).json({
        success: true,
        msg: result.msg,
        user: {
          email: result.user?.email,
          syncedState: syncedState || null
        }
      });
    } else {
      res.status(401).json(result);
    }
  });

  app.post("/api/auth/sync", async (req, res) => {
    const { email, state } = req.body;
    if (!email || !state) {
      res.status(400).json({ success: false, msg: "البريد الإلكتروني والبيانات مطلوبة للاستعادة والمزامنة." });
      return;
    }
    const success = await syncState(email, state);
    if (success) {
      res.status(200).json({ success: true, msg: "تمت المزامنة وحفظ البيانات سحابياً بنجاح!" });
    } else {
      res.status(404).json({ success: false, msg: "المستخدم غير موجود أو فشل تحديث البيانات بقاعدة البيانات PostgreSQL." });
    }
  });

  app.get("/api/auth/sync/:email", async (req, res) => {
    const { email } = req.params;
    const syncedState = await getSyncedState(email);
    if (syncedState) {
      res.status(200).json({ success: true, state: syncedState });
    } else {
      res.status(444).json({ success: false, msg: "لا يوجد نسخة احتياطية محفوظة لهذا الحساب حالياً." });
    }
  });

  // API - Gemini AI Endpoints
  app.post("/api/gemini/insights", async (req, res) => {
    const { state } = req.body;
    if (!state) {
      res.status(400).json({ error: "Missing state payload" });
      return;
    }
    try {
      const insights = await generateBudgetInsights(state);
      res.status(200).json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal insight processing error" });
    }
  });

  app.post("/api/gemini/calculate-goal", async (req, res) => {
    const { name, price, targetDate, state } = req.body;
    if (!name || isNaN(Number(price)) || !targetDate || !state) {
      res.status(400).json({ error: "Required fields: name, price, targetDate, state" });
      return;
    }
    try {
      const plan = await evaluateShoppingGoal(name, Number(price), targetDate, state);
      res.status(200).json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal goal evaluation error" });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    const { message, history, state } = req.body;
    if (!message || !state) {
      res.status(400).json({ error: "Required fields: message, state" });
      return;
    }
    try {
      const reply = await handleFinancialChat(message, history || [], state);
      res.status(200).json(reply);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal AI Chat processing error" });
    }
  });

  // API - Real push notifications token registry & manual trigger
  app.post("/api/notifications/register-token", async (req, res) => {
    const { email, token, platform } = req.body;
    if (!email || !token) {
      res.status(400).json({ error: "Required fields: email, token" });
      return;
    }
    const success = await registerDeviceToken(email, token, platform || "web");
    if (success) {
      res.status(200).json({ success: true, message: "Token successfully cataloged in Postgres." });
    } else {
      res.status(500).json({ success: false, error: "Failed to catalog subscription token." });
    }
  });

  app.post("/api/notifications/trigger-scheduler", async (req, res) => {
    try {
      const report = await runScheduledNotificationsAudit();
      res.status(200).json({ success: true, report });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Trigger failure" });
    }
  });

  app.post("/api/notifications/update-status", async (req, res) => {
    const { notificationId, status } = req.body;
    if (!notificationId || !status) {
      res.status(400).json({ error: "Required fields: notificationId, status" });
      return;
    }
    try {
      if (!prisma) {
        res.status(500).json({ error: "Database client is offline." });
        return;
      }
      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status,
          read: status === "read" ? true : undefined,
        }
      });
      res.status(200).json({ success: true, updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Status update failure" });
    }
  });

  // API - PayPal Donations
  app.post("/api/paypal/create-order", async (req, res) => {
    const { amount, currency } = req.body;
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ error: "Invalid donation amount specified." });
      return;
    }
    try {
      const order = await createPayPalOrder(Number(amount), currency || "USD");
      res.status(200).json(order);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal PayPal order error" });
    }
  });

  app.post("/api/paypal/capture-order", async (req, res) => {
    const { orderId, email, amount, currency } = req.body;
    if (!orderId) {
      res.status(400).json({ error: "Required fields: orderId" });
      return;
    }
    try {
      const result = await capturePayPalOrder(orderId, email || null, Number(amount || 0), currency || "USD");
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal PayPal capture error" });
    }
  });

  app.get("/api/paypal/donations", async (req, res) => {
    try {
      if (!prisma) {
        res.status(500).json({ error: "Database is offline." });
        return;
      }
      const donations = await prisma.donation.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      res.status(200).json({ success: true, donations });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Can't fetch donation logs." });
    }
  });

  // Health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: new Date() });
  });

  // Vite middleware integration for asset pipelines
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to host 0.0.0.0 and dedicated port 3000 as mandated
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Core finance server actively listening on http://localhost:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("FATAL: Failed to launch backend sever", e);
});
