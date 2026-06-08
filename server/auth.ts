/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from "crypto";
import { prisma } from "./db";
import { AppState } from "../src/types";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function registerUser(email: string, passwordPlain: string): Promise<{ success: boolean; msg: string }> {
  const normEmail = email.trim().toLowerCase();
  if (!normEmail) return { success: false, msg: "البريد الإلكتروني مطلوب" };
  if (passwordPlain.length < 6) return { success: false, msg: "كلمة المرور يجب أن لا تقل عن 6 أحرف" };

  if (!prisma) {
    return { success: false, msg: "قاعدة البيانات غير مهيأة حالياً. يرجى إعداد DATABASE_URL." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: normEmail } });
    if (existing) {
      return { success: false, msg: "الحساب موجود بالفعل / Account already exists" };
    }

    await prisma.user.create({
      data: {
        email: normEmail,
        passwordHash: hashPassword(passwordPlain),
      },
    });

    return { success: true, msg: "تم تسجيل الحساب بنجاح!" };
  } catch (error: any) {
    console.error("Prisma registerUser error:", error);
    return { success: false, msg: "فشل الاتصال بقاعدة البيانات: " + (error?.message || error) };
  }
}

export async function loginUser(email: string, passwordPlain: string): Promise<{ success: boolean; user?: { email: string }; msg: string }> {
  const normEmail = email.trim().toLowerCase();
  if (!prisma) {
    return { success: false, msg: "قاعدة البيانات غير مهيأة حالياً." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normEmail },
    });

    if (!user) {
      return { success: false, msg: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    const hash = hashPassword(passwordPlain);
    if (user.passwordHash !== hash) {
      return { success: false, msg: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    return { success: true, user: { email: user.email }, msg: "تم تسجيل الدخول بنجاح!" };
  } catch (error: any) {
    console.error("Prisma loginUser error:", error);
    return { success: false, msg: "خلل في الوصول لقاعدة البيانات." };
  }
}

export async function getSyncedState(email: string): Promise<AppState | null> {
  const normEmail = email.trim().toLowerCase();
  if (!prisma) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { email: normEmail },
      include: {
        fixedExpenses: true,
        additionalIncomes: true,
        expenses: true,
        goals: true,
        borrowedRecords: true,
        notifications: true,
        aiInsights: true,
      },
    });

    if (!user) return null;

    // Convert Prisma relations to standard AppState format
    const state: AppState = {
      salary: user.salary,
      salaryDate: user.salaryDate,
      language: user.language === "en" ? "en" : "ar",
      isSetupCompleted: user.isSetupCompleted,
      fixedExpenses: user.fixedExpenses.map(item => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        category: item.category,
        isAIDetected: item.isAIDetected,
        confidenceScore: item.confidenceScore || undefined,
      })),
      additionalIncomes: user.additionalIncomes.map(item => ({
        id: item.id,
        source: item.source,
        amount: item.amount,
      })),
      debtsAndDiscounts: [],
      expenses: user.expenses.map(item => ({
        id: item.id,
        amount: item.amount,
        category: item.category,
        note: item.note || undefined,
        date: item.date,
        isUnclassified: item.isUnclassified,
      })),
      goals: user.goals.map(item => ({
        id: item.id,
        name: item.name,
        targetAmount: item.targetAmount,
        savedAmount: item.savedAmount,
        targetDate: item.targetDate,
        imagePrompt: item.imagePrompt || undefined,
        imageUrl: item.imageUrl || undefined,
      })),
      borrowedRecords: user.borrowedRecords.map(item => ({
        id: item.id,
        debtorName: item.debtorName,
        amount: item.amount,
        lentDate: item.lentDate,
        dueDate: item.dueDate || undefined,
        notes: item.notes || undefined,
        isRepaid: item.isRepaid,
        repaidAmount: item.repaidAmount,
      })),
      notifications: user.notifications.map(item => ({
        id: item.id,
        type: item.type as any,
        titleEn: item.titleEn,
        titleAr: item.titleAr,
        bodyEn: item.bodyEn,
        bodyAr: item.bodyAr,
        date: item.date.toISOString(),
        read: item.read,
      })),
      aiInsights: user.aiInsights.map(item => ({
        id: item.id,
        textEn: item.textEn,
        textAr: item.textAr,
        category: item.category as any,
        created_at: item.createdAt.toISOString(),
      })),
      userEmail: user.email,
      isLoggedIn: true,
      syncEnabled: true,
    };

    return state;
  } catch (error) {
    console.error("Prisma getSyncedState error:", error);
    return null;
  }
}

export async function syncState(email: string, state: AppState): Promise<boolean> {
  const normEmail = email.trim().toLowerCase();
  if (!prisma) return false;

  try {
    const user = await prisma.user.findUnique({
      where: { email: normEmail }
    });

    if (!user) return false;

    // Use a robust relational transaction sync
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          salary: Number(state.salary || 0),
          salaryDate: Number(state.salaryDate || 25),
          language: state.language || "ar",
          isSetupCompleted: !!state.isSetupCompleted
        }
      }),

      prisma.fixedExpense.deleteMany({ where: { userId: user.id } }),
      prisma.additionalIncome.deleteMany({ where: { userId: user.id } }),
      prisma.expense.deleteMany({ where: { userId: user.id } }),
      prisma.savingGoal.deleteMany({ where: { userId: user.id } }),
      prisma.borrowRecord.deleteMany({ where: { userId: user.id } }),
      prisma.notification.deleteMany({ where: { userId: user.id } }),
      prisma.aIInsight.deleteMany({ where: { userId: user.id } }),

      prisma.fixedExpense.createMany({
        data: (state.fixedExpenses || []).map(item => ({
          id: item.id,
          userId: user.id,
          name: item.name,
          amount: Number(item.amount || 0),
          category: item.category || "Bills",
          isAIDetected: !!item.isAIDetected,
          confidenceScore: item.confidenceScore || null,
        }))
      }),

      prisma.additionalIncome.createMany({
        data: (state.additionalIncomes || []).map(item => ({
          id: item.id,
          userId: user.id,
          source: item.source,
          amount: Number(item.amount || 0),
        }))
      }),

      prisma.expense.createMany({
        data: (state.expenses || []).map(item => ({
          id: item.id,
          userId: user.id,
          amount: Number(item.amount || 0),
          category: item.category || "Unclassified",
          note: item.note || null,
          date: item.date,
          isUnclassified: !!item.isUnclassified,
        }))
      }),

      prisma.savingGoal.createMany({
        data: (state.goals || []).map(item => ({
          id: item.id,
          userId: user.id,
          name: item.name,
          targetAmount: Number(item.targetAmount || 0),
          savedAmount: Number(item.savedAmount || 0),
          targetDate: item.targetDate,
          imagePrompt: item.imagePrompt || null,
          imageUrl: item.imageUrl || null,
        }))
      }),

      prisma.borrowRecord.createMany({
        data: (state.borrowedRecords || []).map(item => ({
          id: item.id,
          userId: user.id,
          debtorName: item.debtorName,
          amount: Number(item.amount || 0),
          lentDate: item.lentDate,
          dueDate: item.dueDate || null,
          notes: item.notes || null,
          isRepaid: !!item.isRepaid,
          repaidAmount: Number(item.repaidAmount || 0),
        }))
      }),

      prisma.notification.createMany({
        data: (state.notifications || []).map(item => ({
          id: item.id,
          userId: user.id,
          type: item.type,
          titleEn: item.titleEn,
          titleAr: item.titleAr,
          bodyEn: item.bodyEn,
          bodyAr: item.bodyAr,
          read: !!item.read,
          date: item.date ? new Date(item.date) : new Date(),
        }))
      }),

      prisma.aIInsight.createMany({
        data: (state.aiInsights || []).map(item => ({
          id: item.id,
          userId: user.id,
          category: item.category,
          textEn: item.textEn,
          textAr: item.textAr,
          createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        }))
      })
    ]);

    return true;
  } catch (error) {
    console.error("Prisma syncState failure:", error);
    return false;
  }
}
