export interface UserProfile {
  income: number;
  housingCost: number;
}

export interface FinancialGoalSetupData {
  income: number;
  housingCost: number;
  savingsGoal: string;
  savingsTimeline: string;
}

export interface PersonalGoalSetupData {
  personalGoal: string;
  personalTimeline: string;
  currentSkillLevel: string;
  goalType: string;
  dailyTimeAvailable: string;
}

export interface FinancialGoal {
  id: string;
  status: 'active' | 'paused' | 'completed';
  itemName: string;
  targetAmount: number;
  targetDate: string;
  currentAmount: number;
  timelineAnalysis: string;
  weeklySavingsTarget: number;
  savingsHistory: { week: number; amount: number }[];
}

export interface WeeklyTask {
  id: string;
  description: string;
  completed: boolean;
  isCustom?: boolean;
}

export interface PersonalGoal {
  id:string;
  status: 'active' | 'paused' | 'completed';
  goalType: string;
  dailyTimeAvailable: string;
  description: string;
  targetDate: string;
  currentLevel: string;
  timelineAnalysis: string;
  taskHistory: WeeklyTask[][];
  currentWeek: number;
  completionHistory: { week: number; completedTasks: number; totalTasks: number }[];
}

export interface AIInsight {
  id: string;
  type: 'financial' | 'personal' | 'cross-goal' | 'motivational';
  text: string;
  date: string;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string; // ISO string
}
  
export type NewTransaction = Omit<Transaction, 'id'>;

export type GoalHealth = 'good' | 'average' | 'poor';

export interface Notification {
  id: string;
  type: 'insight' | 'milestone' | 'warning';
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  relatedGoalId?: string;
  relatedGoalType?: 'financial' | 'personal';
}