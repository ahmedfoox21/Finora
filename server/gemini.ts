/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { AppState, Expense, FixedExpense } from "../src/types";

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini features will run in mock-intelligence fallback mode.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

/**
 * Structured schema representing the budget insights response.
 */
export interface GeminiBudgetInsightsResponse {
  dailyFeedbackEn: string;
  dailyFeedbackAr: string;
  detectedRecurringExpenses: {
    name: string;
    estimatedAmount: number;
    category: string;
    confidenceScore: number; // 0 - 100
    explanationEn: string;
    explanationAr: string;
  }[];
}

/**
 * Structured schema for shopping goal evaluation.
 */
export interface GeminiGoalResponse {
  dailySavingsRequired: number;
  weeklySavingsRequired: number;
  expectedDate: string; // YYYY-MM-DD
  strategyEn: string;
  strategyAr: string;
  imagePrompt: string; // detailed prompt to generate an image or representation
}

/**
 * Structured schema for conversational budget auditing/forgotten expense recovery.
 */
export interface GeminiChatResponse {
  replyEn: string;
  replyAr: string;
  suggestedExpense?: {
    amount: number;
    category: string;
    note: string;
  };
  askingQuestionId?: 'wallet_start' | 'wallet_end' | 'did_buy_food' | 'did_pay_bill' | 'none';
}

/**
 * Fallback generator for budget insights when API key is missing
 */
function getMockInsights(state: AppState): GeminiBudgetInsightsResponse {
  const totalSpent = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = state.salary + state.additionalIncomes.reduce((s, i) => s + i.amount, 0) - totalSpent;
  
  return {
    dailyFeedbackEn: `You have spent a total of ${totalSpent} AED this month. You have ${remaining} AED left. Keep tracking your daily coffee and transport expenses to maximize your end-of-month savings goal!`,
    dailyFeedbackAr: `لقد أنفقت ما مجموعه ${totalSpent} درهم هذا الشهر. متبقي لديك حاليًا ${remaining} درهم. استمر في تسجيل مصروفاتك اليومية مثل القهوة والمواصلات لتحقيق أهدافك الادخارية بنهاية الشهر!`,
    detectedRecurringExpenses: state.expenses.length > 3 ? [
      {
        name: "Estimated Telecom Bill",
        estimatedAmount: 150,
        category: "Bills",
        confidence: 85,
        explanationEn: "We detected repeated custom transactions in the transport/bills category. Consider designating this as a fixed monthly item.",
        explanationAr: "لقد رصدنا معاملات مكررة في فئة الفواتير/المواصلات. نقترح تصنيف هذا كمصروف شهري ثابت."
      } as any
    ] : []
  };
}

/**
 * Fallback generator for goals when API key is missing
 */
function getMockGoal(name: string, price: number, targetDays: number): GeminiGoalResponse {
  const daily = Math.ceil(price / Math.max(1, targetDays));
  const weekly = daily * 7;
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + targetDays);
  
  return {
    dailySavingsRequired: daily,
    weeklySavingsRequired: weekly,
    expectedDate: expDate.toISOString().split('T')[0],
    strategyEn: `To buy ${name} in ${targetDays} days, try preparing your meals at home to save around ${daily} AED daily, and direct the difference to your savings jar immediately!`,
    strategyAr: `لشراء ${name} خلال ${targetDays} يومًا، حاول إعداد وجباتك في المنزل لتوفير حوالي ${daily} درهم يوميًا، وتحويل هذا المبلغ مباشرة إلى حصالة الادخار المخصصة!`,
    imagePrompt: `A beautiful minimalist graphic showing a glowing tech device or travel destination as a saving focus icon, modern, luxury finance visual style`
  };
}

/**
 * Calls Gemini to analyze the budget state and generate insights & scan for recurring bills
 */
export async function generateBudgetInsights(state: AppState): Promise<GeminiBudgetInsightsResponse> {
  const ai = getGeminiClient();
  if (!ai) return getMockInsights(state);

  const simplifiedExpenses = state.expenses.map(e => ({
    amount: e.amount,
    category: e.category,
    date: e.date,
    note: e.note || ""
  }));

  const simplifiedFixed = state.fixedExpenses.map(f => ({
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
          type: Type.OBJECT,
          properties: {
            dailyFeedbackEn: { type: Type.STRING },
            dailyFeedbackAr: { type: Type.STRING },
            detectedRecurringExpenses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  estimatedAmount: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  confidenceScore: { type: Type.INTEGER },
                  explanationEn: { type: Type.STRING },
                  explanationAr: { type: Type.STRING }
                },
                required: ["name", "estimatedAmount", "category", "confidenceScore", "explanationEn", "explanationAr"]
              }
            }
          },
          required: ["dailyFeedbackEn", "dailyFeedbackAr", "detectedRecurringExpenses"]
        },
        systemInstruction: "You are an elite, highly professional personal banking advisor. You write concise financial analysis with numerical evidence. You speak both English and flawless Arabic.",
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return parsed as GeminiBudgetInsightsResponse;
  } catch (error) {
    console.error("Gemini insights API failed", error);
    return getMockInsights(state);
  }
}

/**
 * Calculates savings goals plans with the help of Gemini AI
 */
export async function evaluateShoppingGoal(
  goalName: string,
  targetAmount: number,
  targetDate: string,
  state: AppState
): Promise<GeminiGoalResponse> {
  const ai = getGeminiClient();
  
  // Calculate remaining days
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 30;

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
          type: Type.OBJECT,
          properties: {
            dailySavingsRequired: { type: Type.NUMBER },
            weeklySavingsRequired: { type: Type.NUMBER },
            expectedDate: { type: Type.STRING },
            strategyEn: { type: Type.STRING },
            strategyAr: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
          },
          required: ["dailySavingsRequired", "weeklySavingsRequired", "expectedDate", "strategyEn", "strategyAr", "imagePrompt"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return parsed as GeminiGoalResponse;
  } catch (error) {
    console.error("Gemini goal eval failed", error);
    return getMockGoal(goalName, targetAmount, diffDays);
  }
}

/**
 * Handle conversational interactions, especially guided memory recall (لا أتذكر).
 */
export async function handleFinancialChat(
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  state: AppState
): Promise<GeminiChatResponse> {
  const ai = getGeminiClient();
  if (!ai) {
    // Basic fallback response
    return {
      replyEn: "I'm online but running in localized mode. Let me know if you spent any amount like: 50 AED for Food or Coffee, and I will extract it for you!",
      replyAr: "أنا متصل بالوضع المحلي المؤقت. أخبرني كم أنفقت اليوم (مثال: 50 درهم قهوة)، وسأساعدك في تسجيل قيمة المصروفات فوراً!",
      suggestedExpense: message.includes("50") ? { amount: 50, category: "Coffee", note: "قهوة" } : undefined
    };
  }

  const promptHistory = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.text }]
  }));

  const userContext = `
    User state for reference:
    Salary: ${state.salary} AED
    Remaining budget context: ${state.salary - state.expenses.reduce((s, e) => s + e.amount, 0)} AED
    All categories available: Food, Coffee, Transport, Shopping, Entertainment, Bills, Groceries, Fuel, Unclassified.

    SPECIAL ROLE:
    If the user is trying to find out what they spent today because they selected "I don't remember" (لا أتذكر) or said similar:
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
        { role: 'user', parts: [{ text: userContext }] },
        ...promptHistory as any,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyEn: { type: Type.STRING },
            replyAr: { type: Type.STRING },
            suggestedExpense: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
                note: { type: Type.STRING }
              },
              required: ["amount", "category", "note"]
            },
            askingQuestionId: { type: Type.STRING }
          },
          required: ["replyEn", "replyAr"]
        },
        systemInstruction: "You are Al-Ameen (الخبير المالي المساعد), a helpful financial tracker assistant speaking flawless English and natural Arabic. You guide users step by step to calculate and record forgotten daily gastos."
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return parsed as GeminiChatResponse;
  } catch (error) {
    console.error("Gemini Chat helper failed", error);
    return {
      replyEn: "I encountered a processing glitch. I can still help you estimate: Tell me your pocket balance this morning and what you have left now!",
      replyAr: "واجهت مشكلة صغيرة في معالجة النص. يمكنني مساعدتك بالتقدير بذكاء: أخبرني كم كان معك من مال صباح اليوم و كم المتبقي الآن!"
    };
  }
}
