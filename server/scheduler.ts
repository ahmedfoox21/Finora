/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { prisma } from "./db";
import { sendFCMToUser } from "./push";

export async function runScheduledNotificationsAudit(): Promise<{ usersEvaluated: number; notificationsDispatched: number }> {
  if (!prisma) {
    console.error("[Scheduler] Prisma Client is not initialized.");
    return { usersEvaluated: 0, notificationsDispatched: 0 };
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        expenses: true,
        goals: true,
        borrowedRecords: true,
        notifications: true,
        additionalIncomes: true,
        fixedExpenses: true,
      }
    });

    console.log(`[Scheduler] Starting daily notification audit scanner for ${users.length} registered users...`);
    let usersEvaluated = 0;
    let notificationsDispatched = 0;

    const todayStr = new Date().toISOString().split("T")[0];

    for (const u of users) {
      usersEvaluated++;
      const lang = u.language === "en" ? "en" : "ar";

      // 1. Daily Spending Reminder (Check if no expense was registered today)
      const hadExpenseToday = u.expenses.some(e => e.date === todayStr);
      const spendReminderIdKey = `sched-daily-spend-${todayStr}`;
      
      const alreadyHasSpendReminder = u.notifications.some(n => n.id === spendReminderIdKey);
      if (!hadExpenseToday && !alreadyHasSpendReminder) {
        const payload = {
          type: "reminder",
          titleAr: "تذكير: لم تقم بتسجيل أي مصروفات اليوم! ✍️",
          titleEn: "Reminder: No expenses recorded today! ✍️",
          bodyAr: "يرجى تسجيل فنجان القهوة أو المواصلات أو البقالة لتحديث ميزانيتك اليومية للمستشار المالي.",
          bodyEn: "Please log your coffee, fare, or groceries to align your dynamic daily allowance on Finora.",
        };
        const res = await sendFCMToUser(u.id, payload);
        if (res.sentCount > 0) notificationsDispatched++;
      }

      // 2. Borrowed Money Reminder (Warm remainder if lended logs are outstanding)
      const outstandingLoans = u.borrowedRecords.filter(b => !b.isRepaid);
      for (const loan of outstandingLoans) {
        const dateLent = new Date(loan.lentDate);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - dateLent.getTime()) / (1000 * 60 * 60 * 24));
        const borrowReminder14DaysKey = `sched-borrow-14days-${loan.id}`;

        if (diffDays >= 14) {
          const alreadyHasBorrowReminder = u.notifications.some(n => n.id === borrowReminder14DaysKey);
          if (!alreadyHasBorrowReminder) {
            const payload = {
              type: "loan_reminder",
              titleAr: `تنبيه تحصيل: مرّ 14 يوماً على دين ${loan.debtorName}`,
              titleEn: `Collection alert: 14 days passed since loan to ${loan.debtorName}`,
              bodyAr: `لديك ${loan.amount - loan.repaidAmount} درهم معلقة برسم السداد من ${loan.debtorName}. هل ترغب بتسجيل تسوية؟`,
              bodyEn: `You have ${loan.amount - loan.repaidAmount} AED outstanding from ${loan.debtorName}. Reach out to recover dynamic assets.`,
            };
            const res = await sendFCMToUser(u.id, payload);
            if (res.sentCount > 0) notificationsDispatched++;
          }
        }
      }

      // 3. Goal Progress Reminder
      for (const goal of u.goals) {
        const ratio = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) : 0;
        const progress50Key = `sched-goal-50-${goal.id}`;
        const progress100Key = `sched-goal-100-${goal.id}`;

        if (ratio >= 0.5 && ratio < 1.0) {
          const hasNotif = u.notifications.some(n => n.id === progress50Key);
          if (!hasNotif) {
            const payload = {
              type: "savings_milestone",
              titleAr: `نصف الطريق لتحقيق هدفك! 🎉 (${goal.name})`,
              titleEn: `Halfway to your savings milestone! 🎉 (${goal.name})`,
              bodyAr: `لقد ادخرت أكثر من 50% من هدفك البالغ ${goal.targetAmount} درهم لشراء ${goal.name}. استمر بالادخار الملتزم!`,
              bodyEn: `You have saved over 50% of your target ${goal.targetAmount} AED for ${goal.name}. Excellent financial persistence!`,
            };
            const res = await sendFCMToUser(u.id, payload);
            if (res.sentCount > 0) notificationsDispatched++;
          }
        } else if (ratio >= 1.0) {
          const hasNotif = u.notifications.some(n => n.id === progress100Key);
          if (!hasNotif) {
            const payload = {
              type: "savings_milestone",
              titleAr: `تهانينا! حققت هدف الادخار بالكامل! 🏆 (${goal.name})`,
              titleEn: `Congratulations! Savings milestone achieved! 🏆 (${goal.name})`,
              bodyAr: `قمت بتوفير مبلغ ${goal.targetAmount} درهم اللازم لشراء ${goal.name} بنجاح. مجهود مالي ممتاز!`,
              bodyEn: `You successfully gathered the complete cost of ${goal.targetAmount} AED for ${goal.name}. Time to celebrate!`,
            };
            const res = await sendFCMToUser(u.id, payload);
            if (res.sentCount > 0) notificationsDispatched++;
          }
        }
      }

      // 4. Budget Warning (if wallet balance is under 15% of basic salary)
      const budgetWarningKey = `sched-budget-under15-${new Date().getFullYear()}-${new Date().getMonth()}`;
      const totalSpent = u.expenses.reduce((s, e) => s + e.amount, 0);
      const totalFixed = u.fixedExpenses.reduce((s, e) => s + e.amount, 0);
      const totalInflow = u.salary + u.additionalIncomes.reduce((s, i) => s + i.amount, 0);
      const balance = totalInflow - totalFixed - totalSpent;

      if (u.salary > 0 && balance > 0 && (balance / u.salary) < 0.15) {
        const hasNotif = u.notifications.some(n => n.id === budgetWarningKey);
        if (!hasNotif) {
          const payload = {
            type: "budget_warning",
            titleAr: "تنبيه مالي: ميزانيتك الجارية منخفضة جداً! ⚠️",
            titleEn: "Budget Warning: Remaining funds critically low! ⚠️",
            bodyAr: "لقد استهلكت معظم أموالك المتاحة. الرصيد المتبقي بمحفظتك يقل عن 15% من راتبك الأساسي.",
            bodyEn: "Your wallet balance has declined under 15% of your gross basic salary. Fasten spending constraints.",
          };
          const res = await sendFCMToUser(u.id, payload);
          if (res.sentCount > 0) notificationsDispatched++;
        }
      }

      // 5. AI Advice Reminder (Smart weekly advice periodic trigger)
      const weekIndex = Math.ceil(new Date().getDate() / 7);
      const adviceKey = `sched-ai-advice-w${weekIndex}-${new Date().getFullYear()}`;
      const hasAdviceNotif = u.notifications.some(n => n.id === adviceKey);
      if (!hasAdviceNotif) {
        const payload = {
          type: "reminder",
          titleAr: "نصيحة Finora الذكية لحماية مدخراتك 💡",
          titleEn: "Finora Smart Tip: Empower Your Surplus 💡",
          bodyAr: "حاول دائمًا توفير فائض الراتب في اليوم الموالي لاستلامه مباشرة في ظرف الادخار لتجنب النفقات العاطفية.",
          bodyEn: "Try direct saving allocations out of your salary on payday morning to block emotional spending cycles.",
        };
        const res = await sendFCMToUser(u.id, payload);
        if (res.sentCount > 0) notificationsDispatched++;
      }
    }

    console.log(`[Scheduler] Daily notification audit complete. Users evaluated: ${usersEvaluated}. Notifications triggered: ${notificationsDispatched}`);
    return { usersEvaluated, notificationsDispatched };
  } catch (err) {
    console.error("[Scheduler] Error executing scheduled notifications audit:", err);
    return { usersEvaluated: 0, notificationsDispatched: 0 };
  }
}

/**
 * Boots a low-overhead daemon that runs the cron processor in the container background
 */
export function startDaemonScheduler() {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  console.log("[Scheduler] Background audit daemon successfully spawned. Scans scheduled execution loop every 24 hours.");
  
  // First run in 1 minute to avoid blocking cold starts
  setTimeout(() => {
    runScheduledNotificationsAudit().catch(console.error);
  }, 60 * 1000);

  setInterval(() => {
    runScheduledNotificationsAudit().catch(console.error);
  }, TWENTY_FOUR_HOURS);
}
