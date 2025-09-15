import { UserProfile, FinancialGoal, PersonalGoal, AIInsight, Transaction } from './types';

const today = new Date();
const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
const twoWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
const threeWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 21);

export const userProfile: UserProfile = {
  income: 3200,
  housingCost: 1150,
};

export const financialGoals: FinancialGoal[] = [
  {
    id: 'fin1',
    status: 'active',
    itemName: 'High-End Gaming PC',
    targetAmount: 2500,
    targetDate: '6 months',
    currentAmount: 750,
    timelineAnalysis: 'Your goal is ambitious but achievable. Consistent savings will be key.',
    weeklySavingsTarget: 96,
    savingsHistory: [
      { week: 1, amount: 100 },
      { week: 2, amount: 90 },
      { week: 3, amount: 110 },
      { week: 4, amount: 85 },
    ],
  },
  {
    id: 'fin2',
    status: 'completed',
    itemName: 'Holiday to Japan',
    targetAmount: 3000,
    targetDate: '1 year',
    currentAmount: 3000,
    timelineAnalysis: 'Successfully planned and saved. Well done!',
    weeklySavingsTarget: 58,
    savingsHistory: Array.from({ length: 52 }, (_, i) => ({ week: i + 1, amount: 58 + (Math.random() * 10 - 5) })),
  },
  {
    id: 'fin3',
    status: 'paused',
    itemName: 'New Car Downpayment',
    targetAmount: 5000,
    targetDate: '2 years',
    currentAmount: 1200,
    timelineAnalysis: 'A long-term goal that requires steady contribution. Paused for now.',
    weeklySavingsTarget: 48,
    savingsHistory: Array.from({ length: 25 }, (_, i) => ({ week: i + 1, amount: 48 })),
  },
];

export const personalGoals: PersonalGoal[] = [
  {
    id: 'per1',
    status: 'active',
    goalType: 'Learning',
    dailyTimeAvailable: '45 minutes',
    description: 'Learn to play the guitar',
    targetDate: '6 months',
    currentLevel: 'Beginner',
    timelineAnalysis: 'Learning an instrument requires consistent practice. Focus on fundamentals first.',
    taskHistory: [
      [{ id: 't1a', description: 'Practice C and G chords for 15 minutes', completed: true }, { id: 't1b', description: 'Learn the parts of the guitar', completed: true }, { id: 't1c', description: 'Watch a beginner tutorial on strumming', completed: true }],
      [{ id: 't2a', description: 'Practice switching between C, G, and D chords', completed: true }, { id: 't2b', description: 'Learn a simple 3-chord song', completed: false }, { id: 't2c', description: 'Practice for 30 minutes straight', completed: true }],
      [{ id: 't3a', description: 'Master the E minor chord', completed: true }, { id: 't3b', description: 'Practice "Wonderwall" intro riff', completed: true }, { id: 't3c', description: 'Tune the guitar by ear', completed: false }],
      [{ id: 't4a', description: 'Learn the F chord barre', completed: false }, { id: 't4b', description: 'Practice a major scale', completed: false }, { id: 't4c', description: 'Record yourself playing and listen back', completed: false }],
    ],
    currentWeek: 4,
    completionHistory: [
      { week: 1, completedTasks: 3, totalTasks: 3 },
      { week: 2, completedTasks: 2, totalTasks: 3 },
      { week: 3, completedTasks: 2, totalTasks: 3 },
    ],
  },
  {
    id: 'per2',
    status: 'completed',
    goalType: 'Fitness',
    dailyTimeAvailable: '30 minutes',
    description: 'Run a 5k race',
    targetDate: '3 months',
    currentLevel: 'Beginner',
    timelineAnalysis: 'A great fitness goal. Gradual progression is the safest way to avoid injury.',
    taskHistory: Array.from({ length: 12 }, () => [{ id: crypto.randomUUID(), description: 'Run 3 times this week', completed: true }, { id: crypto.randomUUID(), description: 'Do one session of cross-training', completed: true }]),
    currentWeek: 12,
    completionHistory: Array.from({ length: 12 }, (_, i) => ({ week: i + 1, completedTasks: 2, totalTasks: 2 })),
  },
   {
    id: 'per3',
    status: 'paused',
    goalType: 'Creative',
    dailyTimeAvailable: '1 hour',
    description: 'Write a short story',
    targetDate: '1 month',
    currentLevel: 'Intermediate',
    timelineAnalysis: 'Creative goals can be tough. Setting a word count target can help.',
    taskHistory: [
      [{ id: 'ts1', description: 'Outline the plot points', completed: true }, { id: 'ts2', description: 'Write character bios', completed: true }],
    ],
    currentWeek: 2,
    completionHistory: [{ week: 1, completedTasks: 2, totalTasks: 2}],
  },
];

export const insights: AIInsight[] = [
  {
    id: 'ins1',
    type: 'cross-goal',
    text: "It looks like your personal goal progress dipped the same week your savings were lower. Is there a connection between your energy levels and your spending habits?",
    date: twoWeeksAgo.toISOString(),
  },
  {
    id: 'ins2',
    type: 'motivational',
    text: "You've been incredibly consistent with your guitar practice! That dedication is powerful. Apply that same focus to your savings this week and see what happens.",
    date: oneWeekAgo.toISOString(),
  },
   {
    id: 'ins3',
    type: 'financial',
    text: "Great job hitting your savings target last week! You're building strong momentum toward that gaming PC.",
    date: today.toISOString(),
  },
];

export const transactions: Transaction[] = [
  { id: 'tx1', description: 'Monthly Salary', amount: 3200, type: 'income', category: 'Salary', date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString() },
  { id: 'tx2', description: 'Weekly Groceries', amount: 85.50, type: 'expense', category: 'Food', date: oneWeekAgo.toISOString() },
  { id: 'tx3', description: 'Dinner with friends', amount: 45.00, type: 'expense', category: 'Social', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString() },
  { id: 'tx4', description: 'Train ticket', amount: 12.80, type: 'expense', category: 'Transport', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3).toISOString() },
  { id: 'tx5', description: 'Spotify Subscription', amount: 9.99, type: 'expense', category: 'Subscriptions', date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString() },
  { id: 'tx6', description: 'New video game', amount: 59.99, type: 'expense', category: 'Entertainment', date: twoWeeksAgo.toISOString() },
  { id: 'tx7', description: 'Freelance Work Payment', amount: 250, type: 'income', category: 'Freelance', date: twoWeeksAgo.toISOString() },
  { id: 'tx8', description: 'Coffee', amount: 3.50, type: 'expense', category: 'Food', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString() },
  { id: 'tx9', description: 'Gym Membership', amount: 40.00, type: 'expense', category: 'Health', date: new Date(today.getFullYear(), today.getMonth(), 2).toISOString() },
  { id: 'tx10', description: 'Internet Bill', amount: 35.00, type: 'expense', category: 'Utilities', date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString() },
];


export const demoData = {
    userProfile,
    financialGoals,
    personalGoals,
    insights,
    transactions
};
