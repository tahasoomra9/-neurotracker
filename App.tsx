import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { FinancialGoalSetupData, PersonalGoalSetupData, FinancialGoal, PersonalGoal, AIInsight, UserProfile, WeeklyTask, Transaction, NewTransaction, Notification } from './types';
import { getFinancialGoalAnalysis, getPersonalGoalAnalysis, getWeeklyUpdate } from './services/geminiService';
import Spinner from './components/common/Spinner';
import GoalsPage from './components/goals/GoalsPage';
import { demoData } from './demoData';
import InsightsPage from './components/insights/InsightsPage';

export type AppView = 'dashboard' | 'goals' | 'insights';
export type Theme = 'dark' | 'light';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [username, setUsername] = useState<string>('Wanderer');
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  useEffect(() => {
    const savedData = localStorage.getItem('neuroTrackerData');
    if (savedData) {
      const { userProfile, financialGoals, personalGoals, insights, transactions, notifications } = JSON.parse(savedData);
      setUserProfile(userProfile);
      setFinancialGoals(financialGoals || []);
      setPersonalGoals(personalGoals || []);
      setInsights(insights || []);
      setTransactions(transactions || []);
      setNotifications(notifications || []);
    }
    
    const savedTheme = localStorage.getItem('neuroTrackerTheme');
    const initialTheme = savedTheme ? JSON.parse(savedTheme) : 'dark';
    setTheme(initialTheme);

    const savedUsername = localStorage.getItem('neuroTrackerUsername');
    if (savedUsername) {
        setUsername(JSON.parse(savedUsername));
    }

    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('neuroTrackerTheme', JSON.stringify(theme));
  }, [theme]);

  const saveDataToLocalStorage = (data: {
    userProfile: UserProfile | null,
    financialGoals: FinancialGoal[],
    personalGoals: PersonalGoal[],
    insights: AIInsight[],
    transactions: Transaction[],
    notifications: Notification[],
  }) => {
    localStorage.setItem('neuroTrackerData', JSON.stringify(data));
  };
  
  const handleFinancialGoalSetup = async (data: FinancialGoalSetupData) => {
    setIsLoading(true);
    setLoadingMessage('AI is analyzing your financial goal...');
    try {
      const { newFinancialGoal } = await getFinancialGoalAnalysis(data);
      const goalWithId: FinancialGoal = {
        ...newFinancialGoal,
        id: crypto.randomUUID(),
        status: 'active',
      };
      const updatedGoals = [...financialGoals, goalWithId];
      const newUserProfile = { income: data.income, housingCost: data.housingCost };
      
      setUserProfile(newUserProfile);
      setFinancialGoals(updatedGoals);
      saveDataToLocalStorage({ userProfile: newUserProfile, financialGoals: updatedGoals, personalGoals, insights, transactions, notifications });
    } catch (error) {
      console.error("Financial goal setup analysis failed:", error);
      alert("There was an error analyzing your financial goal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalGoalSetup = async (data: PersonalGoalSetupData) => {
    setIsLoading(true);
    setLoadingMessage('AI is analyzing your personal goal...');
    try {
        const { newPersonalGoal } = await getPersonalGoalAnalysis(data);
        const goalWithId: PersonalGoal = {
            ...newPersonalGoal,
            id: crypto.randomUUID(),
            status: 'active',
        };
        const updatedGoals = [...personalGoals, goalWithId];
        setPersonalGoals(updatedGoals);
        saveDataToLocalStorage({ userProfile, financialGoals, personalGoals: updatedGoals, insights, transactions, notifications });
    } catch (error) {
        console.error("Personal goal setup analysis failed:", error);
        alert("There was an error analyzing your personal goal. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleWeeklyCheckin = async (financialGoalId: string, personalGoalId: string, savedAmount: number, completedTasks: string[]) => {
    const financialGoal = financialGoals.find(g => g.id === financialGoalId);
    let personalGoal = personalGoals.find(g => g.id === personalGoalId);
    if (!financialGoal || !personalGoal) return;

    // Use the already completed tasks from the state for the current week
    const currentWeekIndex = personalGoal.currentWeek - 1;
    const completedTaskIdsFromState = (personalGoal.taskHistory[currentWeekIndex] || [])
        .filter(task => task.completed)
        .map(task => task.id);

    setIsLoading(true);
    setLoadingMessage('AI is generating your weekly plan...');
    try {
        const { updatedFinancialGoal, updatedPersonalGoal, newInsight } = await getWeeklyUpdate(
            financialGoal,
            personalGoal,
            savedAmount,
            completedTaskIdsFromState
        );
        
        const newNotifications: Notification[] = [];

        // New Insight Notification
        if (newInsight) {
            newNotifications.push({
                id: crypto.randomUUID(),
                type: 'insight',
                title: 'New AI Insight',
                message: newInsight.text,
                date: newInsight.date,
                read: false,
            });
        }

        // Financial Milestone Notification
        const milestones = [25, 50, 75, 100];
        const prevProgress = updatedFinancialGoal.targetAmount > 0 ? (financialGoal.currentAmount / updatedFinancialGoal.targetAmount) * 100 : 0;
        const newProgress = updatedFinancialGoal.targetAmount > 0 ? (updatedFinancialGoal.currentAmount / updatedFinancialGoal.targetAmount) * 100 : 0;

        milestones.forEach(milestone => {
            if (newProgress >= milestone && prevProgress < milestone) {
                newNotifications.push({
                    id: crypto.randomUUID(),
                    type: 'milestone',
                    title: 'Milestone Reached!',
                    message: `You've reached ${milestone}% of your '${updatedFinancialGoal.itemName}' goal!`,
                    date: new Date().toISOString(),
                    read: false,
                    relatedGoalId: updatedFinancialGoal.id,
                    relatedGoalType: 'financial',
                });
            }
        });
        
        // Personal Goal Warning Notification
        const totalTasksCount = (personalGoal.taskHistory[currentWeekIndex] || []).length;
        const completionRate = totalTasksCount > 0 ? completedTaskIdsFromState.length / totalTasksCount : 1;
        if (completionRate < 0.4 && totalTasksCount > 0) {
            newNotifications.push({
                id: crypto.randomUUID(),
                type: 'warning',
                title: 'Goal Off-Track',
                message: `You completed less than 40% of your tasks for '${personalGoal.description}'. Let's get back on track this week!`,
                date: new Date().toISOString(),
                read: false,
                relatedGoalId: personalGoal.id,
                relatedGoalType: 'personal',
            });
        }
        
        const allNotifications = newNotifications.length > 0 ? [...newNotifications, ...notifications] : notifications;
        const newInsights = newInsight ? [newInsight, ...insights] : insights;
        const updatedFinancialGoals = financialGoals.map(g => g.id === financialGoalId ? updatedFinancialGoal : g);
        const updatedPersonalGoals = personalGoals.map(g => g.id === personalGoalId ? updatedPersonalGoal : g);

        setFinancialGoals(updatedFinancialGoals);
        setPersonalGoals(updatedPersonalGoals);
        setInsights(newInsights);
        setNotifications(allNotifications);
        saveDataToLocalStorage({ userProfile, financialGoals: updatedFinancialGoals, personalGoals: updatedPersonalGoals, insights: newInsights, transactions, notifications: allNotifications });

    } catch (error) {
        console.error("Weekly update failed:", error);
        alert("There was an error updating your weekly progress. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddCustomTask = (goalId: string, taskDescription: string) => {
    const updatedPersonalGoals = personalGoals.map(goal => {
      if (goal.id === goalId) {
        const newCustomTask: WeeklyTask = {
          id: crypto.randomUUID(),
          description: taskDescription,
          completed: false,
          isCustom: true,
        };
        
        const updatedGoal = { ...goal };
        const currentWeekIndex = updatedGoal.currentWeek - 1;
        
        if (!updatedGoal.taskHistory[currentWeekIndex]) {
          updatedGoal.taskHistory[currentWeekIndex] = [];
        }

        updatedGoal.taskHistory[currentWeekIndex] = [...updatedGoal.taskHistory[currentWeekIndex], newCustomTask];
  
        return updatedGoal;
      }
      return goal;
    });
  
    setPersonalGoals(updatedPersonalGoals);
    saveDataToLocalStorage({ userProfile, financialGoals, personalGoals: updatedPersonalGoals, insights, transactions, notifications });
  };
  
  const handleToggleTaskCompletion = (goalId: string, taskId: string) => {
    const updatedPersonalGoals = personalGoals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal };
        const currentWeekIndex = updatedGoal.currentWeek - 1;

        if (updatedGoal.taskHistory[currentWeekIndex]) {
          updatedGoal.taskHistory[currentWeekIndex] = updatedGoal.taskHistory[currentWeekIndex].map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            return task;
          });
        }
        return updatedGoal;
      }
      return goal;
    });

    setPersonalGoals(updatedPersonalGoals);
    saveDataToLocalStorage({ userProfile, financialGoals, personalGoals: updatedPersonalGoals, insights, transactions, notifications });
  };

  const handleDeleteTask = (goalId: string, taskId: string) => {
    const updatedPersonalGoals = personalGoals.map(goal => {
        if (goal.id === goalId) {
            const updatedGoal = { ...goal };
            const currentWeekIndex = updatedGoal.currentWeek - 1;

            if (updatedGoal.taskHistory[currentWeekIndex]) {
                updatedGoal.taskHistory[currentWeekIndex] = updatedGoal.taskHistory[currentWeekIndex].filter(task => task.id !== taskId);
            }
            return updatedGoal;
        }
        return goal;
    });

    setPersonalGoals(updatedPersonalGoals);
    saveDataToLocalStorage({ userProfile, financialGoals, personalGoals: updatedPersonalGoals, insights, transactions, notifications });
  };


  const handleToggleGoalStatus = (id: string, type: 'financial' | 'personal', newStatus: 'active' | 'paused' | 'completed') => {
      let updatedFinancialGoals = financialGoals;
      let updatedPersonalGoals = personalGoals;

      if (type === 'financial') {
        updatedFinancialGoals = financialGoals.map(g => g.id === id ? { ...g, status: newStatus } : g);
        setFinancialGoals(updatedFinancialGoals);
      } else {
        updatedPersonalGoals = personalGoals.map(g => g.id === id ? { ...g, status: newStatus } : g);
        setPersonalGoals(updatedPersonalGoals);
      }
      saveDataToLocalStorage({ userProfile, financialGoals: updatedFinancialGoals, personalGoals: updatedPersonalGoals, insights, transactions, notifications });
  };

  const handleDeleteGoal = (id: string, type: 'financial' | 'personal') => {
    let updatedFinancialGoals = financialGoals;
    let updatedPersonalGoals = personalGoals;

    if (type === 'financial') {
        updatedFinancialGoals = financialGoals.filter(g => g.id !== id);
        setFinancialGoals(updatedFinancialGoals);
    } else {
        updatedPersonalGoals = personalGoals.filter(g => g.id !== id);
        setPersonalGoals(updatedPersonalGoals);
    }
    saveDataToLocalStorage({ userProfile, financialGoals: updatedFinancialGoals, personalGoals: updatedPersonalGoals, insights, transactions, notifications });
  };
  
  const handleReset = () => {
    localStorage.removeItem('neuroTrackerData');
    localStorage.removeItem('neuroTrackerUsername');
    localStorage.removeItem('neuroTrackerTheme');
    setUserProfile(null);
    setFinancialGoals([]);
    setPersonalGoals([]);
    setInsights([]);
    setTransactions([]);
    setNotifications([]);
    setUsername('Wanderer');
    setActiveView('dashboard');
    setTheme('dark');
  }

  const handleLoadDemoData = () => {
    const { userProfile: demoUserProfile, financialGoals: demoFinancialGoals, personalGoals: demoPersonalGoals, insights: demoInsights, transactions: demoTransactions } = demoData;
    setUserProfile(demoUserProfile);
    setFinancialGoals(demoFinancialGoals);
    setPersonalGoals(demoPersonalGoals);
    setInsights(demoInsights);
    setTransactions(demoTransactions);
    setNotifications([]);
    saveDataToLocalStorage({ 
        userProfile: demoUserProfile, 
        financialGoals: demoFinancialGoals, 
        personalGoals: demoPersonalGoals, 
        insights: demoInsights, 
        transactions: demoTransactions,
        notifications: [],
    });
    setActiveView('dashboard');
    setIsSidebarOpen(false);
  };

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  const handleUpdateUsername = (newName: string) => {
    setUsername(newName);
    localStorage.setItem('neuroTrackerUsername', JSON.stringify(newName));
  };

  const handleAddTransaction = (newTransaction: NewTransaction) => {
    const transactionWithId: Transaction = {
      ...newTransaction,
      id: crypto.randomUUID(),
    };
    const updatedTransactions = [transactionWithId, ...transactions];
    setTransactions(updatedTransactions);
    saveDataToLocalStorage({ userProfile, financialGoals, personalGoals, insights, transactions: updatedTransactions, notifications });
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);
    saveDataToLocalStorage({ userProfile, financialGoals, personalGoals, insights, transactions: updatedTransactions, notifications });
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => n.id === notificationId ? { ...n, read: true } : n);
    setNotifications(updatedNotifications);
    saveDataToLocalStorage({ userProfile, financialGoals, personalGoals, insights, transactions, notifications: updatedNotifications });
  };

  const handleMarkAllNotificationsAsRead = () => {
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      saveDataToLocalStorage({ userProfile, financialGoals, personalGoals, insights, transactions, notifications: updatedNotifications });
  };

  const handleClearReadNotifications = () => {
      const unreadNotifications = notifications.filter(n => !n.read);
      setNotifications(unreadNotifications);
      saveDataToLocalStorage({ userProfile, financialGoals, personalGoals, insights, transactions, notifications: unreadNotifications });
  };

  const renderContent = () => {
     if (isLoading && financialGoals.length === 0 && !userProfile) {
        return (
            <div className="fixed inset-0 bg-background/80 flex flex-col justify-center items-center z-50">
              <Spinner />
              <p className="mt-4 text-lg text-muted-foreground font-heading">{loadingMessage}</p>
            </div>
        );
     }

     return (
        <>
            {isLoading && (
                 <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col justify-center items-center z-50 transition-opacity duration-300">
                    <Spinner />
                    <p className="mt-4 text-lg text-muted-foreground font-heading">{loadingMessage}</p>
                </div>
            )}
            <div className="flex min-h-screen bg-background text-foreground font-sans">
                <Sidebar 
                    onLogout={handleReset} 
                    isOpen={isSidebarOpen} 
                    setIsOpen={setIsSidebarOpen}
                    theme={theme}
                    onToggleTheme={handleToggleTheme}
                    activeView={activeView}
                    onNavigate={setActiveView}
                    onLoadDemoData={handleLoadDemoData}
                />
                <div className="flex-1 flex flex-col lg:pl-[200px]">
                    <Header 
                        username={username} 
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        onUpdateUsername={handleUpdateUsername}
                        notifications={notifications}
                        onMarkAsRead={handleMarkNotificationAsRead}
                        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                        onClearRead={handleClearReadNotifications}
                    />
                    <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                        {activeView === 'dashboard' && (
                            <Dashboard 
                                userProfile={userProfile}
                                financialGoals={financialGoals}
                                personalGoals={personalGoals}
                                insights={insights}
                                onWeeklyCheckin={handleWeeklyCheckin}
                                onSetupFinancialGoal={handleFinancialGoalSetup}
                                onSetupPersonalGoal={handlePersonalGoalSetup}
                                onToggleGoalStatus={handleToggleGoalStatus}
                                onAddCustomTask={handleAddCustomTask}
                                onToggleTaskCompletion={handleToggleTaskCompletion}
                                onDeleteTask={handleDeleteTask}
                            />
                        )}
                        {activeView === 'goals' && (
                            <GoalsPage
                                userProfile={userProfile}
                                financialGoals={financialGoals}
                                personalGoals={personalGoals}
                                transactions={transactions}
                                onToggleGoalStatus={handleToggleGoalStatus}
                                onDeleteGoal={handleDeleteGoal}
                                onSetupFinancialGoal={handleFinancialGoalSetup}
                                onSetupPersonalGoal={handlePersonalGoalSetup}
                                onAddTransaction={handleAddTransaction}
                                onDeleteTransaction={handleDeleteTransaction}
                            />
                        )}
                         {activeView === 'insights' && (
                            <InsightsPage insights={insights} />
                        )}
                    </main>
                </div>
            </div>
        </>
     )
  }

  return renderContent();
};

export default App;