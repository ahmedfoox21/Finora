var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");

// server/auth.ts
var import_crypto = __toESM(require("crypto"), 1);

// server/db.ts
var import_client = require("@prisma/client");
var prisma;
try {
  prisma = new import_client.PrismaClient({
    log: ["error", "warn"]
  });
} catch (error) {
  console.error("Failed to initialize Prisma Client", error);
  prisma = null;
}

// server/auth.ts
function hashPassword(password) {
  return import_crypto.default.createHash("sha256").update(password).digest("hex");
}
async function registerUser(email, passwordPlain) {
  const normEmail = email.trim().toLowerCase();
  if (!normEmail) return { success: false, msg: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628" };
  if (passwordPlain.length < 6) return { success: false, msg: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 6 \u0623\u062D\u0631\u0641" };
  if (!prisma) {
    return { success: false, msg: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u0647\u064A\u0623\u0629 \u062D\u0627\u0644\u064A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0625\u0639\u062F\u0627\u062F DATABASE_URL." };
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email: normEmail } });
    if (existing) {
      return { success: false, msg: "\u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0648\u062C\u0648\u062F \u0628\u0627\u0644\u0641\u0639\u0644 / Account already exists" };
    }
    await prisma.user.create({
      data: {
        email: normEmail,
        passwordHash: hashPassword(passwordPlain)
      }
    });
    return { success: true, msg: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0646\u062C\u0627\u062D!" };
  } catch (error) {
    console.error("Prisma registerUser error:", error);
    return { success: false, msg: "\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A: " + (error?.message || error) };
  }
}
async function loginUser(email, passwordPlain) {
  const normEmail = email.trim().toLowerCase();
  if (!prisma) {
    return { success: false, msg: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u0647\u064A\u0623\u0629 \u062D\u0627\u0644\u064A\u0627\u064B." };
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: normEmail }
    });
    if (!user) {
      return { success: false, msg: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" };
    }
    const hash = hashPassword(passwordPlain);
    if (user.passwordHash !== hash) {
      return { success: false, msg: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" };
    }
    return { success: true, user: { email: user.email }, msg: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0646\u062C\u0627\u062D!" };
  } catch (error) {
    console.error("Prisma loginUser error:", error);
    return { success: false, msg: "\u062E\u0644\u0644 \u0641\u064A \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A." };
  }
}
async function getSyncedState(email) {
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
        aiInsights: true
      }
    });
    if (!user) return null;
    const state = {
      salary: user.salary,
      salaryDate: user.salaryDate,
      language: user.language === "en" ? "en" : "ar",
      isSetupCompleted: user.isSetupCompleted,
      fixedExpenses: user.fixedExpenses.map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        category: item.category,
        isAIDetected: item.isAIDetected,
        confidenceScore: item.confidenceScore || void 0
      })),
      additionalIncomes: user.additionalIncomes.map((item) => ({
        id: item.id,
        source: item.source,
        amount: item.amount
      })),
      debtsAndDiscounts: [],
      expenses: user.expenses.map((item) => ({
        id: item.id,
        amount: item.amount,
        category: item.category,
        note: item.note || void 0,
        date: item.date,
        isUnclassified: item.isUnclassified
      })),
      goals: user.goals.map((item) => ({
        id: item.id,
        name: item.name,
        targetAmount: item.targetAmount,
        savedAmount: item.savedAmount,
        targetDate: item.targetDate,
        imagePrompt: item.imagePrompt || void 0,
        imageUrl: item.imageUrl || void 0
      })),
      borrowedRecords: user.borrowedRecords.map((item) => ({
        id: item.id,
        debtorName: item.debtorName,
        amount: item.amount,
        lentDate: item.lentDate,
        dueDate: item.dueDate || void 0,
        notes: item.notes || void 0,
        isRepaid: item.isRepaid,
        repaidAmount: item.repaidAmount
      })),
      notifications: user.notifications.map((item) => ({
        id: item.id,
        type: item.type,
        titleEn: item.titleEn,
        titleAr: item.titleAr,
        bodyEn: item.bodyEn,
        bodyAr: item.bodyAr,
        date: item.date.toISOString(),
        read: item.read
      })),
      aiInsights: user.aiInsights.map((item) => ({
        id: item.id,
        textEn: item.textEn,
        textAr: item.textAr,
        category: item.category,
        created_at: item.createdAt.toISOString()
      })),
      userEmail: user.email,
      isLoggedIn: true,
      syncEnabled: true
    };
    return state;
  } catch (error) {
    console.error("Prisma getSyncedState error:", error);
    return null;
  }
}
async function syncState(email, state) {
  const normEmail = email.trim().toLowerCase();
  if (!prisma) return false;
  try {
    const user = await prisma.user.findUnique({
      where: { email: normEmail }
    });
    if (!user) return false;
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
        data: (state.fixedExpenses || []).map((item) => ({
          id: item.id,
          userId: user.id,
          name: item.name,
          amount: Number(item.amount || 0),
          category: item.category || "Bills",
          isAIDetected: !!item.isAIDetected,
          confidenceScore: item.confidenceScore || null
        }))
      }),
      prisma.additionalIncome.createMany({
        data: (state.additionalIncomes || []).map((item) => ({
          id: item.id,
          userId: user.id,
          source: item.source,
          amount: Number(item.amount || 0)
        }))
      }),
      prisma.expense.createMany({
        data: (state.expenses || []).map((item) => ({
          id: item.id,
          userId: user.id,
          amount: Number(item.amount || 0),
          category: item.category || "Unclassified",
          note: item.note || null,
          date: item.date,
          isUnclassified: !!item.isUnclassified
        }))
      }),
      prisma.savingGoal.createMany({
        data: (state.goals || []).map((item) => ({
          id: item.id,
          userId: user.id,
          name: item.name,
          targetAmount: Number(item.targetAmount || 0),
          savedAmount: Number(item.savedAmount || 0),
          targetDate: item.targetDate,
          imagePrompt: item.imagePrompt || null,
          imageUrl: item.imageUrl || null
        }))
      }),
      prisma.borrowRecord.createMany({
        data: (state.borrowedRecords || []).map((item) => ({
          id: item.id,
          userId: user.id,
          debtorName: item.debtorName,
          amount: Number(item.amount || 0),
          lentDate: item.lentDate,
          dueDate: item.dueDate || null,
          notes: item.notes || null,
          isRepaid: !!item.isRepaid,
          repaidAmount: Number(item.repaidAmount || 0)
        }))
      }),
      prisma.notification.createMany({
        data: (state.notifications || []).map((item) => ({
          id: item.id,
          userId: user.id,
          type: item.type,
          titleEn: item.titleEn,
          titleAr: item.titleAr,
          bodyEn: item.bodyEn,
          bodyAr: item.bodyAr,
          read: !!item.read,
          date: item.date ? new Date(item.date) : /* @__PURE__ */ new Date()
        }))
      }),
      prisma.aIInsight.createMany({
        data: (state.aiInsights || []).map((item) => ({
          id: item.id,
          userId: user.id,
          category: item.category,
          textEn: item.textEn,
          textAr: item.textAr,
          createdAt: item.created_at ? new Date(item.created_at) : /* @__PURE__ */ new Date()
        }))
      })
    ]);
    return true;
  } catch (error) {
    console.error("Prisma syncState failure:", error);
    return false;
  }
}

// server/gemini.ts
var import_genai = require("@google/genai");
var aiInstance = null;
function getGeminiClient() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini features will run in mock-intelligence fallback mode.");
      return null;
    }
    aiInstance = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}
function getMockInsights(state) {
  const totalSpent = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = state.salary + state.additionalIncomes.reduce((s, i) => s + i.amount, 0) - totalSpent;
  return {
    dailyFeedbackEn: `You have spent a total of ${totalSpent} AED this month. You have ${remaining} AED left. Keep tracking your daily coffee and transport expenses to maximize your end-of-month savings goal!`,
    dailyFeedbackAr: `\u0644\u0642\u062F \u0623\u0646\u0641\u0642\u062A \u0645\u0627 \u0645\u062C\u0645\u0648\u0639\u0647 ${totalSpent} \u062F\u0631\u0647\u0645 \u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631. \u0645\u062A\u0628\u0642\u064A \u0644\u062F\u064A\u0643 \u062D\u0627\u0644\u064A\u064B\u0627 ${remaining} \u062F\u0631\u0647\u0645. \u0627\u0633\u062A\u0645\u0631 \u0641\u064A \u062A\u0633\u062C\u064A\u0644 \u0645\u0635\u0631\u0648\u0641\u0627\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0645\u062B\u0644 \u0627\u0644\u0642\u0647\u0648\u0629 \u0648\u0627\u0644\u0645\u0648\u0627\u0635\u0644\u0627\u062A \u0644\u062A\u062D\u0642\u064A\u0642 \u0623\u0647\u062F\u0627\u0641\u0643 \u0627\u0644\u0627\u062F\u062E\u0627\u0631\u064A\u0629 \u0628\u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0634\u0647\u0631!`,
    detectedRecurringExpenses: state.expenses.length > 3 ? [
      {
        name: "Estimated Telecom Bill",
        estimatedAmount: 150,
        category: "Bills",
        confidence: 85,
        explanationEn: "We detected repeated custom transactions in the transport/bills category. Consider designating this as a fixed monthly item.",
        explanationAr: "\u0644\u0642\u062F \u0631\u0635\u062F\u0646\u0627 \u0645\u0639\u0627\u0645\u0644\u0627\u062A \u0645\u0643\u0631\u0631\u0629 \u0641\u064A \u0641\u0626\u0629 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631/\u0627\u0644\u0645\u0648\u0627\u0635\u0644\u0627\u062A. \u0646\u0642\u062A\u0631\u062D \u062A\u0635\u0646\u064A\u0641 \u0647\u0630\u0627 \u0643\u0645\u0635\u0631\u0648\u0641 \u0634\u0647\u0631\u064A \u062B\u0627\u0628\u062A."
      }
    ] : []
  };
}
function getMockGoal(name, price, targetDays) {
  const daily = Math.ceil(price / Math.max(1, targetDays));
  const weekly = daily * 7;
  const expDate = /* @__PURE__ */ new Date();
  expDate.setDate(expDate.getDate() + targetDays);
  return {
    dailySavingsRequired: daily,
    weeklySavingsRequired: weekly,
    expectedDate: expDate.toISOString().split("T")[0],
    strategyEn: `To buy ${name} in ${targetDays} days, try preparing your meals at home to save around ${daily} AED daily, and direct the difference to your savings jar immediately!`,
    strategyAr: `\u0644\u0634\u0631\u0627\u0621 ${name} \u062E\u0644\u0627\u0644 ${targetDays} \u064A\u0648\u0645\u064B\u0627\u060C \u062D\u0627\u0648\u0644 \u0625\u0639\u062F\u0627\u062F \u0648\u062C\u0628\u0627\u062A\u0643 \u0641\u064A \u0627\u0644\u0645\u0646\u0632\u0644 \u0644\u062A\u0648\u0641\u064A\u0631 \u062D\u0648\u0627\u0644\u064A ${daily} \u062F\u0631\u0647\u0645 \u064A\u0648\u0645\u064A\u064B\u0627\u060C \u0648\u062A\u062D\u0648\u064A\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0628\u0644\u063A \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u062D\u0635\u0627\u0644\u0629 \u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0627\u0644\u0645\u062E\u0635\u0635\u0629!`,
    imagePrompt: `A beautiful minimalist graphic showing a glowing tech device or travel destination as a saving focus icon, modern, luxury finance visual style`
  };
}
async function generateBudgetInsights(state) {
  const ai = getGeminiClient();
  if (!ai) return getMockInsights(state);
  const simplifiedExpenses = state.expenses.map((e) => ({
    amount: e.amount,
    category: e.category,
    date: e.date,
    note: e.note || ""
  }));
  const simplifiedFixed = state.fixedExpenses.map((f) => ({
    name: f.name,
    amount: f.amount,
    category: f.category
  }));
  const prompt = `
    Analyze the following user's financial profile.
    Total Salary: ${state.salary} (received on day ${state.salaryDate} of the month)
    Additional Incomes: ${JSON.stringify(state.additionalIncomes)}
    Active Fixed Cost List: ${JSON.stringify(simplifiedFixed)}
    Actual Registered Expenses list for this month: ${JSON.stringify(simplifiedExpenses)}

    Your tasks:
    1. Scan the registered expenses to detect repeating costs or behaviors that DO NOT exist in the "Active Fixed Cost List". If you notice repeated amounts on related dates (like weekly subscription, recurring internet, same-amount transport, or monthly gym bills), extract them representing a potential fixed recurring expense. Give confidenceScore (0-100).
    2. Review their spending patterns. Formulate a direct, personalized, non-generic insight/feedback text for today in BOTH English and Arabic.
       - Focus on encouraging savers.
       - Sound highly professional, like an elite private banker. Avoid clunky AI-sounding sentences. Use practical, humble language.
       - Refer specifically to the actual input categories/amounts, not just hypothetical advice.

    Return the final result strictly as a valid JSON matching this schema:
    {
      "dailyFeedbackEn": "string",
      "dailyFeedbackAr": "string",
      "detectedRecurringExpenses": [
        {
          "name": "string (representing the service or item custom name)",
          "estimatedAmount": number,
          "category": "string (one of: Food, Coffee, Transport, Shopping, Entertainment, Bills, Groceries, Fuel)",
          "confidenceScore": number (0 to 100),
          "explanationEn": "string explaining how you detected it",
          "explanationAr": "string explaining how you detected it in Arabic"
        }
      ]
    }
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            dailyFeedbackEn: { type: import_genai.Type.STRING },
            dailyFeedbackAr: { type: import_genai.Type.STRING },
            detectedRecurringExpenses: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  name: { type: import_genai.Type.STRING },
                  estimatedAmount: { type: import_genai.Type.NUMBER },
                  category: { type: import_genai.Type.STRING },
                  confidenceScore: { type: import_genai.Type.INTEGER },
                  explanationEn: { type: import_genai.Type.STRING },
                  explanationAr: { type: import_genai.Type.STRING }
                },
                required: ["name", "estimatedAmount", "category", "confidenceScore", "explanationEn", "explanationAr"]
              }
            }
          },
          required: ["dailyFeedbackEn", "dailyFeedbackAr", "detectedRecurringExpenses"]
        },
        systemInstruction: "You are an elite, highly professional personal banking advisor. You write concise financial analysis with numerical evidence. You speak both English and flawless Arabic."
      }
    });
    const parsed = JSON.parse(response.text?.trim() || "{}");
    return parsed;
  } catch (error) {
    console.error("Gemini insights API failed", error);
    return getMockInsights(state);
  }
}
async function evaluateShoppingGoal(goalName, targetAmount, targetDate, state) {
  const ai = getGeminiClient();
  const today = /* @__PURE__ */ new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24)) || 30;
  if (!ai) return getMockGoal(goalName, targetAmount, diffDays);
  const totalSpent = state.expenses.reduce((s, e) => s + e.amount, 0);
  const fixedTotal = state.fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = state.salary + state.additionalIncomes.reduce((s, i) => s + i.amount, 0);
  const netDisposableMonth = totalIncome - fixedTotal;
  const prompt = `
    The user wants to buy: "${goalName}"
    Price: ${targetAmount} AED
    Target Date: ${targetDate} (${diffDays} days from today)
    Let's help them with a savings plan based on their salary context:
    Total Income: ${totalIncome} AED/month
    Fixed Expenses: ${fixedTotal} AED/month
    Net Disposable Income: ${netDisposableMonth} AED/month
    Current spent this month: ${totalSpent} AED

    Task:
    Provide daily and weekly savings requirements to afford this goal on time. Provide a custom motivational saving tactic in both English and Arabic. Recommend lifestyle budget cuts specific to their budget size. Include a high-quality visual representation 'imagePrompt' description (strictly under 15 words) for later rendering assets.

    Return JSON as:
    {
      "dailySavingsRequired": number,
      "weeklySavingsRequired": number,
      "expectedDate": "YYYY-MM-DD",
      "strategyEn": "string",
      "strategyAr": "string",
      "imagePrompt": "string"
    }
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            dailySavingsRequired: { type: import_genai.Type.NUMBER },
            weeklySavingsRequired: { type: import_genai.Type.NUMBER },
            expectedDate: { type: import_genai.Type.STRING },
            strategyEn: { type: import_genai.Type.STRING },
            strategyAr: { type: import_genai.Type.STRING },
            imagePrompt: { type: import_genai.Type.STRING }
          },
          required: ["dailySavingsRequired", "weeklySavingsRequired", "expectedDate", "strategyEn", "strategyAr", "imagePrompt"]
        }
      }
    });
    const parsed = JSON.parse(response.text?.trim() || "{}");
    return parsed;
  } catch (error) {
    console.error("Gemini goal eval failed", error);
    return getMockGoal(goalName, targetAmount, diffDays);
  }
}
async function handleFinancialChat(message, history, state) {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      replyEn: "I'm online but running in localized mode. Let me know if you spent any amount like: 50 AED for Food or Coffee, and I will extract it for you!",
      replyAr: "\u0623\u0646\u0627 \u0645\u062A\u0635\u0644 \u0628\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0645\u062D\u0644\u064A \u0627\u0644\u0645\u0624\u0642\u062A. \u0623\u062E\u0628\u0631\u0646\u064A \u0643\u0645 \u0623\u0646\u0641\u0642\u062A \u0627\u0644\u064A\u0648\u0645 (\u0645\u062B\u0627\u0644: 50 \u062F\u0631\u0647\u0645 \u0642\u0647\u0648\u0629)\u060C \u0648\u0633\u0623\u0633\u0627\u0639\u062F\u0643 \u0641\u064A \u062A\u0633\u062C\u064A\u0644 \u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0641\u0648\u0631\u0627\u064B!",
      suggestedExpense: message.includes("50") ? { amount: 50, category: "Coffee", note: "\u0642\u0647\u0648\u0629" } : void 0
    };
  }
  const promptHistory = history.map((h) => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.text }]
  }));
  const userContext = `
    User state for reference:
    Salary: ${state.salary} AED
    Remaining budget context: ${state.salary - state.expenses.reduce((s, e) => s + e.amount, 0)} AED
    All categories available: Food, Coffee, Transport, Shopping, Entertainment, Bills, Groceries, Fuel, Unclassified.

    SPECIAL ROLE:
    If the user is trying to find out what they spent today because they selected "I don't remember" (\u0644\u0627 \u0623\u062A\u0630\u0643\u0631) or said similar:
    Ask them logical, progressive step-by-step questions:
    - Step 1: Ask how much cash/bank balance they started the day with (e.g., wallet at 8 AM).
    - Step 2: Ask how much cash/bank balance they hold right now.
    - Step 3: Compute the difference and ask if they paid specific items (like coffee, parking, bills, lunch) with that difference.
    Help them narrow down what is missing and construct a friendly estimate.
    If the calculation is completed and they authorize or confirm an amount, extract the structural 'suggestedExpense' so the wallet records it properly!
    Make the suggestedExpense category match 'Unclassified' if unsure or the specific matching category.

    Return the reply as a structured JSON:
    {
      "replyEn": "A comprehensive direct reply in English",
      "replyAr": "A comprehensive direct reply in Arabic (flawless, natural Arabic financial dialect)",
      "suggestedExpense": {
        "amount": number,
        "category": "Food | Coffee | Transport | Shopping | Entertainment | Bills | Groceries | Fuel | Unclassified",
        "note": "A summary note describing what was extracted"
      }, // OPTIONAL. Only populate if user acknowledges or confirms a particular transaction that was spent today.
      "askingQuestionId": "wallet_start | wallet_end | did_buy_food | did_pay_bill | none" // Current wizard state if in memory recall mode
    }
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: userContext }] },
        ...promptHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            replyEn: { type: import_genai.Type.STRING },
            replyAr: { type: import_genai.Type.STRING },
            suggestedExpense: {
              type: import_genai.Type.OBJECT,
              properties: {
                amount: { type: import_genai.Type.NUMBER },
                category: { type: import_genai.Type.STRING },
                note: { type: import_genai.Type.STRING }
              },
              required: ["amount", "category", "note"]
            },
            askingQuestionId: { type: import_genai.Type.STRING }
          },
          required: ["replyEn", "replyAr"]
        },
        systemInstruction: "You are Al-Ameen (\u0627\u0644\u062E\u0628\u064A\u0631 \u0627\u0644\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0633\u0627\u0639\u062F), a helpful financial tracker assistant speaking flawless English and natural Arabic. You guide users step by step to calculate and record forgotten daily gastos."
      }
    });
    const parsed = JSON.parse(response.text?.trim() || "{}");
    return parsed;
  } catch (error) {
    console.error("Gemini Chat helper failed", error);
    return {
      replyEn: "I encountered a processing glitch. I can still help you estimate: Tell me your pocket balance this morning and what you have left now!",
      replyAr: "\u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u0635\u063A\u064A\u0631\u0629 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0646\u0635. \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0628\u0627\u0644\u062A\u0642\u062F\u064A\u0631 \u0628\u0630\u0643\u0627\u0621: \u0623\u062E\u0628\u0631\u0646\u064A \u0643\u0645 \u0643\u0627\u0646 \u0645\u0639\u0643 \u0645\u0646 \u0645\u0627\u0644 \u0635\u0628\u0627\u062D \u0627\u0644\u064A\u0648\u0645 \u0648 \u0643\u0645 \u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0627\u0644\u0622\u0646!"
    };
  }
}

// server/push.ts
var admin = __toESM(require("firebase-admin"), 1);
var isFirebaseInitialized = false;
function initializeFirebaseAdmin() {
  if (isFirebaseInitialized) return true;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : void 0;
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
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
async function registerDeviceToken(email, token, platform = "web") {
  const normEmail = email.trim().toLowerCase();
  if (!prisma) return false;
  try {
    const user = await prisma.user.findUnique({
      where: { email: normEmail }
    });
    if (!user) return false;
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
async function sendFCMToUser(userId, payload) {
  if (!prisma) return { sentCount: 0, success: false };
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        titleEn: payload.titleEn,
        titleAr: payload.titleAr,
        bodyEn: payload.bodyEn,
        bodyAr: payload.bodyAr,
        status: "sent",
        read: false
      }
    });
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
              body: displayBody
            },
            data: {
              notificationId: notification.id,
              type: payload.type
            },
            android: {
              priority: "high",
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
        } catch (fcmError) {
          console.error(`[Push Service] Failed delivering push token ${t.token}:`, fcmError?.message || fcmError);
          if (fcmError?.code === "messaging/registration-token-not-registered" || fcmError?.code === "messaging/invalid-registration-token") {
            await prisma.deviceToken.delete({ where: { id: t.id } }).catch(() => {
            });
          }
        }
      }
    } else {
      console.log(`[Push Emulator] FCM mock success. Title: "${displayTitle}" | Body: "${displayBody}" to ${tokens.length} device tokens.`);
      deliveredCount = tokens.length;
    }
    if (deliveredCount > 0) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: "delivered",
          deliveredAt: /* @__PURE__ */ new Date()
        }
      });
    }
    return { sentCount: deliveredCount, success: true };
  } catch (err) {
    console.error("[Push Service] Failed processing push trigger:", err);
    return { sentCount: 0, success: false };
  }
}

// server/scheduler.ts
async function runScheduledNotificationsAudit() {
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
        fixedExpenses: true
      }
    });
    console.log(`[Scheduler] Starting daily notification audit scanner for ${users.length} registered users...`);
    let usersEvaluated = 0;
    let notificationsDispatched = 0;
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    for (const u of users) {
      usersEvaluated++;
      const lang = u.language === "en" ? "en" : "ar";
      const hadExpenseToday = u.expenses.some((e) => e.date === todayStr);
      const spendReminderIdKey = `sched-daily-spend-${todayStr}`;
      const alreadyHasSpendReminder = u.notifications.some((n) => n.id === spendReminderIdKey);
      if (!hadExpenseToday && !alreadyHasSpendReminder) {
        const payload = {
          type: "reminder",
          titleAr: "\u062A\u0630\u0643\u064A\u0631: \u0644\u0645 \u062A\u0642\u0645 \u0628\u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u064A\u0648\u0645! \u270D\uFE0F",
          titleEn: "Reminder: No expenses recorded today! \u270D\uFE0F",
          bodyAr: "\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0641\u0646\u062C\u0627\u0646 \u0627\u0644\u0642\u0647\u0648\u0629 \u0623\u0648 \u0627\u0644\u0645\u0648\u0627\u0635\u0644\u0627\u062A \u0623\u0648 \u0627\u0644\u0628\u0642\u0627\u0644\u0629 \u0644\u062A\u062D\u062F\u064A\u062B \u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0644\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u0645\u0627\u0644\u064A.",
          bodyEn: "Please log your coffee, fare, or groceries to align your dynamic daily allowance on Finora."
        };
        const res = await sendFCMToUser(u.id, payload);
        if (res.sentCount > 0) notificationsDispatched++;
      }
      const outstandingLoans = u.borrowedRecords.filter((b) => !b.isRepaid);
      for (const loan of outstandingLoans) {
        const dateLent = new Date(loan.lentDate);
        const today = /* @__PURE__ */ new Date();
        const diffDays = Math.floor((today.getTime() - dateLent.getTime()) / (1e3 * 60 * 60 * 24));
        const borrowReminder14DaysKey = `sched-borrow-14days-${loan.id}`;
        if (diffDays >= 14) {
          const alreadyHasBorrowReminder = u.notifications.some((n) => n.id === borrowReminder14DaysKey);
          if (!alreadyHasBorrowReminder) {
            const payload = {
              type: "loan_reminder",
              titleAr: `\u062A\u0646\u0628\u064A\u0647 \u062A\u062D\u0635\u064A\u0644: \u0645\u0631\u0651 14 \u064A\u0648\u0645\u0627\u064B \u0639\u0644\u0649 \u062F\u064A\u0646 ${loan.debtorName}`,
              titleEn: `Collection alert: 14 days passed since loan to ${loan.debtorName}`,
              bodyAr: `\u0644\u062F\u064A\u0643 ${loan.amount - loan.repaidAmount} \u062F\u0631\u0647\u0645 \u0645\u0639\u0644\u0642\u0629 \u0628\u0631\u0633\u0645 \u0627\u0644\u0633\u062F\u0627\u062F \u0645\u0646 ${loan.debtorName}. \u0647\u0644 \u062A\u0631\u063A\u0628 \u0628\u062A\u0633\u062C\u064A\u0644 \u062A\u0633\u0648\u064A\u0629\u061F`,
              bodyEn: `You have ${loan.amount - loan.repaidAmount} AED outstanding from ${loan.debtorName}. Reach out to recover dynamic assets.`
            };
            const res = await sendFCMToUser(u.id, payload);
            if (res.sentCount > 0) notificationsDispatched++;
          }
        }
      }
      for (const goal of u.goals) {
        const ratio = goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0;
        const progress50Key = `sched-goal-50-${goal.id}`;
        const progress100Key = `sched-goal-100-${goal.id}`;
        if (ratio >= 0.5 && ratio < 1) {
          const hasNotif = u.notifications.some((n) => n.id === progress50Key);
          if (!hasNotif) {
            const payload = {
              type: "savings_milestone",
              titleAr: `\u0646\u0635\u0641 \u0627\u0644\u0637\u0631\u064A\u0642 \u0644\u062A\u062D\u0642\u064A\u0642 \u0647\u062F\u0641\u0643! \u{1F389} (${goal.name})`,
              titleEn: `Halfway to your savings milestone! \u{1F389} (${goal.name})`,
              bodyAr: `\u0644\u0642\u062F \u0627\u062F\u062E\u0631\u062A \u0623\u0643\u062B\u0631 \u0645\u0646 50% \u0645\u0646 \u0647\u062F\u0641\u0643 \u0627\u0644\u0628\u0627\u0644\u063A ${goal.targetAmount} \u062F\u0631\u0647\u0645 \u0644\u0634\u0631\u0627\u0621 ${goal.name}. \u0627\u0633\u062A\u0645\u0631 \u0628\u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0627\u0644\u0645\u0644\u062A\u0632\u0645!`,
              bodyEn: `You have saved over 50% of your target ${goal.targetAmount} AED for ${goal.name}. Excellent financial persistence!`
            };
            const res = await sendFCMToUser(u.id, payload);
            if (res.sentCount > 0) notificationsDispatched++;
          }
        } else if (ratio >= 1) {
          const hasNotif = u.notifications.some((n) => n.id === progress100Key);
          if (!hasNotif) {
            const payload = {
              type: "savings_milestone",
              titleAr: `\u062A\u0647\u0627\u0646\u064A\u0646\u0627! \u062D\u0642\u0642\u062A \u0647\u062F\u0641 \u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0628\u0627\u0644\u0643\u0627\u0645\u0644! \u{1F3C6} (${goal.name})`,
              titleEn: `Congratulations! Savings milestone achieved! \u{1F3C6} (${goal.name})`,
              bodyAr: `\u0642\u0645\u062A \u0628\u062A\u0648\u0641\u064A\u0631 \u0645\u0628\u0644\u063A ${goal.targetAmount} \u062F\u0631\u0647\u0645 \u0627\u0644\u0644\u0627\u0632\u0645 \u0644\u0634\u0631\u0627\u0621 ${goal.name} \u0628\u0646\u062C\u0627\u062D. \u0645\u062C\u0647\u0648\u062F \u0645\u0627\u0644\u064A \u0645\u0645\u062A\u0627\u0632!`,
              bodyEn: `You successfully gathered the complete cost of ${goal.targetAmount} AED for ${goal.name}. Time to celebrate!`
            };
            const res = await sendFCMToUser(u.id, payload);
            if (res.sentCount > 0) notificationsDispatched++;
          }
        }
      }
      const budgetWarningKey = `sched-budget-under15-${(/* @__PURE__ */ new Date()).getFullYear()}-${(/* @__PURE__ */ new Date()).getMonth()}`;
      const totalSpent = u.expenses.reduce((s, e) => s + e.amount, 0);
      const totalFixed = u.fixedExpenses.reduce((s, e) => s + e.amount, 0);
      const totalInflow = u.salary + u.additionalIncomes.reduce((s, i) => s + i.amount, 0);
      const balance = totalInflow - totalFixed - totalSpent;
      if (u.salary > 0 && balance > 0 && balance / u.salary < 0.15) {
        const hasNotif = u.notifications.some((n) => n.id === budgetWarningKey);
        if (!hasNotif) {
          const payload = {
            type: "budget_warning",
            titleAr: "\u062A\u0646\u0628\u064A\u0647 \u0645\u0627\u0644\u064A: \u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0643 \u0627\u0644\u062C\u0627\u0631\u064A\u0629 \u0645\u0646\u062E\u0641\u0636\u0629 \u062C\u062F\u0627\u064B! \u26A0\uFE0F",
            titleEn: "Budget Warning: Remaining funds critically low! \u26A0\uFE0F",
            bodyAr: "\u0644\u0642\u062F \u0627\u0633\u062A\u0647\u0644\u0643\u062A \u0645\u0639\u0638\u0645 \u0623\u0645\u0648\u0627\u0644\u0643 \u0627\u0644\u0645\u062A\u0627\u062D\u0629. \u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0628\u0645\u062D\u0641\u0638\u062A\u0643 \u064A\u0642\u0644 \u0639\u0646 15% \u0645\u0646 \u0631\u0627\u062A\u0628\u0643 \u0627\u0644\u0623\u0633\u0627\u0633\u064A.",
            bodyEn: "Your wallet balance has declined under 15% of your gross basic salary. Fasten spending constraints."
          };
          const res = await sendFCMToUser(u.id, payload);
          if (res.sentCount > 0) notificationsDispatched++;
        }
      }
      const weekIndex = Math.ceil((/* @__PURE__ */ new Date()).getDate() / 7);
      const adviceKey = `sched-ai-advice-w${weekIndex}-${(/* @__PURE__ */ new Date()).getFullYear()}`;
      const hasAdviceNotif = u.notifications.some((n) => n.id === adviceKey);
      if (!hasAdviceNotif) {
        const payload = {
          type: "reminder",
          titleAr: "\u0646\u0635\u064A\u062D\u0629 Finora \u0627\u0644\u0630\u0643\u064A\u0629 \u0644\u062D\u0645\u0627\u064A\u0629 \u0645\u062F\u062E\u0631\u0627\u062A\u0643 \u{1F4A1}",
          titleEn: "Finora Smart Tip: Empower Your Surplus \u{1F4A1}",
          bodyAr: "\u062D\u0627\u0648\u0644 \u062F\u0627\u0626\u0645\u064B\u0627 \u062A\u0648\u0641\u064A\u0631 \u0641\u0627\u0626\u0636 \u0627\u0644\u0631\u0627\u062A\u0628 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u0645\u0648\u0627\u0644\u064A \u0644\u0627\u0633\u062A\u0644\u0627\u0645\u0647 \u0645\u0628\u0627\u0634\u0631\u0629 \u0641\u064A \u0638\u0631\u0641 \u0627\u0644\u0627\u062F\u062E\u0627\u0631 \u0644\u062A\u062C\u0646\u0628 \u0627\u0644\u0646\u0641\u0642\u0627\u062A \u0627\u0644\u0639\u0627\u0637\u0641\u064A\u0629.",
          bodyEn: "Try direct saving allocations out of your salary on payday morning to block emotional spending cycles."
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
function startDaemonScheduler() {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1e3;
  console.log("[Scheduler] Background audit daemon successfully spawned. Scans scheduled execution loop every 24 hours.");
  setTimeout(() => {
    runScheduledNotificationsAudit().catch(console.error);
  }, 60 * 1e3);
  setInterval(() => {
    runScheduledNotificationsAudit().catch(console.error);
  }, TWENTY_FOUR_HOURS);
}

// server/paypal.ts
var PAYPAL_API_SANDBOX = "https://api-m.sandbox.paypal.com";
var PAYPAL_API_LIVE = "https://api-m.paypal.com";
function getPayPalBaseUrl() {
  return process.env.PAYPAL_MODE === "live" ? PAYPAL_API_LIVE : PAYPAL_API_SANDBOX;
}
async function getPayPalAccessToken() {
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
    const data = await response.json();
    return data.access_token;
  } catch (err) {
    console.error("[PayPal Service] Error acquiring access token:", err);
    return null;
  }
}
async function createPayPalOrder(amount, currency = "USD") {
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) {
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
            description: "Support Finora \u2764\uFE0F - Donation to Ahmed Foox"
          }
        ]
      })
    });
    if (!response.ok) {
      const errTxt = await response.text();
      console.error("[PayPal Service] Checkout creation failed:", errTxt);
      return { success: false, error: "PayPal order creation failed" };
    }
    const orderData = await response.json();
    return {
      success: true,
      orderId: orderData.id,
      isMock: false
    };
  } catch (e) {
    console.error("[PayPal Service] Error creating order:", e);
    return { success: false, error: e?.message || "Internal order error" };
  }
}
async function capturePayPalOrder(orderId, email = null, amount, currency = "USD") {
  if (!prisma) {
    return { success: false, error: "PostgreSQL Database client is offline." };
  }
  if (orderId.startsWith("MOCK-PP-")) {
    try {
      let resolvedUserId = null;
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
    const captureData = await response.json();
    const donorEmail = captureData.payer?.email_address || email || "anonymous@paypal.com";
    const paymentAmount = Number(captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || amount);
    let resolvedUserId = null;
    if (email) {
      const u = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      resolvedUserId = u?.id || null;
    }
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
  } catch (err) {
    console.error("[PayPal Service] Capture error exception:", err);
    return { success: false, error: err?.message || "Capture internal exception" };
  }
}

// server.ts
import_dotenv.default.config();
initializeFirebaseAdmin();
startDaemonScheduler();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, msg: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0627\u0646." });
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
      res.status(400).json({ success: false, msg: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0627\u0646." });
      return;
    }
    const result = await loginUser(email, password);
    if (result.success) {
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
      res.status(400).json({ success: false, msg: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0648\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0644\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0648\u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629." });
      return;
    }
    const success = await syncState(email, state);
    if (success) {
      res.status(200).json({ success: true, msg: "\u062A\u0645\u062A \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629 \u0648\u062D\u0641\u0638 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0633\u062D\u0627\u0628\u064A\u0627\u064B \u0628\u0646\u062C\u0627\u062D!" });
    } else {
      res.status(404).json({ success: false, msg: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A PostgreSQL." });
    }
  });
  app.get("/api/auth/sync/:email", async (req, res) => {
    const { email } = req.params;
    const syncedState = await getSyncedState(email);
    if (syncedState) {
      res.status(200).json({ success: true, state: syncedState });
    } else {
      res.status(444).json({ success: false, msg: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0645\u062D\u0641\u0648\u0638\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u062D\u0627\u0644\u064A\u0627\u064B." });
    }
  });
  app.post("/api/gemini/insights", async (req, res) => {
    const { state } = req.body;
    if (!state) {
      res.status(400).json({ error: "Missing state payload" });
      return;
    }
    try {
      const insights = await generateBudgetInsights(state);
      res.status(200).json(insights);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ error: error?.message || "Internal AI Chat processing error" });
    }
  });
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
    } catch (error) {
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
          read: status === "read" ? true : void 0
        }
      });
      res.status(200).json({ success: true, updated });
    } catch (error) {
      res.status(500).json({ success: false, error: error?.message || "Status update failure" });
    }
  });
  app.post("/api/paypal/create-order", async (req, res) => {
    const { amount, currency } = req.body;
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ error: "Invalid donation amount specified." });
      return;
    }
    try {
      const order = await createPayPalOrder(Number(amount), currency || "USD");
      res.status(200).json(order);
    } catch (error) {
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
    } catch (error) {
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
        take: 10
      });
      res.status(200).json({ success: true, donations });
    } catch (error) {
      res.status(500).json({ error: error?.message || "Can't fetch donation logs." });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: /* @__PURE__ */ new Date() });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Core finance server actively listening on http://localhost:${PORT}`);
  });
}
startServer().catch((e) => {
  console.error("FATAL: Failed to launch backend sever", e);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
