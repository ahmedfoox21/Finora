/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Wallet,
  Calendar,
  Plus,
  Trash2,
  Bell,
  Bot,
  Sparkles,
  Globe,
  User,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  PiggyBank,
  Coffee,
  Car,
  ShoppingBag,
  Utensils,
  Wifi,
  Smartphone,
  Database,
  LogOut,
  RefreshCw,
  Send,
  HelpCircle,
  UserCheck,
  TrendingUp,
  Info,
  Search,
  Filter,
  Sliders,
  ChevronRight,
  Check,
  Shield,
  Download,
  Lightbulb,
  HandCoins
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AppState,
  Expense,
  FixedExpense,
  SavingGoal,
  SimulatedNotification,
  AIInsight,
  AdditionalIncome,
  DebtOrDiscount,
  BorrowRecord
} from "./types";

// Dynamic English/Arabic Translations
const TX = {
  ar: {
    langLabel: "English",
    appName: "Finora",
    appSlogan: "المساعد الذكي للراتب والادخار",
    welcome: "مرحباً بك في Finora",
    getStarted: "ابدأ الآن",
    next: "التالي",
    back: "السابق",
    finish: "إنهاء وبناء الخطة",
    currency: "درهم",
    activeGoals: "حصالة الأهداف",
    dailyBudget: "الميزانية اليومية",
    monthlySpending: "إنفاق الشهر",
    monthlySavings: "مدخراتك المتوقعة",
    recentExpenses: "العمليات الأخيرة",
    allExpenses: "سجل المصروفات",
    searchPlaceholder: "ابحث في المصروفات...",
    addExpense: "إضافة مصروف",
    aiInsights: "نصائح Finora الذكية",
    chatPlaceholder: "اسأل Finora المالي... مثلاً: 'أنفقت 30 قهوة' أو 'ساعدني تذكر مصروفي'",
    profileSettings: "إعدادات الحساب واللغة",
    language: "اللغة",
    security: "الحماية والرمز السري",
    cloudBackup: "النسخ الاحتياطي السحابي",
    resetData: "تهيئة وإعادة تعيين البيانات",
    remaining: "المتبقي",
    totalSalary: "إجمالي الدخل",
    fixedOverhead: "الالتزامات الثابتة",
    step: "الخطوة",
    of: "من",
    salaryInput: "كم راتبك الشهري الأساسي؟",
    salaryDayInput: "يوم إيداع الراتب المعتاد",
    fixedCostsInput: "المصاريف الثابتة المقررة شهرياً",
    fixedCostsDesc: "تساعدنا الفواتير الثابتة في حساب ميزانيتك بدقة تلقائياً.",
    extraIncomeInput: "مصادر الدخل الإضافي (إن وجد)",
    addGoalTitle: "حدد هدفاً ترغب بالادخار لشرائه (اختياري)",
    goalPrice: "قيمة الهدف (درهم)",
    goalDate: "تاريخ التحقيق المستهدف",
    summaryTitle: "مراجعة ميزانيتك واعتماد الخطة",
    summaryText: "بناءً على معلوماتك، قمنا بجدولة ميزانية ذكية تمنع العجز المالي طوال الشهر.",
    safeDailySpend: "يمكنك إنفاق اليوم",
    emptyExpenses: "لا توجد مصروفات مسجلة اليوم. بداية رائعة للتوفير!",
    emptyGoals: "لا توجد أهداف نشطة. أضف هدفك الأول لشرائه بذكاء!",
    onboarding: [
      {
        title: "Finora: المساعد المالي الذكي",
        desc: "أول تطبيق ذكي متكامل مصمم لهاتفك لإدارة الراتب، تحقيق الأهداف، ونظام متكامل لتتبع الديون والأموال المقرضة بذكاء."
      },
      {
        title: "وداعاً لإرهاق نهاية الشهر",
        desc: "تتبع راتبك بدقة واعرف أين تذهب أموالك من خلال ميزانية رصيد يومية آمنة تتكيف مع نفقاتك وقروضك تلقائياً."
      },
      {
        title: "حصالة الأهداف والادخار بذكاء",
        desc: "حدد خطط الشراء التي تطمح إليها، ودع محرك الادخار الذكي يوجهك نحو الادخار اليومي والأسبوعي اللازم لتحقيقها."
      },
      {
        title: "تتبع الأموال المقرضة للآخرين (Lended)",
        desc: "سجل الأموال التي تقرضها للآخرين، وحدد تواريخ استحقاقها لتلقي تذكيرات ذكية تساعدك على استردادها وإعادتها لميزانيتك تلقائياً."
      },
      {
        title: "مستشار مالي بالذكاء الاصطناعي",
        desc: "استشر مساعدك الذكي Finora في أي وقت، تذكر نفقاتك المفقودة وتلقى توصيات تفصيلية من Gemini بضغطة زر."
      }
    ],
    categories: {
      Food: "الطعام والمطاعم",
      Coffee: "مقهى وقهوة يومية",
      Transport: "مواصلات وسيارات",
      Shopping: "تسوق ومشتريات",
      Entertainment: "ترفيه وألعاب",
      Bills: "فواتير واشتراكات",
      Groceries: "بقالة وسوبرماركت",
      Fuel: "وقود وصيانة سيارة",
      Unclassified: "مصروف غير مصنف"
    },
    quickActionText: "تسجيل سريع",
    noNotifs: "لا توجد تنبيهات جديدة حالياً.",
    syncOn: "متصل بالقاعدة السحابية",
    syncOff: "تحت الحفظ المحلي بالجهاز",
    quickAddPrompt: "أدخل مصروفك اليوم في ثانية",
    saveAndLog: "تسجيل العملية فوراً",
    unclassifiedWarning: "رصد الخبير المالي مبالغ غير مسجلة.",
    // Borrowed/Lended Money Strings
    borrowedMoney: "Borrowed Money (الأموال المقرضة)",
    debtorName: "اسم الشخص المقترض",
    lentDate: "تاريخ الإقراض",
    dueDate: "تاريخ الاستحقاق (اختياري)",
    notes: "ملاحظات وتفاصيل",
    borrowedSectionTitle: "الأموال المقرضة للآخرين 💸",
    addLentBtn: "إقراض مبلغ جديد",
    isRepaid: "تم استرجاعها",
    lentAmount: "مبلغ القرض",
    partiallyRepaid: "مسترجع جزئياً",
    notRepaid: "معلق للتحصيل",
    totalLentPending: "أقراض معلقة للتحصيل",
    totalLentRecovered: "إجمالي المستردات",
    debtorRepaidMsg: "تم الاسترداد بالكامل لـ",
    recoveryActions: "إجراءات تحصيل واسترداد الدين",
    repayFull: "تم استرجاع المبلغ بالكامل",
    repayPartial: "تم استرجاع جزء من المبلغ",
    repayPartialAmt: "المبلغ الإضافي المسترجع حالياً",
    noLentRecords: "لا توجد أموال مقرضة مسجلة حالياً. سجل قروضك لتلقي تذكيرات ذكية!",
    cancel: "إلغاء",
    save: "حفظ القيود"
  },
  en: {
    langLabel: "العربية",
    appName: "Finora",
    appSlogan: "Smart Salary & Savings Assistant",
    welcome: "Welcome to Finora",
    getStarted: "Get Started",
    next: "Next",
    back: "Back",
    finish: "Generate Smart Strategy",
    currency: "AED",
    activeGoals: "Savings Targets",
    dailyBudget: "Safe Daily Spending",
    monthlySpending: "Monthly Spent",
    monthlySavings: "Projected Savings",
    recentExpenses: "Recent Log",
    allExpenses: "Expenditures Ledger",
    searchPlaceholder: "Search transaction diary...",
    addExpense: "Log Expense",
    aiInsights: "Finora Advisor Insights",
    chatPlaceholder: "Ask... e.g. 'spent 30 coffee' or 'help me remember'",
    profileSettings: "Security & Synchronization",
    language: "Language",
    security: "PIN Security & Lock",
    cloudBackup: "PostgreSQL Cloud Backup",
    resetData: "Emergency Factory Reset",
    remaining: "Residual Balance",
    totalSalary: "Gross Revenue",
    fixedOverhead: "Fixed Overhead",
    step: "Step",
    of: "of",
    salaryInput: "What is your base monthly salary?",
    salaryDayInput: "Monthly Salary deposit day?",
    fixedCostsInput: "Monthly recurring list",
    fixedCostsDesc: "Helps us calculate your daily disposable budget perfectly.",
    extraIncomeInput: "External revenue sources (If any)",
    addGoalTitle: "Add a savings objective (Optional)",
    goalPrice: "Retail Price (AED)",
    goalDate: "Target Purchase Deadline Date",
    summaryTitle: "Review Your Financial Layout",
    summaryText: "Based on parameters, we have structured a customized daily budget limit to keep you liquid.",
    safeDailySpend: "You can safely spend today",
    emptyExpenses: "No transactions recorded yet today. Fantastic saving behavior!",
    emptyGoals: "No goals currently active. Create your first saving target!",
    onboarding: [
      {
        title: "Finora: Smart Financial Assistant",
        desc: "The ultimate bilingual application designed to manage base salaries, micro-saving jars, and outstanding borrowed debts."
      },
      {
        title: "Banish End-of-Month Deficits",
        desc: "Dynamically tracks residual salary and provides a secure daily spending boundary that shields other savings."
      },
      {
        title: "Purchase Goals & Intelligent Jars",
        desc: "Define what you wish to buy, and let AI calculate daily and weekly optimal micro-deposits to purchase on time."
      },
      {
        title: "Interactive Borrowed Money Ledger",
        desc: "Log money lent to friends. Get automated smart alerts on dues and trigger dynamic instant re-depositing into available balance."
      },
      {
        title: "24/7 Gemini Financial Coach",
        desc: "Discuss missing receipts. Let Gemini scan anomalies and help automate wealth allocation with zero leakage."
      }
    ],
    categories: {
      Food: "Food & Restaurants",
      Coffee: "Cafes & Coffee shops",
      Transport: "Transit & Ride-hailing",
      Shopping: "Shopping & Fashion",
      Entertainment: "Lifestyle & Gaming",
      Bills: "Utilities & Mobile Bills",
      Groceries: "Supermarket & Groceries",
      Fuel: "Fuel & Cars upkeep",
      Unclassified: "Unclassified cash spend"
    },
    quickActionText: "Quick Log",
    noNotifs: "No active notification logs.",
    syncOn: "Connected to Cloud Sync Hub",
    syncOff: "Stored in Device Database Cache",
    quickAddPrompt: "Record today's transaction instantly",
    saveAndLog: "Confirm and Log Receipt",
    unclassifiedWarning: "Advisor detected potential missing expense.",
    // Borrowed/Lended Money Strings
    borrowedMoney: "Borrowed Money",
    debtorName: "Lended To (Borrower)",
    lentDate: "Lent Date",
    dueDate: "Due Date (Optional)",
    notes: "Notes & Details",
    borrowedSectionTitle: "Borrowed Money (Owed To Me)",
    addLentBtn: "Record New Loan",
    isRepaid: "Collected",
    lentAmount: "Principal",
    partiallyRepaid: "Partial",
    notRepaid: "Outstanding",
    totalLentPending: "Outstanding Owed To Me",
    totalLentRecovered: "Total Recovered",
    debtorRepaidMsg: "Fully synchronized recovery for",
    recoveryActions: "Collection Recovery Actions",
    repayFull: "Settled / Repaid in Full",
    repayPartial: "Partial Repayment Collective",
    repayPartialAmt: "Installment Collected Now",
    noLentRecords: "No borrowed records of money. Add your first loan entry to trigger dynamic due alerts!",
    cancel: "Cancel",
    save: "Save Entries"
  }
};

const DEFAULT_STATE: AppState = {
  salary: 0,
  salaryDate: 25,
  fixedExpenses: [],
  additionalIncomes: [],
  debtsAndDiscounts: [],
  expenses: [],
  goals: [],
  borrowedRecords: [],
  language: "ar",
  isSetupCompleted: false,
  notifications: [],
  aiInsights: [],
  isLoggedIn: false,
  syncEnabled: false
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("finora-app-state-v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });

  // Save state on any change
  useEffect(() => {
    localStorage.setItem("finora-app-state-v2", JSON.stringify(state));
  }, [state]);

  // App UI State
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [setupStep, setSetupStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'home' | 'expenses' | 'goals' | 'coach' | 'profile'>('home');

  // Interactive Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addCategory, setAddCategory] = useState("Food");
  const [addNote, setAddNote] = useState("");

  const [activeGoalDetails, setActiveGoalDetails] = useState<SavingGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  // Search/Filters for expenses tab
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Wizard Setup Form Temps
  const [wizardSalary, setWizardSalary] = useState(0);
  const [wizardSalaryDay, setWizardSalaryDay] = useState(25);
  const [wizardFixedList, setWizardFixedList] = useState<FixedExpense[]>([]);
  const [wizardIncomes, setWizardIncomes] = useState<AdditionalIncome[]>([]);
  const [tempFixedName, setTempFixedName] = useState("");
  const [tempFixedAmount, setTempFixedAmount] = useState("");
  const [tempFixedCategory, setTempFixedCategory] = useState("Bills");
  const [tempIncSource, setTempIncSource] = useState("");
  const [tempIncAmount, setTempIncAmount] = useState("");

  // Borrowed/Lended state variables
  const [showLentModal, setShowLentModal] = useState(false);
  const [lentDebtorName, setLentDebtorName] = useState("");
  const [lentAmount, setLentAmount] = useState("");
  const [lentDate, setLentDate] = useState("");
  const [lentDueDate, setLentDueDate] = useState("");
  const [lentNotes, setLentNotes] = useState("");
  const [activeLentRecord, setActiveLentRecord] = useState<BorrowRecord | null>(null);
  const [recoverAmount, setRecoverAmount] = useState("");

  // Goal adding form in Wizard
  const [tempGoalName, setTempGoalName] = useState("");
  const [tempGoalPrice, setTempGoalPrice] = useState("");
  const [tempGoalDate, setTempGoalDate] = useState("");

  // Support & Donation Form States
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportAmountPreset, setSupportAmountPreset] = useState<string>("5");
  const [supportCustomAmount, setSupportCustomAmount] = useState<string>("");
  const [supportLoading, setSupportLoading] = useState<boolean>(false);
  const [supportSuccess, setSupportSuccess] = useState<boolean>(false);
  const [supportError, setSupportError] = useState<string>("");
  const [supportPaymentMethod, setSupportPaymentMethod] = useState<'paypal' | 'card'>('paypal');

  // AI Insights and Coach chat state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string; actionPayload?: any }[]>([
    {
      role: 'model',
      text: "أهلاً بك في منصة Finora للمساعد المالي الذكي. إذا كنت تريد استشارة مالية أو تود تتبع راتبك وقروضك أو تبحث عن توصيات ادخار مخصصة، أنا هنا لمساعدتك فوراً!"
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Auto-detected recurring candidates screen list
  const [detectedBills, setDetectedBills] = useState<any[]>([]);

  // Clouds Sync Database Form States
  const [dbEmail, setDbEmail] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authFormMode, setAuthFormMode] = useState<'login' | 'register'>('login');
  const [pinLockEnabled, setPinLockEnabled] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isPinScreenActive, setIsPinScreenActive] = useState(false);

  // Localization utilities & typography layouts
  const isAr = state.language === "ar";
  const t = isAr ? TX.ar : TX.en;

  // Auto Scroll Chat
  const chatBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Activate Biometric Pin Screen simulation on startup
  useEffect(() => {
    const savedPinSetting = localStorage.getItem("finora-pin-lock-enabled");
    if (savedPinSetting === "true") {
      setIsPinScreenActive(true);
      setPinLockEnabled(true);
    }
  }, []);

  // Language switch handler
  const handleToggleLanguage = () => {
    setState(prev => ({
      ...prev,
      language: prev.language === "ar" ? "en" : "ar"
    }));
  };

  // Notification action handler
  const handleNotificationAction = (notification: SimulatedNotification, action: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === notification.id ? { ...n, read: true } : n)
    }));
    
    if (action === "total_only") {
      setAddCategory("Unclassified");
      setAddNote(isAr ? "مصروف تقريبي مضاف" : "Estimated quick spend");
      setShowAddModal(true);
    } else if (action === "dont_remember") {
      setActiveTab('coach');
      setChatHistory(prev => [
        ...prev,
        { role: 'user', text: isAr ? "لا أتذكر أين ذهبت نقودي اليوم 🤔" : "I don't remember where my money went today" }
      ]);
      handleSendPromptMessage(isAr ? "ساعدني لتذكر نفقاتي اليوم بالتفصيل" : "Help me remember what I spent today");
    } else if (action && action.startsWith("repay_loan_")) {
      const loanId = action.replace("repay_loan_", "");
      const foundLoan = (state.borrowedRecords || []).find(r => r.id === loanId);
      if (foundLoan) {
        setActiveLentRecord(foundLoan);
      }
    }
  };

  // Request browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Synchronize Push Token with Neon PostgreSQL backend
  useEffect(() => {
    if (state.isLoggedIn && state.userEmail) {
      const syncToken = async () => {
        let token = localStorage.getItem("finora_device_push_token");
        if (!token) {
          try {
            if ("serviceWorker" in navigator) {
              const reg = await navigator.serviceWorker.ready;
              if (reg.pushManager) {
                const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: "BEl6mhc7B2D9Hy2Y-M2b07L_XW9m7Nd_V8g9XbV8T9b_9_X_8b_X9b9f7a7f7"
                }).catch(() => null);
                if (sub) {
                  token = JSON.stringify(sub);
                }
              }
            }
          } catch (e) {
            console.warn("Push subscription declined or not supported. Using persistent fallback identifier.", e);
          }
          
          if (!token) {
            token = "web-token-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();
          }
          localStorage.setItem("finora_device_push_token", token);
        }

        try {
          await fetch("/api/notifications/register-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: state.userEmail,
              token,
              platform: "web"
            })
          });
        } catch (e) {
          console.error("Token sync failure:", e);
        }
      };
      
      syncToken();
    }
  }, [state.isLoggedIn, state.userEmail]);

  // Trigger modern operating-system level native Web Push/Notifications
  const triggerWebNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(reg => {
              reg.showNotification(title, {
                body,
                icon: "/favicon.svg",
                badge: "/favicon.svg",
                vibrate: [100, 50, 100],
              } as any);
            }).catch(() => {
              new Notification(title, { body, icon: "/favicon.svg" });
            });
          } else {
            new Notification(title, { body, icon: "/favicon.svg" });
          }
        } catch (e) {
          console.warn("Unable to service worker notification", e);
        }
      }
    }
  };

  const handleTriggerDonationPayment = async () => {
    setSupportError("");
    setSupportLoading(true);
    setSupportSuccess(false);

    const finalValue = Number(supportAmountPreset === "custom" ? supportCustomAmount : supportAmountPreset);
    if (isNaN(finalValue) || finalValue <= 0) {
      setSupportError(isAr ? "يرجى تحديد مبلغ تبرع صالح أكبر من الصفر." : "Please enter a valid donation value.");
      setSupportLoading(false);
      return;
    }

    try {
      // 1. Create Checkout Order
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalValue,
          currency: "USD",
          email: state.userEmail || null
        })
      });

      if (!createRes.ok) throw new Error("Could not create PayPal checkout process.");
      const createData = await createRes.json();

      if (!createData.success || !createData.orderId) {
        throw new Error(createData.error || "Failed obtaining transaction token.");
      }

      const orderId = createData.orderId;

      // Simulate network delay for verification and authorization
      await new Promise(r => setTimeout(r, 1200));

      // 2. Capture and complete order
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          email: state.userEmail || "anonymous-donor@finora.app",
          amount: finalValue,
          currency: "USD"
        })
      });

      if (!captureRes.ok) throw new Error("Card capture authorization failure.");
      const captureData = await captureRes.json();

      if (captureData.success) {
        setSupportSuccess(true);
        const thankNotifKey = `donation-thanks-${Date.now()}`;
        const titleAr = "شكراً جزيلاً لدعمك Finora! ❤️";
        const titleEn = "Thank you so much for supporting Finora! ❤️";
        const bodyAr = `وصلنا تبرعك السخي بمقدار $${finalValue}. مساهمتك القيمة تساعد أحمد فوكس على تغطية تكاليف الخادم والاستشاري.`;
        const bodyEn = `Your generous donation of $${finalValue} was processed successfully. Your support protects Finora resources!`;
        
        setState(prev => ({
          ...prev,
          notifications: [
            {
              id: thankNotifKey,
              type: "savings_milestone",
              titleAr,
              titleEn,
              bodyAr,
              bodyEn,
              date: new Date().toISOString(),
              read: false
            },
            ...(prev.notifications || [])
          ]
        }));

        triggerWebNotification(state.language === "ar" ? titleAr : titleEn, state.language === "ar" ? bodyAr : bodyEn);
      } else {
        throw new Error(captureData.error || "Capture processing declined.");
      }
    } catch (err: any) {
      setSupportError(err?.message || (isAr ? "فشلت عملية التحصيل والربط المالي." : "Transaction process failed."));
    } finally {
      setSupportLoading(false);
    }
  };

  // Log money lent to someone else (Borrowed Money)
  const handleLogLentRecord = () => {
    const amt = Number(lentAmount);
    if (!lentDebtorName.trim()) {
      alert(isAr ? "يرجى إدخال اسم الشخص المقترض." : "Please enter the debtor name.");
      return;
    }
    if (!amt || amt <= 0) {
      alert(isAr ? "يرجى تحديد تفاصيل المبلغ الصالحة للإقراض." : "Provide positive numerical loan value.");
      return;
    }

    const item: BorrowRecord = {
      id: "lent-" + Date.now(),
      debtorName: lentDebtorName.trim(),
      amount: amt,
      lentDate: lentDate || new Date().toISOString().split('T')[0],
      dueDate: lentDueDate || undefined,
      notes: lentNotes.trim() || undefined,
      isRepaid: false,
      repaidAmount: 0
    };

    setState(prev => ({
      ...prev,
      borrowedRecords: [item, ...(prev.borrowedRecords || [])]
    }));

    setLentDebtorName("");
    setLentAmount("");
    setLentDate("");
    setLentDueDate("");
    setLentNotes("");
    setShowLentModal(false);
  };

  // Settle or partially recover the money lent
  const handleSettleLentRecord = (recordId: string, type: 'full' | 'partial', partialAmt?: number) => {
    let recoveredValue = 0;
    
    // Determine exact amount being repaid
    const targetRecord = (state.borrowedRecords || []).find(r => r.id === recordId);
    if (targetRecord) {
      if (type === 'full') {
        recoveredValue = targetRecord.amount - targetRecord.repaidAmount;
      } else {
        const amt = Number(partialAmt || 0);
        recoveredValue = Math.min(targetRecord.amount - targetRecord.repaidAmount, amt);
      }
    }

    setState(prev => {
      const records = (prev.borrowedRecords || []).map(r => {
        if (r.id === recordId) {
          if (type === 'full') {
            const addedCollected = r.amount - r.repaidAmount;
            return {
              ...r,
              isRepaid: true,
              repaidAmount: r.amount,
              notes: `${r.notes || ""}\n[Collected ${addedCollected} ${isAr ? "درهم" : "AED"} fully on ${new Date().toLocaleDateString()}]`.trim()
            };
          } else {
            const amtToRecover = Number(partialAmt || 0);
            const newRepaidTotal = Math.min(r.amount, r.repaidAmount + amtToRecover);
            const isFullyNow = newRepaidTotal >= r.amount;
            return {
              ...r,
              repaidAmount: newRepaidTotal,
              isRepaid: isFullyNow,
              notes: `${r.notes || ""}\n[Collected partial payment ${amtToRecover} ${isAr ? "درهم" : "AED"} on ${new Date().toLocaleDateString()}]`.trim()
            };
          }
        }
        return r;
      });

      // Automatically allocate recovered money to active uncompleted saving targets
      let updatedGoals = [...(prev.goals || [])];
      if (recoveredValue > 0 && updatedGoals.length > 0) {
        let remainingToAllocate = recoveredValue;
        updatedGoals = updatedGoals.map(g => {
          const needed = g.targetAmount - g.savedAmount;
          if (needed > 0 && remainingToAllocate > 0) {
            const allocate = Math.min(needed, remainingToAllocate);
            remainingToAllocate -= allocate;
            return {
              ...g,
              savedAmount: Math.round((g.savedAmount + allocate) * 10) / 10
            };
          }
          return g;
        });
      }

      return {
        ...prev,
        borrowedRecords: records,
        goals: updatedGoals
      };
    });
    
    // Reset inputs
    setActiveLentRecord(null);
    setRecoverAmount("");
  };

  // Automated production-ready background scheduler/scanner for the 5 key notification use cases
  useEffect(() => {
    if (!state.isSetupCompleted) return;

    let updatedNotifs = [...(state.notifications || [])];
    let hasChanges = false;

    // --- USE CASE 1: Daily spending reminder ---
    const lastExpenseDate = state.expenses.length > 0 
      ? new Date(state.expenses.reduce((latest, current) => current.date > latest ? current.date : latest, state.expenses[0].date))
      : null;
    const todayStr = new Date().toISOString().split('T')[0];
    const spendNotifKey = `daily-spend-reminder-${todayStr}`;
    
    // Check if there are no expenses recorded in last 24 hours
    const hoursSinceLastExpense = lastExpenseDate 
      ? (new Date().getTime() - lastExpenseDate.getTime()) / (1000 * 60 * 60)
      : 999;

    if (hoursSinceLastExpense >= 24 && !updatedNotifs.some(n => n.id === spendNotifKey)) {
      const titleAr = "تذكير: لم تقم بتسجيل أي مصروفات اليوم! ✍️";
      const titleEn = "Reminder: No expenses recorded today! ✍️";
      const bodyAr = "يرجى تسجيل فنجان القهوة أو المواصلات أو البقالة لتحديث ميزانيتك اليومية للمستشار المالي.";
      const bodyEn = "Please log your coffee, fare, or groceries to align your dynamic daily allowance on Finora.";
      
      updatedNotifs.unshift({
        id: spendNotifKey,
        type: "reminder",
        titleAr,
        titleEn,
        bodyAr,
        bodyEn,
        date: new Date().toISOString(),
        read: false
      });
      hasChanges = true;
      triggerWebNotification(state.language === "ar" ? titleAr : titleEn, state.language === "ar" ? bodyAr : bodyEn);
    }

    // --- USE CASE 2: Borrowed / Lended money reminders ---
    const uncollectedRecords = (state.borrowedRecords || []).filter(r => !r.isRepaid);
    uncollectedRecords.forEach(r => {
      const dateLent = new Date(r.lentDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - dateLent.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const notifKey14Days = `loan-14days-${r.id}`;
      const notifKeyDueDate = `loan-due-${r.id}`;

      // A: Warn if 14 days have passed
      if (diffDays >= 14 && !updatedNotifs.some(n => n.id === notifKey14Days)) {
        const tar = `مرّ 14 يوماً على إقراض ${r.debtorName} مبلغ ${r.amount} درهم.`;
        const ten = `14 days have passed since you lent ${r.debtorName} ${r.amount} AED.`;
        const bar = `لديك ${r.amount - r.repaidAmount} درهم معلقة ومستحقة تحصيل لدى ${r.debtorName}. هل ترغب بتبويب دفعات مسترجعة للرصيد الآن؟`;
        const ben = `You have ${r.amount - r.repaidAmount} AED outstanding from ${r.debtorName}. Would you like to log collection to your dynamic balance?`;

        updatedNotifs.unshift({
          id: notifKey14Days,
          type: "loan_reminder" as any,
          titleAr: tar,
          titleEn: ten,
          bodyAr: bar,
          bodyEn: ben,
          date: new Date().toISOString(),
          read: false,
          quickAction: `repay_loan_${r.id}` as any
        });
        hasChanges = true;
        triggerWebNotification(state.language === "ar" ? tar : ten, state.language === "ar" ? bar : ben);
      }

      // B: Warn if due date reached or passed
      if (r.dueDate) {
        const dateDue = new Date(r.dueDate);
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dueDateOnly = new Date(dateDue.getFullYear(), dateDue.getMonth(), dateDue.getDate());
        if (todayDateOnly >= dueDateOnly && !updatedNotifs.some(n => n.id === notifKeyDueDate)) {
          const tar = `استحقاق تحصيل الأموال المقرضة لـ ${r.debtorName}! ⚠️`;
          const ten = `Lended assets due date triggered for ${r.debtorName}! ⚠️`;
          const bar = `حل موعد استحقاق الدين بمقدار ${r.amount - r.repaidAmount} درهم المسجل لدى ${r.debtorName}. هل قام بالسداد؟`;
          const ben = `The timeline target of ${r.amount - r.repaidAmount} AED from ${r.debtorName} is reached. Have they repaid?`;

          updatedNotifs.unshift({
            id: notifKeyDueDate,
            type: "loan_reminder" as any,
            titleAr: tar,
            titleEn: ten,
            bodyAr: bar,
            bodyEn: ben,
            date: new Date().toISOString(),
            read: false,
            quickAction: `repay_loan_${r.id}` as any
          });
          hasChanges = true;
          triggerWebNotification(state.language === "ar" ? tar : ten, state.language === "ar" ? bar : ben);
        }
      }
    });

    // --- USE CASE 3: Goal progress reminder ---
    (state.goals || []).forEach(g => {
      const ratio = g.targetAmount > 0 ? (g.savedAmount / g.targetAmount) : 0;
      const milestone50Key = `goal-milestone-50-${g.id}`;
      const milestone100Key = `goal-milestone-100-${g.id}`;

      if (ratio >= 0.5 && ratio < 1.0 && !updatedNotifs.some(n => n.id === milestone50Key)) {
        const tar = `نصف الطريق لتحقيق هدفك! 🎉 (${g.name})`;
        const ten = `Halfway to your savings milestone! 🎉 (${g.name})`;
        const bar = `لقد ادخرت أكثر من 50% من هدفك البالغ ${g.targetAmount} درهم لـ ${g.name}. استمر بالادخار الملتزم!`;
        const ben = `You have saved over 50% of your target ${g.targetAmount} AED for ${g.name}. Excellent financial persistence!`;

        updatedNotifs.unshift({
          id: milestone50Key,
          type: "savings_milestone" as any,
          titleAr: tar,
          titleEn: ten,
          bodyAr: bar,
          bodyEn: ben,
          date: new Date().toISOString(),
          read: false
        });
        hasChanges = true;
        triggerWebNotification(state.language === "ar" ? tar : ten, state.language === "ar" ? bar : ben);
      }

      if (ratio >= 1.0 && !updatedNotifs.some(n => n.id === milestone100Key)) {
        const tar = `تهانينا! حققت هدف الادخار بالكامل! 🏆 (${g.name})`;
        const ten = `Congratulations! Savings milestone achieved! 🏆 (${g.name})`;
        const bar = `قمت بتوفير مبلغ ${g.targetAmount} درهم اللازم لشراء ${g.name} بنجاح. مجهود مالي ممتاز!`;
        const ben = `You successfully gathered the complete cost of ${g.targetAmount} AED for ${g.name}. Time to celebrate!`;

        updatedNotifs.unshift({
          id: milestone100Key,
          type: "savings_milestone" as any,
          titleAr: tar,
          titleEn: ten,
          bodyAr: bar,
          bodyEn: ben,
          date: new Date().toISOString(),
          read: false
        });
        hasChanges = true;
        triggerWebNotification(state.language === "ar" ? tar : ten, state.language === "ar" ? bar : ben);
      }
    });

    // --- USE CASE 4: Budget warning (15% wallet remaining) ---
    const budgetWarnKey = `budget-under-15-${new Date().getFullYear()}-${new Date().getMonth()}`;
    const totalSpent = state.expenses.reduce((s, e) => s + e.amount, 0);
    const totalFixed = state.fixedExpenses.reduce((s, e) => s + e.amount, 0);
    const totalInflow = state.salary + state.additionalIncomes.reduce((s, i) => s + i.amount, 0);
    const balance = totalInflow - totalFixed - totalSpent;

    if (state.salary > 0 && balance > 0 && (balance / state.salary) < 0.15 && !updatedNotifs.some(n => n.id === budgetWarnKey)) {
      const tar = `تنبيه مالي: تجاوزت الحد الآمن للميزانية! ⚠️`;
      const ten = `Budget Warning: Low remaining funds! ⚠️`;
      const bar = `المبلغ المتبقي بمحفظتك يقل عن 15% من راتبك الأساسي. يُنصح بالحد من الوجبات الجاهزة أو الترفيه مؤقتاً.`;
      const ben = `Your wallet balance has declined under 15% of your gross salary. Scale back optional dining/entertainment.`;

      updatedNotifs.unshift({
        id: budgetWarnKey,
        type: "budget_warning" as any,
        titleAr: tar,
        titleEn: ten,
        bodyAr: bar,
        bodyEn: ben,
        date: new Date().toISOString(),
        read: false
      });
      hasChanges = true;
      triggerWebNotification(state.language === "ar" ? tar : ten, state.language === "ar" ? bar : ben);
    }

    // --- USE CASE 5: AI financial advice periodic service ---
    const adviceKey = `ai-tip-weekly-${new Date().getFullYear()}-w${Math.ceil(new Date().getDate() / 7)}`;
    if (!updatedNotifs.some(n => n.id === adviceKey)) {
      const tar = "نصيحة Finora الذكية لحماية مدخراتك 💡";
      const ten = "Finora Smart Tip: Empower Your Surplus 💡";
      const bar = "حاول دائمًا توفير فائض الراتب في اليوم الموالي لاستلامه مباشرة في ظرف الادخار لتجنب النفقات غير واعية.";
      const ben = "Try direct saving allocations out of your salary on payday morning to block emotional spending cycles.";

      updatedNotifs.unshift({
        id: adviceKey,
        type: "reminder" as any,
        titleAr: tar,
        titleEn: ten,
        bodyAr: bar,
        bodyEn: ben,
        date: new Date().toISOString(),
        read: false
      });
      hasChanges = true;
      triggerWebNotification(state.language === "ar" ? tar : ten, state.language === "ar" ? bar : ben);
    }

    if (hasChanges) {
      setState(prev => ({
        ...prev,
        notifications: updatedNotifs
      }));
    }
  }, [state.borrowedRecords, state.isSetupCompleted, state.expenses, state.goals, state.salary]);

  // Remove elements
  const handleRemoveExpense = (id: string) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  const handleRemoveGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  // Logout
  const handleLogOutCloud = () => {
    setState(prev => ({
      ...prev,
      isLoggedIn: false,
      userEmail: undefined,
      syncEnabled: false
    }));
  };

  // Compute all live metrics
  const m = useMemo(() => {
    const salary = Number(state.salary || 0);
    const totalExtraIncomes = state.additionalIncomes.reduce((acc, current) => acc + Number(current.amount), 0);
    const totalFixedOutlays = state.fixedExpenses.reduce((acc, current) => acc + Number(current.amount), 0);
    const totalDebtService = state.debtsAndDiscounts.reduce((acc, current) => acc + Number(current.amount), 0);

    const grossMonthlyRevenue = salary + totalExtraIncomes;
    const directFixedLiabilities = totalFixedOutlays + totalDebtService;

    // Borrowed/Lended Money tracking variables
    const activeLentRecords = state.borrowedRecords || [];
    const totalLentPending = activeLentRecords
      .filter(r => !r.isRepaid)
      .reduce((acc, current) => acc + (Number(current.amount) - Number(current.repaidAmount || 0)), 0);
    
    const totalLentRecovered = activeLentRecords
      .reduce((acc, current) => acc + Number(current.repaidAmount || 0), 0);

    const totalDynamicExpensesThisMonth = state.expenses.reduce((acc, current) => acc + Number(current.amount), 0);
    const remainingWalletBalance = Math.max(0, grossMonthlyRevenue - directFixedLiabilities - totalDynamicExpensesThisMonth - totalLentPending);

    // Dynamic daily spending budget calculation until next payday
    const now = new Date();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const payDay = state.salaryDate || 25;

    let daysRemaining = 1;
    if (currentDay < payDay) {
      daysRemaining = payDay - currentDay;
    } else {
      daysRemaining = (totalDaysInMonth - currentDay) + payDay;
    }
    if (daysRemaining < 1) daysRemaining = 1;

    // Daily allocated safe budget limit
    const dailyDisposableAllocation = Math.round((remainingWalletBalance / daysRemaining) * 10) / 10;

    return {
      grossMonthlyRevenue,
      directFixedLiabilities,
      totalDynamicExpensesThisMonth,
      remainingWalletBalance,
      daysRemaining,
      dailyDisposableAllocation,
      totalFixedOutlays,
      totalLentPending,
      totalLentRecovered
    };
  }, [state]);

  // Triggering the initial Gemini analyses
  const handleFetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state })
      });
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      const newInsight: AIInsight = {
        id: "ai-" + Date.now(),
        category: "tip",
        textEn: data.dailyFeedbackEn,
        textAr: data.dailyFeedbackAr,
        created_at: new Date().toISOString()
      };

      if (data.detectedRecurringExpenses && data.detectedRecurringExpenses.length > 0) {
        setDetectedBills(data.detectedRecurringExpenses);
      }

      setState(prev => ({
        ...prev,
        aiInsights: [newInsight, ...prev.aiInsights]
      }));
    } catch (e) {
      console.error(e);
      // Fallback
      const fallback: AIInsight = {
        id: "ai-fb-" + Date.now(),
        category: "tip",
        textEn: "Pace your entertainment purchases. You spent 15% more than last week in the shopping category today.",
        textAr: "نصيحة الأمين: وتيرة إنفاقك اليوم أعلى بنسبة 15% مقارنة بمتوسط الأسبوع الماضي.",
        created_at: new Date().toISOString()
      };
      setState(prev => ({ ...prev, aiInsights: [fallback, ...prev.aiInsights] }));
    } finally {
      setInsightsLoading(false);
    }
  };

  // Chat conversation
  const handleSendPromptMessage = async (alternativePromptText?: string) => {
    const promptToSend = alternativePromptText || chatInput;
    if (!promptToSend.trim()) return;

    setChatHistory(prev => [...prev, { role: 'user', text: promptToSend }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          history: chatHistory.map(h => ({ role: h.role, text: h.text })),
          state
        })
      });

      if (!response.ok) throw new Error("Error connecting to Gemini");
      const reply = await response.json();

      setChatHistory(prev => [...prev, {
        role: 'model',
        text: isAr ? reply.replyAr : reply.replyEn,
        actionPayload: reply.suggestedExpense
      }]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, {
        role: 'model',
        text: isAr ? "عذراً واجهتني مشكلة اتصال بخوادم الفحص. ميزانيتك الحالية آمنة وتحت السيطرة الكاملة!" : "My servers are processing other wallets. Rest assured your actual local ledger balances are safely tracked."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Accepting AI-proposed forgotten expenditures
  const handleApproveAIChatSuggestion = (payload: any) => {
    const fresh: Expense = {
      id: "e-ai-" + Date.now(),
      amount: payload.amount,
      category: payload.category || "Unclassified",
      note: payload.note || "Forgotten transaction estimated by Al-Ameen",
      date: new Date().toISOString().split('T')[0]
    };

    setState(prev => ({
      ...prev,
      expenses: [fresh, ...prev.expenses]
    }));

    setChatHistory(prev => [...prev, {
      role: 'model',
      text: isAr ? `✅ تم تدوين مصروف بقيمة ${payload.amount} درهم في ميزانيتك العامة تحت فئة ${t.categories[payload.category as keyof typeof t.categories] || payload.category}.` : `✅ Recorded spending of ${payload.amount} AED under ${payload.category} successfully.`
    }]);
  };

  // Accept recurring bill candidate
  const handleAcceptDetectedBill = (bill: any) => {
    const newFixed: FixedExpense = {
      id: "f-ai-" + Date.now(),
      name: bill.name,
      amount: bill.estimatedAmount,
      category: bill.category || "Bills"
    };

    setState(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, newFixed]
    }));
    setDetectedBills(prev => prev.filter(b => b.name !== bill.name));
  };

  // Fast direct transactions logging
  const handleLogManualExpense = () => {
    const amt = Number(addAmount);
    if (!amt || amt <= 0) {
      alert(isAr ? "يرجى تحديد سعر المصروف بدقة." : "Provide positive numerical expense value.");
      return;
    }

    const item: Expense = {
      id: "ex-" + Date.now(),
      amount: amt,
      category: addCategory,
      note: addNote.trim() || undefined,
      date: new Date().toISOString().split('T')[0]
    };

    setState(prev => ({
      ...prev,
      expenses: [item, ...prev.expenses]
    }));

    setAddAmount("");
    setAddNote("");
    setShowAddModal(false);
  };

  // Filtered Expense Records list
  const filteredExpensesList = useMemo(() => {
    return state.expenses.filter(e => {
      const matchSearch = e.note ? e.note.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchCategory = selectedCategoryFilter === "All" ? true : e.category === selectedCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [state.expenses, searchQuery, selectedCategoryFilter]);

  // Goal adding in wizard
  const handleAddGoalInWizard = () => {
    if (!tempGoalName || !tempGoalPrice) return;
    const item: SavingGoal = {
      id: "temp-g-" + Date.now(),
      name: tempGoalName,
      targetAmount: Number(tempGoalPrice),
      savedAmount: 0,
      targetDate: tempGoalDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, item]
    }));
    setTempGoalName("");
    setTempGoalPrice("");
    setTempGoalDate("");
  };

  // Complete setup step actions
  const handleSaveSetupWizard = () => {
    setState(prev => ({
      ...prev,
      salary: wizardSalary,
      salaryDate: wizardSalaryDay,
      fixedExpenses: wizardFixedList.length > 0 ? wizardFixedList : prev.fixedExpenses,
      additionalIncomes: wizardIncomes.length > 0 ? wizardIncomes : prev.additionalIncomes,
      isSetupCompleted: true
    }));
    setActiveTab('home');
  };

  // Interactive jar deposit implementation
  const handleSaveDepositIntoGoal = () => {
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) return;

    if (amt > m.remainingWalletBalance) {
      alert(isAr ? "المبلغ يتجاوز رصيدك الحالي المتبقي للإنفاق." : "Amount exceeds available monthly dynamic funds.");
      return;
    }

    // Register active expense inside ledger under Shopping
    const allocationLog: Expense = {
      id: "e-savings-" + Date.now(),
      amount: amt,
      category: "Shopping",
      note: `${isAr ? "تحويل لحصالة" : "Savings transfer to"} ${activeGoalDetails?.name}`,
      date: new Date().toISOString().split('T')[0]
    };

    setState(prev => {
      const goalsMapped = prev.goals.map(g => {
        if (g.id === activeGoalDetails?.id) {
          return { ...g, savedAmount: Math.min(g.targetAmount, g.savedAmount + amt) };
        }
        return g;
      });

      return {
        ...prev,
        goals: goalsMapped,
        expenses: [allocationLog, ...prev.expenses]
      };
    });

    setDepositAmount("");
    setActiveGoalDetails(null);
  };

  // Cloud backend actions
  const handleDbSyncAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!dbEmail || !dbPassword) {
      setAuthError(isAr ? "يرجى ملء جميع الحقول المطلوبة." : "Complete standard credentials.");
      return;
    }

    const endpoint = authFormMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: dbEmail, password: dbPassword })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.msg || "Authentication error.");

      setAuthSuccess(isAr ? "تم تسجيل الدخول واستدعاء القيود والمزامنة بنجاح!" : "Access authenticated. Online system updated.");
      setDbPassword("");

      setState(prev => ({
        ...prev,
        isLoggedIn: true,
        userEmail: dbEmail,
        syncEnabled: true,
        ...(resData.user?.syncedState ? resData.user.syncedState : {})
      }));
    } catch (err: any) {
      setAuthError(err.message || "Endpoint error.");
    }
  };

  const handleCloudSyncForce = async () => {
    if (!state.userEmail) return;
    try {
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.userEmail, state })
      });
      if (response.ok) {
        setAuthSuccess(isAr ? "تم نسخ مذكرتك المالية على قاعدة PostgreSQL احتياطياً!" : "Ledger state synchronized on Cloud Postgres SQL.");
        setTimeout(() => setAuthSuccess(""), 4000);
      }
    } catch (e) {
      setAuthError("Failed to store copy in Postgres remote cluster.");
    }
  };

  // Export PDF Simulation
  const handleExportPDF = () => {
    const reportData = `
==================================================
 ${t.appName.toUpperCase()} - FINANCIAL BALANCE STATEMENT
==================================================
Generated on: ${new Date().toLocaleDateString()}
Language Mode: ${state.language === 'ar' ? 'Arabic' : 'English'}
User Account: ${state.userEmail || 'Local / Guest'}

SUMMARY BUDGET OVERVIEW:
--------------------------------------------------
* Base Monthly Revenue  : ${m.grossMonthlyRevenue} ${t.currency}
* Direct Commitments    : ${m.directFixedLiabilities} ${t.currency}
* Month Logging Spend   : ${m.totalDynamicExpensesThisMonth} ${t.currency}
* Remaining Balance     : ${m.remainingWalletBalance} ${t.currency}
* Daily Spend Target    : ${m.dailyDisposableAllocation} ${t.currency}

REPETITIVE OUTLAY LEDGER:
--------------------------------------------------
${state.fixedExpenses.map(b => `- ${b.name}: ${b.amount} ${t.currency} (${b.category})`).join('\n')}

PENDING GOALS SPECIFICATION:
--------------------------------------------------
${state.goals.map(g => `- ${g.name}: Target: ${g.targetAmount}, Saved: ${g.savedAmount}`).join('\n')}
==================================================
`;
    const blob = new Blob([reportData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Al-Ameen-Financial-Report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFactoryResetWholeApp = () => {
    if (confirm(isAr ? "هل أنت متأكد من تهيئة ومسح جميع بياناتك المالية نهائياً؟" : "Are you sure you want to completely erase all finance records?")) {
      setState(DEFAULT_STATE);
      setOnboardingIndex(0);
      setSetupStep(1);
      localStorage.removeItem("finora-app-state-v2");
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center select-none overflow-hidden font-sans" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="w-full h-full min-h-screen md:h-[844px] md:min-h-[844px] md:max-w-md bg-slate-950 flex flex-col justify-between overflow-hidden relative md:border md:border-slate-900 md:shadow-2xl md:rounded-[40px] origin-center">
        
        {/* PIN SECURITY SCREEN BLOCK */}
        {isPinScreenActive && (
          <div className="absolute inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{isAr ? "رمز الميزانية الآمن" : "Ledger PIN Lock"}</h3>
            <p className="text-xs text-slate-400 mb-8">{isAr ? "أدخل الرمز (1234) لعرض مصاريفك واستشاراتك" : "Enter PIN (1234) to view your wallet"}</p>
            
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3].map((idx) => (
                <div 
                  key={idx} 
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    pinInput.length > idx ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-md shadow-emerald-500/40' : 'border-slate-800 bg-transparent'
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (pinInput.length < 4) {
                      const next = pinInput + num;
                      setPinInput(next);
                      if (next === "1234") {
                        setIsPinScreenActive(false);
                        setPinInput("");
                      } else if (next.length === 4) {
                        alert(isAr ? "الرمز السري غير صحيح." : "Incorrect security PIN.");
                        setPinInput("");
                      }
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-slate-900 border border-slate-850 text-white font-black text-md flex items-center justify-center cursor-pointer active:bg-slate-800 transition"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                onClick={() => {
                  if (pinInput.length < 4) {
                    const next = pinInput + "0";
                    setPinInput(next);
                    if (next === "1234") {
                      setIsPinScreenActive(false);
                      setPinInput("");
                    } else if (next.length === 4) {
                      alert(isAr ? "الرمز السري غير صحيح." : "Incorrect security PIN.");
                      setPinInput("");
                    }
                  }
                }}
                className="w-14 h-14 rounded-full bg-slate-900 border border-slate-850 text-white font-black text-md flex items-center justify-center cursor-pointer active:bg-slate-800 transition"
              >
                0
              </button>
              <button
                onClick={() => setPinInput(pinInput.slice(0, -1))}
                className="w-14 h-14 rounded-full text-slate-500 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                {isAr ? "مسح" : "Del"}
              </button>
            </div>
          </div>
        )}

        {/* ONBOARDING & SETUP STEPS BAR */}
        {!state.isSetupCompleted && !isPinScreenActive && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950 relative h-full">
            {onboardingIndex < 5 ? (
              <div className="flex-1 flex flex-col justify-between my-auto h-full py-4">
                <div className="my-auto space-y-6 text-center">
                  <div className="w-18 h-18 bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] mx-auto flex items-center justify-center shadow-md">
                    {onboardingIndex === 0 && <Wallet className="h-9 w-9 text-emerald-400" />}
                    {onboardingIndex === 1 && <TrendingUp className="h-9 w-9 text-emerald-400" />}
                    {onboardingIndex === 2 && <PiggyBank className="h-9 w-9 text-emerald-400" />}
                    {onboardingIndex === 3 && <Sparkles className="h-9 w-9 text-emerald-400" />}
                    {onboardingIndex === 4 && <Bot className="h-9 w-9 text-emerald-400" />}
                  </div>

                  <div className="space-y-3 px-2">
                    <h2 className="text-xl font-black text-white leading-tight">
                      {t.onboarding[onboardingIndex]?.title}
                    </h2>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans px-3">
                      {t.onboarding[onboardingIndex]?.desc}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center gap-1.5 pt-2">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          onboardingIndex === idx ? 'w-5 bg-emerald-400' : 'w-1 bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3 justify-center">
                    {onboardingIndex > 0 ? (
                      <button
                        onClick={() => setOnboardingIndex(p => p - 1)}
                        className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-850 text-slate-400 hover:text-white transition font-bold text-xs"
                      >
                        {t.back}
                      </button>
                    ) : (
                      <button
                        onClick={handleToggleLanguage}
                        className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-850 text-emerald-400 font-bold text-xs"
                      >
                        {isAr ? "English" : "العربية"}
                      </button>
                    )}
                    <button
                      onClick={() => setOnboardingIndex(p => p + 1)}
                      className="flex-grow py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition text-xs shadow-md shadow-emerald-500/10 active:scale-[0.98]"
                    >
                      {onboardingIndex === 4 ? t.getStarted : t.next}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col justify-between h-full pt-2 pb-1">
                <div className="flex justify-between items-center bg-slate-900/40 py-2 px-4 rounded-full border border-slate-850 text-[10px] text-slate-400">
                  <span className="font-semibold text-emerald-400">{isAr ? "إعداد ميزانيتك" : "Budget Calibration"}</span>
                  <span className="font-mono text-slate-500">{t.step} {setupStep} {t.of} 6</span>
                </div>

                {setupStep === 1 && (
                  <div className="my-auto space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-md font-bold text-white">{t.salaryInput}</h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{isAr ? "هذا الدخل الأساسي المعتمد لبناء خطتك." : "This base is used to draft your daily secure spending thresholds."}</p>
                    </div>
                    <input
                      type="number"
                      value={wizardSalary || ""}
                      onChange={(e) => setWizardSalary(Number(e.target.value))}
                      className="w-full text-center text-2xl font-black bg-slate-900 border border-slate-800 rounded-xl py-3.5 text-emerald-400 outline-none focus:border-emerald-500 font-mono shadow-inner shadow-black/40"
                      placeholder="14000"
                    />
                  </div>
                )}

                {setupStep === 2 && (
                  <div className="my-auto space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-md font-bold text-white">{t.salaryDayInput}</h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{isAr ? "نحدد هذا التاريخ لحساب فترات الدورة المالية." : "Expected date of depositing payroll to calibrate month intervals."}</p>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={wizardSalaryDay || ""}
                      onChange={(e) => setWizardSalaryDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                      className="w-full text-center text-2xl font-black bg-slate-900 border border-slate-800 rounded-xl py-3.5 text-emerald-400 outline-none focus:border-emerald-500 font-mono shadow-inner shadow-black/40"
                      placeholder="25"
                    />
                  </div>
                )}

                {setupStep === 3 && (
                  <div className="my-auto space-y-3.5">
                    <div className="space-y-1">
                      <h3 className="text-md font-bold text-white">{t.fixedCostsInput}</h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{t.fixedCostsDesc}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={isAr ? "اسم الفاتورة (إيجار، إنترنت...)" : "Invoice (Rent, WiFi...)"}
                        value={tempFixedName}
                        onChange={(e) => setTempFixedName(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                      <input
                        type="number"
                        placeholder={isAr ? "المبلغ الشهري" : "Amount Monthly"}
                        value={tempFixedAmount || ""}
                        onChange={(e) => setTempFixedAmount(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!tempFixedName || !tempFixedAmount) return;
                        setWizardFixedList(p => [
                          ...p,
                          { id: "wf-" + Date.now(), name: tempFixedName, amount: Number(tempFixedAmount), category: tempFixedCategory }
                        ]);
                        setTempFixedName("");
                        setTempFixedAmount("");
                      }}
                      className="w-full py-2.5 bg-slate-900 text-emerald-400 font-bold text-xs rounded-xl border border-slate-800 hover:bg-slate-850 active:scale-95 transition"
                    >
                      {isAr ? "+ حفظ الالتزام الشهري" : "+ Save commitment"}
                    </button>

                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {wizardFixedList.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 text-[11px] text-right">
                          <span className="font-semibold text-slate-305">{item.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-rose-500 font-mono">-{item.amount} {t.currency}</span>
                            <Trash2 
                              className="h-3.5 w-3.5 text-rose-500 cursor-pointer active:scale-90" 
                              onClick={() => setWizardFixedList(p => p.filter(x => x.id !== item.id))} 
                            />
                          </div>
                        </div>
                      ))}
                      {wizardFixedList.length === 0 && (
                        <p className="text-center text-[10px] text-slate-500 italic py-2">
                          {isAr ? "لا توجد التزامات مدونة حالياً." : "No commitments logged yet."}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {setupStep === 4 && (
                  <div className="my-auto space-y-3.5">
                    <div className="space-y-1">
                      <h3 className="text-md font-bold text-white">{t.extraIncomeInput}</h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{isAr ? "مصادر دخل دورية مرنة أو أعمال جانبية تدعم استقرار ميزانيتك:" : "Any extra consistent sources, consulting dividends or side work:"}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={isAr ? "عمل مرن، تجارة..." : "Side hustle, tutoring..."}
                        value={tempIncSource}
                        onChange={(e) => setTempIncSource(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                      <input
                        type="number"
                        placeholder={isAr ? "المبلغ" : "Amount"}
                        value={tempIncAmount || ""}
                        onChange={(e) => setTempIncAmount(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!tempIncSource || !tempIncAmount) return;
                        setWizardIncomes(p => [
                          ...p,
                          { id: "wi-" + Date.now(), source: tempIncSource, amount: Number(tempIncAmount) }
                        ]);
                        setTempIncSource("");
                        setTempIncAmount("");
                      }}
                      className="w-full py-2.5 bg-slate-900 text-emerald-400 font-bold text-xs rounded-xl border border-slate-800 hover:bg-slate-850 active:scale-95 transition"
                    >
                      {isAr ? "+ إضافة مصدر دخل ثانوي" : "+ Add Side Income"}
                    </button>

                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {wizardIncomes.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 text-[11px] text-right">
                          <span className="font-semibold text-slate-305">{item.source}</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-emerald-400">+{item.amount} {t.currency}</span>
                            <Trash2 
                              className="h-3.5 w-3.5 text-rose-500 cursor-pointer active:scale-90" 
                              onClick={() => setWizardIncomes(p => p.filter(x => x.id !== item.id))} 
                            />
                          </div>
                        </div>
                      ))}
                      {wizardIncomes.length === 0 && (
                        <p className="text-center text-[10px] text-slate-500 italic py-2">
                          {isAr ? "لا توجد عوائد إضافية مدونة." : "No side incomes logged yet."}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {setupStep === 5 && (
                  <div className="my-auto space-y-3.5">
                    <div className="space-y-1">
                      <h3 className="text-md font-bold text-white">{t.addGoalTitle}</h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{isAr ? "حدد هدفًا طموحًا تود الادخار تدريجيًا لتحقيقه:" : "Define an exciting goal to purchase using customized savings schedule:"}</p>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder={isAr ? "اسم السلعة (أيفون، حاسوب، رحلة...)" : "Goal item (e.g. laptop, flight...)"}
                        value={tempGoalName}
                        onChange={(e) => setTempGoalName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder={isAr ? "المبلغ الإجمالي" : "Price tag"}
                          value={tempGoalPrice || ""}
                          onChange={(e) => setTempGoalPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                        />
                        <input
                          type="date"
                          value={tempGoalDate}
                          onChange={(e) => setTempGoalDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-400 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddGoalInWizard}
                      className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition"
                    >
                      {isAr ? "+ حفظ الهدف في الميزانية" : "+ Add Goal to Ledger"}
                    </button>

                    <div className="text-[10px] text-slate-500 text-center leading-normal">
                      {isAr ? "* سيقوم محرك غيوم الذكاء الاصطناعي بتخصيص جداول ادخار أسبوعية تضمن تملك الأصول بموعدها." : "* Al-Ameen AI will formulate weekly schedules to match due dates."}
                    </div>
                  </div>
                )}

                {setupStep === 6 && (
                  <div className="my-auto space-y-3.5">
                    <h3 className="text-md font-bold text-white text-center">{t.summaryTitle}</h3>
                    <p className="text-[10px] text-slate-400 text-center leading-normal">{t.summaryText}</p>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 space-y-2.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{isAr ? "الدخل الأساسي والفرعي:" : "Base & Side revenues:"}</span>
                        <span className="text-emerald-400 font-bold">{wizardSalary + wizardIncomes.reduce((s, i) => s + i.amount, 0)} {t.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{isAr ? "الفواتير المقررة مسبقاً:" : "Fixed committed outgoings:"}</span>
                        <span className="text-yellow-600 font-bold">{wizardFixedList.reduce((s, f) => s + f.amount, 0)} {t.currency}</span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between">
                        <span className="text-slate-400">{isAr ? "تقدير ميزانية الأمان اليومية:" : "Daily disposable limit:"}</span>
                        <span className="text-emerald-300 font-extrabold text-[13px]">
                          {Math.max(1, Math.round(((wizardSalary - wizardFixedList.reduce((s, f) => s + f.amount, 0)) / 30)))} {t.currency}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] leading-relaxed">
                      📢 {isAr ? "جاهز للانطلاق! يمكنك تعديل الإيرادات والالتزامات في أي وقت لاحقاً." : "Ready to explore! Adjust values any time dynamically."}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-slate-900">
                  {setupStep > 1 && (
                    <button
                      onClick={() => setSetupStep(p => p - 1)}
                      className="py-2 px-3 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-850 active:scale-95 transition text-[11px] font-bold"
                    >
                      {t.back}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (setupStep < 6) {
                        setSetupStep(p => p + 1);
                      } else {
                        handleSaveSetupWizard();
                      }
                    }}
                    className="flex-grow py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition text-xs shadow-md shadow-emerald-500/10 cursor-pointer text-center"
                  >
                    {setupStep === 6 ? t.finish : t.next}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {state.isSetupCompleted && !isPinScreenActive && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-950 relative h-full">
            
            <AnimatePresence>
              {state.notifications.some(n => !n.read) && (
                <div id="inline-notification-toast" className="absolute top-2 inset-x-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-100 z-50 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="text-[10px] font-bold text-white">
                          {isAr ? state.notifications[0].titleAr : state.notifications[0].titleEn}
                        </h4>
                        <p className="text-[8px] text-slate-400 mt-0.5 leading-normal">
                          {isAr ? state.notifications[0].bodyAr : state.notifications[0].bodyEn}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 justify-end text-[8px] font-bold">
                    <button
                      onClick={() => handleNotificationAction(state.notifications[0], 'dont_remember')}
                      className="px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-850 rounded"
                    >
                      {isAr ? "لا أتذكر 🤔" : "Don't remember"}
                    </button>
                    <button
                      onClick={() => handleNotificationAction(state.notifications[0], 'total_only')}
                      className="px-2 py-0.5 bg-emerald-400 text-slate-950 rounded"
                    >
                      {isAr ? "تسجيل سريع" : "Quick log"}
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>

            <div className="flex-grow overflow-y-auto px-4 pt-3 pb-16 space-y-3.5 max-h-[750px]">
              
               {/* ==================== TAB 1: HOME ==================== */}
              {activeTab === 'home' && (
                <div id="home-dashboard-view" className="space-y-3.5">
                  <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 rounded-xl p-3 shadow-inner">
                    <div>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{t.appName}</span>
                      <h2 className="text-sm font-black text-white">{isAr ? "عضو محلي مميز" : "Premium Member"} ✨</h2>
                    </div>
                    <button
                      onClick={() => {
                        setSupportSuccess(false);
                        setSupportError("");
                        setShowSupportModal(true);
                      }}
                      className="py-1.5 px-3 bg-gradient-to-r from-rose-500/15 to-rose-600/10 hover:from-rose-500/20 hover:to-rose-600/15 text-rose-300 border border-rose-500/30 hover:border-rose-500/45 text-[10px] font-black rounded-xl flex items-center gap-1.5 transition bounce-click shadow-md shadow-rose-950/20 cursor-pointer"
                    >
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                      </span>
                      <span>Support ❤️</span>
                    </button>
                  </div>

                  <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/30 border border-slate-850 rounded-[24px] p-4.5 text-center relative overflow-hidden shadow-lg shadow-black/10">
                    <p className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">{t.safeDailySpend}</p>
                    <h3 className="text-3xl font-black text-emerald-400 font-mono tracking-tight my-1">
                      {m.dailyDisposableAllocation} <span className="text-sm text-emerald-500 font-sans">{t.currency}</span>
                    </h3>
                    <div className="flex justify-center items-center gap-1.5 mt-2 text-[9px] text-slate-400 bg-slate-950/40 py-1 px-3 rounded-full w-fit mx-auto border border-slate-850">
                      <Calendar className="h-3 w-3 text-emerald-400" />
                      <span>{isAr ? `متبقي ${m.daysRemaining} يوم على الراتب التالي` : `${m.daysRemaining} days left until payroll`}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-center">
                      <p className="text-[8px] text-slate-500 font-semibold mb-0.5">{t.totalSalary}</p>
                      <p className="text-[11px] font-bold text-white font-mono">{m.grossMonthlyRevenue} <span className="text-[7px]">{t.currency}</span></p>
                    </div>
                    <div className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-center">
                      <p className="text-[8px] text-slate-500 font-semibold mb-0.5">{t.fixedOverhead}</p>
                      <p className="text-[11px] font-bold text-yellow-600 font-mono">-{m.directFixedLiabilities} <span className="text-[7px]">{t.currency}</span></p>
                    </div>
                    <div className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-center">
                      <p className="text-[8px] text-slate-500 font-semibold mb-0.5">{isAr ? "المسجل" : "Spent"}</p>
                      <p className="text-[11px] font-bold text-rose-500 font-mono">-{m.totalDynamicExpensesThisMonth} <span className="text-[7px]">{t.currency}</span></p>
                    </div>
                  </div>

                  {state.aiInsights.length > 0 && (
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                        <div className="flex items-center gap-1">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-[9px] font-bold text-white">{t.aiInsights}</span>
                        </div>
                        <button 
                          onClick={handleFetchInsights} 
                          disabled={insightsLoading}
                          className="p-1 rounded bg-slate-950 border border-slate-800 text-[8px] text-emerald-400 flex items-center gap-1 hover:bg-slate-900 transition"
                        >
                          <RefreshCw className={`h-2.5 w-2.5 ${insightsLoading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                        {isAr ? state.aiInsights[0].textAr : state.aiInsights[0].textEn}
                      </p>
                    </div>
                  )}

                  {/* Borrowed Money Card (Owed to Me) */}
                  <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4.5 space-y-3.5 shadow-lg">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                      <div className="flex items-center gap-2">
                        <HandCoins className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">{t.borrowedSectionTitle}</span>
                      </div>
                      <button
                        onClick={() => setShowLentModal(true)}
                        className="py-1 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[9px] rounded-lg transition cursor-pointer"
                      >
                        + {t.addLentBtn}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850/60">
                        <p className="text-[8px] text-slate-500 font-semibold mb-0.5">{t.totalLentPending}</p>
                        <p className="text-[11px] font-bold text-amber-500 font-mono">{m.totalLentPending} {t.currency}</p>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850/60">
                        <p className="text-[8px] text-slate-500 font-semibold mb-0.5">{t.totalLentRecovered}</p>
                        <p className="text-[11px] font-bold text-emerald-400 font-mono">{m.totalLentRecovered} {t.currency}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                      {(state.borrowedRecords || []).map((rec) => (
                        <div
                          key={rec.id}
                          onClick={() => setActiveLentRecord(rec)}
                          className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${rec.isRepaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-100">{rec.debtorName}</p>
                              <p className="text-[7.5px] text-slate-500">{t.lentDate}: {rec.lentDate} {rec.dueDate ? `• ${t.dueDate}: ${rec.dueDate}` : ""}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-bold font-mono text-white">
                              {rec.amount} {t.currency}
                            </p>
                            {rec.repaidAmount > 0 && rec.repaidAmount < rec.amount && (
                              <p className="text-[7px] text-emerald-400 font-mono">
                                {t.partiallyRepaid}: {rec.repaidAmount}
                              </p>
                            )}
                            <Badge text={rec.isRepaid ? t.isRepaid : t.notRepaid} color={rec.isRepaid ? "emerald" : "amber"} />
                          </div>
                        </div>
                      ))}

                      {(state.borrowedRecords || []).length === 0 && (
                        <p className="text-center text-[9px] text-slate-500 italic py-3">{t.noLentRecords}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold">{t.recentExpenses}</span>
                      <span className="text-emerald-400 font-semibold cursor-pointer" onClick={() => setActiveTab('expenses')}>
                        {isAr ? "عرض الكل ←" : "See All ←"}
                      </span>
                    </div>

                    <div className="space-y-1 bg-slate-900/20 rounded-xl border border-slate-900 p-1">
                      {state.expenses.slice(0, 3).map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between p-2 bg-slate-900/60 border border-slate-850 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base text-emerald-450">💸</span>
                            <div className="text-right">
                              <p className="font-bold text-white text-[10px]">
                                {t.categories[exp.category as keyof typeof t.categories] || exp.category}
                              </p>
                              {exp.note && <p className="text-[8px] text-slate-500">{exp.note}</p>}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-rose-500 text-[11px]">
                            -{exp.amount} {t.currency}
                          </span>
                        </div>
                      ))}
                      {state.expenses.length === 0 && (
                        <p className="text-center text-[9px] text-slate-500 italic py-3">{t.emptyExpenses}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB 2: EXPENSES ==================== */}
              {activeTab === 'expenses' && (
                <div id="expenses-ledger-view" className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white">{t.allExpenses}</h3>
                    <span className="bg-slate-900 py-1 px-2 border border-slate-850 rounded-lg text-[8px] text-slate-400 font-mono">
                      {state.expenses.length} Records
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 pl-7 pr-2.5 text-[10px] text-white outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-lg text-[9px] px-2 outline-none text-slate-300 font-semibold cursor-pointer font-sans"
                    >
                      <option value="All">{isAr ? "جميع الفئات" : "All Categories"}</option>
                      {Object.keys(t.categories).map(catKey => (
                        <option key={catKey} value={catKey}>{t.categories[catKey as keyof typeof t.categories]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
                    {filteredExpensesList.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🍔</span>
                          <div>
                            <p className="font-bold text-white text-[10px]">
                              {t.categories[exp.category as keyof typeof t.categories] || exp.category}
                            </p>
                            <p className="text-[8px] text-slate-500">{exp.date} {exp.note ? `• ${exp.note}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-rose-500 text-[10px]">
                            -{exp.amount} {t.currency}
                          </span>
                          <Trash2
                            className="h-3.5 w-3.5 text-rose-800 cursor-pointer hover:text-rose-600 shrink-0"
                            onClick={() => handleRemoveExpense(exp.id)}
                          />
                        </div>
                      </div>
                    ))}
                    {filteredExpensesList.length === 0 && (
                      <p className="text-center text-[10px] text-slate-600 italic py-10">لا توجد سجلات مطابقة للبحث.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== TAB 3: GOALS ==================== */}
              {activeTab === 'goals' && (
                <div id="goals-savings-view" className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs font-bold text-white">
                    <h3>{t.activeGoals}</h3>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-2">
                    <input
                      type="text"
                      placeholder={isAr ? "اسم الهدف المطلوب (أبل ماك بوك، سفر...)" : "Goal item (e.g. iPad Pro)"}
                      value={tempGoalName}
                      onChange={(e) => setTempGoalName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-[10px] text-white outline-none font-sans"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder={isAr ? "سعر التجزئة" : "Retail price"}
                        value={tempGoalPrice}
                        onChange={(e) => setTempGoalPrice(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-[10px] text-white outline-none font-mono"
                      />
                      <input
                        type="date"
                        value={tempGoalDate}
                        onChange={(e) => setTempGoalDate(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-[10px] text-slate-400 outline-none font-sans"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!tempGoalName || !tempGoalPrice) return;
                        const final: SavingGoal = {
                          id: "goal-" + Date.now(),
                          name: tempGoalName,
                          targetAmount: Number(tempGoalPrice),
                          savedAmount: 0,
                          targetDate: tempGoalDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        };
                        setState(prev => ({ ...prev, goals: [...prev.goals, final] }));
                        setTempGoalName("");
                        setTempGoalPrice("");
                        setTempGoalDate("");
                      }}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black rounded-lg cursor-pointer transition font-sans"
                    >
                      + {isAr ? "إنشاء هدف الادخار الجديد" : "Create Saving Target"}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {state.goals.map((goal) => {
                      const completedPct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100)) || 0;
                      return (
                        <div
                          key={goal.id}
                          onClick={() => setActiveGoalDetails(goal)}
                          className="bg-slate-900 border border-slate-850 rounded-xl p-3 hover:border-emerald-500/20 cursor-pointer space-y-2 transition duration-200 active:scale-98"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-[11px] text-white">{goal.name}</h4>
                              <p className="text-[8px] text-slate-500 font-sans">{t.goalPrice}: {goal.targetAmount} {t.currency}</p>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-550/10 px-1.5 py-0.5 rounded-full">
                              {completedPct}%
                            </span>
                          </div>

                          <div className="h-1.5 bg-slate-950 w-full rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completedPct}%` }}></div>
                          </div>

                          <div className="flex justify-between items-center text-[8px] pt-0.5 text-slate-450 font-mono">
                            <span>{isAr ? "المدخر حالياً:" : "Saved:"} {goal.savedAmount} {t.currency}</span>
                            <span>{isAr ? "المتبقي:" : "Left:"} {goal.targetAmount - goal.savedAmount} {t.currency}</span>
                          </div>
                        </div>
                      );
                    })}
                    {state.goals.length === 0 && (
                      <p className="text-center text-[10px] text-slate-600 italic py-10">{t.emptyGoals}</p>
                    )}
                  </div>
                </div>
              )}


              {/* ==================== TAB 4: AI COACH ==================== */}
              {activeTab === 'coach' && (
                <div id="ai-chat-coach" className="flex flex-col h-[460px] justify-between relative">
                  
                  {/* Suggestions block */}
                  <div className="flex items-center gap-1.5 p-2 bg-slate-900 border border-slate-850 rounded-xl mb-2 text-[10px] justify-between">
                    <span className="text-slate-400 font-bold">{isAr ? "خبير مالي متصل" : "Financial Expert Active"}</span>
                    <span className="text-emerald-400 font-semibold">{t.appName} GPT ⚡</span>
                  </div>

                  {/* Conversation Feed */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 max-h-[320px]">
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-emerald-500 text-slate-950 font-semibold rounded-br-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* ACTION RECOMMENDATION BTN */}
                          {msg.actionPayload && (
                            <button
                              onClick={() => handleApproveAIChatSuggestion(msg.actionPayload)}
                              className="mt-2.5 w-full py-1.5 bg-emerald-450 hover:bg-emerald-500 text-slate-950 font-bold rounded text-[10px] cursor-pointer"
                            >
                              🚀 {isAr ? "تأكيد وتسجيل المصروف" : "Confirm and record spending"} ({msg.actionPayload.amount} AED)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-900 border border-slate-805 rounded-2xl p-3 text-xs text-slate-400 animate-pulse">
                          {isAr ? "الأمين بصدد فحص ميزانيتك..." : "Al-Ameen is studying variables..."}
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef}></div>
                  </div>

                  {/* Dialogue trigger input */}
                  <div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-900">
                    <input
                      type="text"
                      placeholder={t.chatPlaceholder}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendPromptMessage();
                      }}
                      className="flex-1 bg-slate-900 border border-slate-850 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleSendPromptMessage()}
                      className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl font-bold cursor-pointer hover:bg-emerald-400 active:scale-95 transition"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* ==================== TAB 5: PROFILE ==================== */}
              {activeTab === 'profile' && (
                <div id="profile-management" className="space-y-4">
                  <h3 className="text-sm font-bold text-white mb-2">{t.profileSettings}</h3>

                  {/* Support Finora Card */}
                  <div className="bg-gradient-to-r from-rose-950/25 to-slate-900/90 p-3.5 rounded-2xl border border-rose-500/20 flex justify-between items-center shadow-lg hover:border-rose-500/35 transition duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-sm shrink-0">❤️</div>
                      <div className="text-right">
                        <span className="text-xs text-slate-100 font-bold block">{isAr ? "ادعم استمرار Finora" : "Support Finora"}</span>
                        <span className="text-[8px] text-slate-400 block">{isAr ? "مساهمتك تساعد أحمد فوكس في تطوير التطبيق" : "Help Ahmed Foox with server costs"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSupportSuccess(false);
                        setSupportError("");
                        setShowSupportModal(true);
                      }}
                      className="py-1.5 px-3 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl text-[10px] font-black cursor-pointer shadow-md shadow-rose-500/10 active:scale-95 transition"
                    >
                      {isAr ? "ادعمنا الآن" : "Support"}
                    </button>
                  </div>

                  {/* Localization Switcher Custom Card */}
                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-850 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-slate-100 font-bold">{t.language}</span>
                    </div>
                    <button
                      onClick={handleToggleLanguage}
                      className="py-1 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-emerald-400 cursor-pointer"
                    >
                      {isAr ? "English" : "العربية"}
                    </button>
                  </div>

                  {/* Pin Security Simulation Toggle */}
                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-850 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-slate-100 font-bold">{t.security} (PIN 1234)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pinLockEnabled}
                      onChange={(e) => {
                        setPinLockEnabled(e.target.checked);
                        localStorage.setItem("finora-pin-lock-enabled", e.target.checked ? "true" : "false");
                      }}
                      className="h-4 w-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Clouds REST Backup Database parameters */}
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-100">{t.cloudBackup}</span>
                    </div>

                    {!state.isLoggedIn ? (
                      <form onSubmit={handleDbSyncAuth} className="space-y-2 text-xs">
                        {authError && <p className="text-[10px] text-rose-500 bg-rose-500/10 p-2 rounded">{authError}</p>}
                        {authSuccess && <p className="text-[10px] text-emerald-400 bg-emerald-500/10 p-2 rounded">{authSuccess}</p>}
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">{isAr ? "البريد الإلكتروني" : "Email"}</label>
                          <input
                            type="email"
                            value={dbEmail}
                            onChange={(e) => setDbEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-550 mb-1">{isAr ? "كلمة المرور" : "Password"}</label>
                          <input
                            type="password"
                            value={dbPassword}
                            onChange={(e) => setDbPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex gap-2 pt-1 font-semibold text-[10px] mb-1">
                          <button
                            type="button"
                            onClick={() => setAuthFormMode(authFormMode === 'login' ? 'register' : 'login')}
                            className="text-slate-400 cursor-pointer underline"
                          >
                            {authFormMode === 'login' ? (isAr ? "سجل كحساب جديد" : "Sign up new user") : (isAr ? "تسجيل دخول حساب مستقر" : "Go to Login form")}
                          </button>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer"
                        >
                          {authFormMode === 'login' ? (isAr ? "مزامنة واسترجاع" : "Verify & Backup") : (isAr ? "تثبيت الحساب السحابي" : "Signup Secure Node")}
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <p className="text-[10px] text-slate-400 leading-normal">
                          {isAr ? "أنت مسجل باسم" : "Currently connected with"}: <strong className="text-white">{state.userEmail}</strong>
                        </p>
                        {authSuccess && <p className="text-[10px] text-emerald-400 bg-emerald-500/10 p-2 rounded">{authSuccess}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={handleCloudSyncForce}
                            className="flex-grow py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-[10px] cursor-pointer"
                          >
                            {isAr ? "نسخ احتياطي فوري ⚡" : "Backup Raw State Now"}
                          </button>
                          <button
                            onClick={handleLogOutCloud}
                            className="px-3 py-2 bg-slate-800 text-rose-500 rounded-xl border border-slate-750 font-bold text-[10px] cursor-pointer"
                          >
                            {isAr ? "خروج" : "Log out"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Export and reset widgets */}
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-2">
                    <button
                      onClick={handleExportPDF}
                      className="w-full py-2.5 bg-slate-950 border border-slate-800 text-slate-350 rounded-xl text-xs font-semibold hover:border-slate-705 cursor-pointer"
                    >
                      {isAr ? "تصدير نسخة تقرير نصوص (TXT)" : "Export plaintext raw report (TXT)"}
                    </button>
                    <button
                      onClick={handleFactoryResetWholeApp}
                      className="w-full py-2.5 bg-rose-950/20 text-rose-500 rounded-xl text-xs font-semibold border border-rose-950 cursor-pointer"
                    >
                      {t.resetData}
                    </button>
                  </div>

                  {/* Developer Credit Signature with Ahmed Fox */}
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl text-center space-y-1 shadow-md">
                    <p className="text-[10px] text-slate-500 font-bold">{isAr ? "هوية مطور التطبيق" : "Application Developer"}</p>
                    <h4 className="text-xs font-black text-white">{isAr ? "تم التطوير والإنشاء بواسطة: أحمد فوكس" : "Developed & Created by Ahmed Fox"}</h4>
                    <p className="text-[8px] text-emerald-400 font-mono tracking-widest uppercase mb-1">Ahmed Fox • Finora Architect</p>
                  </div>

                  {/* Mock recurring bills parser suggestions under profile */}
                  {detectedBills.length > 0 && (
                    <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold text-white">{isAr ? "رصد اشتراك ثابت منسي 👀" : "Detected Forgotten Bill Candidate"}</span>
                      {detectedBills.map((b, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                          <div>
                            <p className="font-bold text-slate-100">{b.name}</p>
                            <span className="text-[9px] text-slate-500 font-mono">{isAr ? "قيمة مقدرة:" : "Est:"} {b.estimatedAmount} {t.currency}</span>
                          </div>
                          <button
                            onClick={() => handleAcceptDetectedBill(b)}
                            className="py-1 px-2.5 bg-emerald-500 text-slate-950 text-[9px] font-bold rounded"
                          >
                            {isAr ? "اعتماده واضافته" : "Add recurring"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* 2. FLOATING RECORD QUICK SHEET INPUT MODAL */}
            <AnimatePresence>
              {showAddModal && (
                <div id="add-modal-overlay" className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end">
                  <motion.div
                    initial={{ y: 250, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 250, opacity: 0 }}
                    className="bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 space-y-4 shadow-xl"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <h4 className="text-sm font-bold text-white">{t.quickAddPrompt}</h4>
                      <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-350 text-xs">✕</button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">{isAr ? "مبلغ المصروف" : "Expense Amount"}</label>
                        <input
                          type="number"
                          autoFocus
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          className="w-full text-2xl font-bold bg-slate-950 border border-slate-850 text-emerald-400 rounded-xl py-3 px-3 outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-505 mb-1">{isAr ? "الفئة الكلية" : "Category"}</label>
                        <select
                          value={addCategory}
                          onChange={(e) => setAddCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer"
                        >
                          {Object.keys(t.categories).map(catKey => (
                            <option key={catKey} value={catKey}>{t.categories[catKey as keyof typeof t.categories]}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-505 mb-1">{isAr ? "ملاحظة / تفاصيل" : "Note / Details"}</label>
                        <input
                          type="text"
                          placeholder="مثال: ستاربكس، بقالة..."
                          value={addNote}
                          onChange={(e) => setAddNote(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleLogManualExpense}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      {t.saveAndLog}
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* 3. SAVINGS GOAL DETAILED DETAIL MODAL */}
            <AnimatePresence>
              {activeGoalDetails && (
                <div id="goal-details-overlay" className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end">
                  <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    className="bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <h4 className="text-sm font-bold text-white">{activeGoalDetails.name}</h4>
                      <button onClick={() => setActiveGoalDetails(null)} className="text-slate-500 text-xs">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between font-mono">
                        <span className="text-slate-400">{isAr ? "هدف التحقيق بالكامل:" : "Total retail cost target:"}</span>
                        <span className="text-white font-bold">{activeGoalDetails.targetAmount} {t.currency}</span>
                      </div>

                      <div className="bg-slate-955 p-3 rounded-xl border border-slate-850 space-y-2">
                        <p className="text-[10px] font-bold text-emerald-400">{isAr ? "توصية ادخار الأمين المستحسنة:" : "AI Calculated Trajectory Strategy"}</p>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          {isAr 
                            ? `للوصول لهدفك بموعده المستهدف في تاريخ ${activeGoalDetails.targetDate}، يقترح محرك النصح ادخار متزن بمقدار تقريبي ${Math.ceil((activeGoalDetails.targetAmount - activeGoalDetails.savedAmount)/30)} درهم يومياً.`
                            : `To afford this item on track by ${activeGoalDetails.targetDate}, schedule around ${Math.ceil((activeGoalDetails.targetAmount - activeGoalDetails.savedAmount)/30)} AED daily.`
                          }
                        </p>
                      </div>

                      {/* Deposit Input */}
                      <div className="space-y-1">
                        <label className="block text-[9px] text-slate-500 font-bold">{isAr ? "ترحيل مبلغ حصالة من الرصيد المتبقي:" : "Transfer and allocate immediate cash deposit:"}</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="كم تريد إيداعه؟"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="bg-slate-955 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none flex-1 font-mono"
                          />
                          <button
                            onClick={handleSaveDepositIntoGoal}
                            className="bg-emerald-500 text-slate-950 font-bold rounded-xl py-2 px-4 text-xs cursor-pointer"
                          >
                            {isAr ? "ترحيل للهدف" : "Deposit"}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleRemoveGoal(activeGoalDetails.id);
                          setActiveGoalDetails(null);
                        }}
                        className="w-full py-2 bg-rose-950/15 border border-rose-950 text-rose-500 rounded-xl font-bold text-[10px] mt-4 cursor-pointer"
                      >
                        {isAr ? "حذف هذا الهدف والبدء من جديد" : "Delete saving objective"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* LENT FORM MODAL overlay */}
              {showLentModal && (
                <div id="lent-modal-overlay" className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end">
                  <motion.div
                    initial={{ y: 250, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 250, opacity: 0 }}
                    className="bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 space-y-4 shadow-xl text-right"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <h4 className="text-sm font-bold text-white">{t.addLentBtn}</h4>
                      <button onClick={() => setShowLentModal(false)} className="text-slate-500 hover:text-slate-350 text-xs">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">{t.debtorName}</label>
                        <input
                          type="text"
                          placeholder={isAr ? "مثال: أحمد، محمد..." : "e.g. Ahmed, Mohammed..."}
                          value={lentDebtorName}
                          onChange={(e) => setLentDebtorName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-emerald-500 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">{t.lentAmount} ({t.currency})</label>
                        <input
                          type="number"
                          value={lentAmount}
                          onChange={(e) => setLentAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-emerald-500 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">{t.lentDate}</label>
                        <input
                          type="date"
                          value={lentDate}
                          onChange={(e) => setLentDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">{t.dueDate}</label>
                        <input
                          type="date"
                          value={lentDueDate}
                          onChange={(e) => setLentDueDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">{t.notes}</label>
                        <input
                          type="text"
                          placeholder={isAr ? "سلفة أو دين لشراء غرض..." : "Notes or details..."}
                          value={lentNotes}
                          onChange={(e) => setLentNotes(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-emerald-500 font-sans"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          onClick={() => setShowLentModal(false)}
                          className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                        >
                          {t.cancel}
                        </button>
                        <button
                          onClick={handleLogLentRecord}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs cursor-pointer"
                        >
                          {t.save}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* SETTLE LIABILITY RECOVERY MODAL overlay */}
              {activeLentRecord && (
                <div id="settle-modal-overlay" className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end">
                  <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    className="bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 space-y-4 text-right"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                      <h4 className="text-sm font-bold text-white">{t.recoveryActions}</h4>
                      <button onClick={() => setActiveLentRecord(null)} className="text-slate-500 text-xs">✕</button>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-2 text-xs">
                      <p className="text-slate-400 text-right">
                        {isAr ? "المدين الحالي" : "Current Debtor"}: <strong className="text-white">{activeLentRecord.debtorName}</strong>
                      </p>
                      <p className="text-slate-400 text-right">
                        {isAr ? "المبلغ المتبقي المعلق برسم التحصيل" : "Outstanding balance to recover"}: <strong className="text-amber-500 font-mono">{activeLentRecord.amount - activeLentRecord.repaidAmount} {t.currency}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500 text-right">
                        {isAr ? "إجمالي مبلغ القرض الأساسي" : "Initial borrowing principal"}: {activeLentRecord.amount} {t.currency} • {t.lentDate}: {activeLentRecord.lentDate}
                      </p>
                      {activeLentRecord.notes && (
                        <p className="text-[9px] text-slate-500 bg-slate-900 p-2 rounded-lg text-right whitespace-pre-wrap font-sans">
                          {t.notes}: {activeLentRecord.notes}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Partial input */}
                      <div className="space-y-1">
                        <label className="block text-[9px] text-slate-500 font-bold text-right">{t.repayPartialAmt} :</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder={isAr ? "أدّ المبلغ" : "Amount"}
                            value={recoverAmount}
                            onChange={(e) => setRecoverAmount(e.target.value)}
                            className="bg-slate-955 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none flex-1 font-mono text-center"
                          />
                          <button
                            onClick={() => {
                              const ramt = Number(recoverAmount);
                              if (!ramt || ramt <= 0) {
                                alert(isAr ? "يرجى تحديد تفاصيل الدفعة بدقة" : "Please specify proper decimal amount.");
                                return;
                              }
                              handleSettleLentRecord(activeLentRecord.id, 'partial', ramt);
                            }}
                            className="bg-amber-500/10 border border-amber-500 text-amber-500 hover:bg-amber-500/20 font-bold rounded-xl py-2 px-4 text-xs cursor-pointer"
                          >
                            {t.repayPartial}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSettleLentRecord(activeLentRecord.id, 'full')}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs cursor-pointer flex justify-center items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {t.repayFull}
                      </button>

                      <button
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            borrowedRecords: (prev.borrowedRecords || []).filter(r => r.id !== activeLentRecord.id)
                          }));
                          setActiveLentRecord(null);
                        }}
                        className="w-full py-2 bg-rose-955/15 border border-rose-950 text-rose-500 rounded-xl font-bold text-[10px] cursor-pointer"
                      >
                        {isAr ? "حذف هذا القيد المالي نهائياً" : "Delete record from lended list permanently"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* SUPPORT FINORA ❤️ INTERACTIVE MODAL/DRAWER */}
              {showSupportModal && (
                <div id="support-finora-overlay" className="absolute inset-0 bg-black/70 z-[80] flex flex-col justify-end">
                  <motion.div
                    initial={{ y: 350, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 350, opacity: 0 }}
                    className="bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-5 space-y-4 shadow-2xl text-right max-h-[90%] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h4 className="text-sm font-black text-rose-450 flex items-center gap-1.5">
                        <span>❤️</span>
                        <span>{isAr ? "دعم وتطوير Finora" : "Support Finora"}</span>
                      </h4>
                      <button 
                        onClick={() => {
                          setShowSupportModal(false);
                          setSupportSuccess(false);
                          setSupportError("");
                        }} 
                        className="text-slate-550 hover:text-white text-xs p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {!supportSuccess ? (
                      <div className="space-y-4 text-xs">
                        <div className="text-center p-3.5 bg-rose-500/5 rounded-2xl border border-rose-500/10 space-y-1">
                          <p className="font-extrabold text-white text-[12px]">✨ {isAr ? "اجعل خططك القادمة ممكنة" : "Empower Future Innovation"}</p>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                            {isAr 
                              ? "كل تبرع سخي يساعد أحمد فوكس في تمويل خادم قاعدة البيانات وسحابة الذكاء الاصطناعي وبقاء الخدمة مجانية للجميع."
                              : "Donations help Ahmed Foox pay for continuous server costs, Neon database replication, and Gemini AI tokens."
                            }
                          </p>
                        </div>

                        {/* Preset Buttons */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-slate-450 font-bold">{isAr ? "اختر قيمة الدعم المقترحة:" : "Choose a Donation Amount:"}</label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {["1", "3", "5", "10", "20"].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setSupportAmountPreset(preset);
                                  setSupportError("");
                                }}
                                className={`py-2 px-1 text-[11px] font-black font-mono rounded-xl border transition cursor-pointer ${
                                  supportAmountPreset === preset 
                                    ? "bg-rose-500 border-rose-400 text-slate-950 shadow-md shadow-rose-500/25 scale-[1.03]" 
                                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                                }`}
                              >
                                ${preset}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSupportAmountPreset("custom");
                              setSupportError("");
                            }}
                            className={`w-full py-2.5 text-[10px] font-bold rounded-xl border transition cursor-pointer ${
                              supportAmountPreset === "custom"
                                ? "bg-rose-500 border-rose-400 text-slate-950 font-black scale-[1.01]"
                                : "bg-slate-955 border-slate-800 text-slate-350 hover:border-slate-700"
                            }`}
                          >
                            {isAr ? "💡 مبلغ مخصص" : "💡 Custom Amount"}
                          </button>
                        </div>

                        {/* Custom Input */}
                        {supportAmountPreset === "custom" && (
                          <div className="space-y-1">
                            <label className="block text-[9px] text-slate-500 font-bold">{isAr ? "المبلغ المخصص (USD):" : "Custom Amount (USD):"}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold text-xs">$</span>
                              <input
                                type="number"
                                placeholder="15"
                                value={supportCustomAmount}
                                onChange={(e) => setSupportCustomAmount(e.target.value)}
                                className="w-full bg-slate-955 border border-slate-850 rounded-xl py-2 px-3 pl-8 text-xs text-center text-rose-400 font-mono font-bold outline-none focus:border-rose-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* Payment Method Selector */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-slate-455 font-bold">{isAr ? "طريقة الدفع الآمنة:" : "Secure Payment Gateway:"}</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setSupportPaymentMethod('paypal')}
                              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                supportPaymentMethod === 'paypal'
                                  ? "bg-blue-500/10 border-blue-500/50 text-blue-400 font-black scale-[1.01]"
                                  : "bg-slate-955 border-slate-800 text-slate-400"
                              }`}
                            >
                              <span className="font-sans font-black tracking-tight text-[11px]">PayPal</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSupportPaymentMethod('card')}
                              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                supportPaymentMethod === 'card'
                                  ? "bg-slate-800 border-slate-705 text-slate-200 font-black scale-[1.01]"
                                  : "bg-slate-955 border-slate-800 text-slate-400"
                              }`}
                            >
                              <span className="text-[10px]">{isAr ? "💳 بطاقة بنكية" : "💳 Credit Card"}</span>
                            </button>
                          </div>
                        </div>

                        {supportError && (
                          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] leading-relaxed text-center font-sans">
                            ⚠️ {supportError}
                          </div>
                        )}

                        {/* Interactive Donate CTA */}
                        <button
                          type="button"
                          onClick={handleTriggerDonationPayment}
                          disabled={supportLoading}
                          className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl font-black text-xs cursor-pointer shadow-lg shadow-rose-500/10 flex justify-center items-center gap-2 transition disabled:opacity-50"
                        >
                          {supportLoading ? (
                            <span className="flex items-center gap-1.5">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>{isAr ? "جاري الدفع الآمن..." : "Authorizing secure link..."}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <span>❤️</span>
                              <span>
                                {isAr ? `إتمام الدفع الآمن بمقدار $${supportAmountPreset === 'custom' ? supportCustomAmount || '0' : supportAmountPreset}` : `Pay securely $${supportAmountPreset === 'custom' ? supportCustomAmount || '0' : supportAmountPreset}`}
                              </span>
                            </span>
                          )}
                        </button>

                        <p className="text-[8px] text-slate-500 text-center leading-normal">
                          🛡️ {isAr ? "البوابة محمية بالكامل بأحدث تشفير للبنود والمدفوعات." : "Protected by fully encrypted banking gateway channels."}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6 px-4 space-y-4">
                        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                          <span className="text-2xl">❤️</span>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-md font-black text-rose-450">{isAr ? "شكراً جزيلاً لدعمك Finora! ❤️" : "Thank you for supporting Finora ❤️"}</h3>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-sans px-2">
                            {isAr
                              ? `لقد تم استلام مساهمتك السخية بقيمة $${supportAmountPreset === 'custom' ? supportCustomAmount : supportAmountPreset} بنجاح. تبرعك سيوجه بالكامل لتطوير خوادم Finora وتحسين خدماتها.`
                              : `We processed your generous gift of $${supportAmountPreset === 'custom' ? supportCustomAmount : supportAmountPreset} successfully. Your credentials and donation history were saved in security log.`
                            }
                          </p>
                        </div>

                        <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 font-mono text-[9px] text-right">
                          <div className="flex justify-between">
                            <span className="text-slate-550">{isAr ? "المرسل:" : "Sender:"}</span>
                            <span className="text-slate-200">{state.userEmail || "anonymous-donor@finora.app"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-550">{isAr ? "المقدار المدفوع:" : "Amount Swapped:"}</span>
                            <span className="text-rose-400 font-bold">${supportAmountPreset === 'custom' ? supportCustomAmount : supportAmountPreset} USD</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-550">{isAr ? "حالة المعاملة:" : "Status Code:"}</span>
                            <span className="text-emerald-450 font-bold">COMPLETED (Captured)</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowSupportModal(false);
                            setSupportSuccess(false);
                          }}
                          className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl text-xs font-black cursor-pointer transition shadow-lg shadow-rose-500/10"
                        >
                          {isAr ? "العودة للوحة التحكم" : "Done / Exit"}
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* FLOATING TRANSIT FAST TRANSIT RECORD LOGGING ACTION (+) */}
            {activeTab !== 'coach' && (
              <button
                id="floating-logger-trigger"
                onClick={() => setShowAddModal(true)}
                className="absolute right-6 bottom-20 bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3 rounded-full shadow-lg hover:shadow-emerald-500/30 active:scale-95 transition z-40 cursor-pointer"
              >
                <Plus className="h-6 w-6" />
              </button>
            )}

            {/* 4. EXQUISITE BOTTOM SMART NAVIGATION BAR */}
            <nav id="bottom-navigation-rack" className="absolute bottom-0 inset-x-0 h-16 bg-slate-950 border-t border-slate-850 flex justify-around items-center px-4 pt-1 z-40">
              
              {/* Tab 1: Home */}
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                  activeTab === 'home' ? 'text-emerald-400 font-bold animate-pulse' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                <Wallet className="h-4 w-4" />
                <span className="text-[10px]">{isAr ? "الرئيسية" : "Home"}</span>
              </button>

              {/* Tab 2: Expenses */}
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                  activeTab === 'expenses' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px]">{isAr ? "المصروفات" : "Expenses"}</span>
              </button>

              {/* Tab 3: Goals */}
              <button
                onClick={() => setActiveTab('goals')}
                className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                  activeTab === 'goals' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                <PiggyBank className="h-4 w-4" />
                <span className="text-[10px]">{isAr ? "الأهداف" : "Goals"}</span>
              </button>

              {/* Tab 4: AI Coach */}
              <button
                onClick={() => setActiveTab('coach')}
                className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition relative ${
                  activeTab === 'coach' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-305'
                }`}
              >
                <Bot className="h-4 w-4" />
                <span className="text-[10px]">{isAr ? "مستشار Finora" : "Finora Coach"}</span>
                <span className="absolute top-0 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>

              {/* Tab 5: Profile */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                  activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span className="text-[10px]">{isAr ? "الحساب" : "Profile"}</span>
              </button>

            </nav>

          </div>
        )}

        {/* BOTTOM SMARTPHONE HOME LINE SIMULATOR */}
        <div className="h-5 bg-slate-950 flex items-center justify-center z-40">
          <div className="w-28 h-1 bg-slate-800 rounded-full"></div>
        </div>

      </div>

    </div>
  );
}

// Inline Auxiliary UI Badge
function Badge({ text, color }: { text: string; color: "emerald" | "amber" }) {
  const colClass = color === "emerald" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20";
  return (
    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-sans ${colClass}`}>
      {text}
    </span>
  );
}
