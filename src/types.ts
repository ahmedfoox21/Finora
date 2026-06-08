/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  isAIDetected?: boolean;
  confidenceScore?: number; // 0-100 indicating recurring certainty
}

export interface AdditionalIncome {
  id: string;
  source: string;
  amount: number;
}

export interface DebtOrDiscount {
  id: string;
  name: string;
  amount: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string; // e.g., "Food", "Coffee", "Transport", "Shopping", "Entertainment", "Bills", "Groceries", "Fuel", "Unclassified"
  note?: string;
  date: string; // ISO String or YYYY-MM-DD
  isUnclassified?: boolean; // added via total-only option
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string; // YYYY-MM-DD
  imagePrompt?: string;
  imageUrl?: string;
}

export interface SimulatedNotification {
  id: string;
  type: 'reminder' | 'budget_warning' | 'savings_milestone' | 'ai_insight' | 'unregistered_search';
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  date: string;
  read: boolean;
  quickAction?: 'details' | 'total_only' | 'dont_remember';
}

export interface AIInsight {
  id: string;
  textEn: string;
  textAr: string;
  category: 'tip' | 'warning' | 'praise' | 'alert';
  created_at: string;
}

export interface BorrowRecord {
  id: string;
  debtorName: string; // اسم الشخص المقترض
  amount: number; // المبلغ المقرض
  lentDate: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD (تاريخ الاستحقاق الاختياري)
  notes?: string; // ملاحظات إضافية
  isRepaid: boolean; // هل تم تحصيله بالكامل
  repaidAmount: number; // المبلغ المسترجع (للدعم الجزئي)
}

export interface AppState {
  salary: number;
  salaryDate: number; // Day of the month (1-31)
  fixedExpenses: FixedExpense[];
  additionalIncomes: AdditionalIncome[];
  debtsAndDiscounts: DebtOrDiscount[];
  expenses: Expense[];
  goals: SavingGoal[];
  borrowedRecords: BorrowRecord[];
  language: 'ar' | 'en';
  isSetupCompleted: boolean;
  notifications: SimulatedNotification[];
  aiInsights: AIInsight[];
  // User Account Sync state
  userEmail?: string;
  isLoggedIn: boolean;
  syncEnabled: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
