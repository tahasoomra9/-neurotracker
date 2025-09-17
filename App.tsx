import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { FinancialGoalSetupData, PersonalGoalSetupData, FinancialGoal, PersonalGoal, AIInsight, UserProfile, WeeklyTask, Transaction, NewTransaction, Notification } from './types';
import { getFinancialGoalAnalysis, getPersonalGoalAnalysis, getWeeklyUpdate } from './services/geminiService';
import Spinner from './components/common/Spinner';
import ToastContainer from './components/common/ToastContainer';
import { ToastProps } from './components/common/Toast';
import GoalsPage from './components/goals/GoalsPage';
import { demoData } from './demoData';
import InsightsPage from './components/insights/InsightsPage';
import { DarkVeilBackground } from './src/components/ui/shadcn-io/dark-veil-background';

export type AppView = 'dashboard' | 'goals' | 'insights';

const App: React.FC = () => {
  // Core app state - user data and goals
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // UI state management
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('Wanderer');
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [currentGoalsTab, setCurrentGoalsTab] = useState<'financial' | 'personal'>('financial');
  const [currentInsightsFilter, setCurrentInsightsFilter] = useState<'all' | 'financial' | 'personal' | 'cross-goal' | 'motivational'>('all');
  const [performanceMode, setPerformanceMode] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Load saved data when app starts
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

    // Restore user preferences
    const savedPerformanceMode = localStorage.getItem('neuroTrackerPerformanceMode');
    if (savedPerformanceMode) {
      setPerformanceMode(JSON.parse(savedPerformanceMode));
    }

    const savedUsername = localStorage.getItem('neuroTrackerUsername');
    if (savedUsername) {
      setUsername(JSON.parse(savedUsername));
    }

    setIsLoading(false);
  }, []);

  // Save performance mode changes
  useEffect(() => {
    localStorage.setItem('neuroTrackerPerformanceMode', JSON.stringify(performanceMode));
  }, [performanceMode]);

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
    setLoadingMessage('We are analyzing your financial goal...');
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
      showToast({
        type: 'error',
        title: 'Goal Setup Failed',
        message: 'There was an error analyzing your financial goal. Please try again.',
        duration: 6000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalGoalSetup = async (data: PersonalGoalSetupData) => {
    setIsLoading(true);
    setLoadingMessage('We are creating your personalized plan...');
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
      showToast({
        type: 'error',
        title: 'Goal Setup Failed',
        message: 'There was an error analyzing your personal goal. Please try again.',
        duration: 6000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeeklyCheckin = async (financialGoalId: string, personalGoalIds: string[], savedAmount: number, allCompletedTaskIds: string[]) => {
    const financialGoal = financialGoals.find(g => g.id === financialGoalId);
    const goalsToCheckin = personalGoals.filter(g => personalGoalIds.includes(g.id));

    if (!financialGoal || goalsToCheckin.length === 0) return;



    // First, update the current task completion states before calling the AI service
    const updatedPersonalGoalsWithCompletions = personalGoals.map(goal => {
      if (!personalGoalIds.includes(goal.id)) return goal;

      const updatedGoal = { ...goal };
      const currentWeekIndex = updatedGoal.currentWeek - 1;

      if (updatedGoal.taskHistory[currentWeekIndex]) {
        updatedGoal.taskHistory[currentWeekIndex] = updatedGoal.taskHistory[currentWeekIndex].map(task => {
          const shouldBeCompleted = allCompletedTaskIds.includes(task.id);
          return { ...task, completed: shouldBeCompleted };
        });
      }

      return updatedGoal;
    });

    // Update the state immediately to reflect task completions
    setPersonalGoals(updatedPersonalGoalsWithCompletions);

    // Get the updated goals for the AI service call
    const updatedGoalsToCheckin = updatedPersonalGoalsWithCompletions.filter(g => personalGoalIds.includes(g.id));

    setIsLoading(true);
    setLoadingMessage('We are generating your weekly plans...');
    try {
      const updatePromises = updatedGoalsToCheckin.map(pGoal => {
        const currentWeekTasks = pGoal.taskHistory[pGoal.currentWeek - 1] || [];
        const currentWeekTaskIds = new Set(currentWeekTasks.map(t => t.id));
        const completedIdsForThisGoal = allCompletedTaskIds.filter(id => currentWeekTaskIds.has(id));

        // Pass the original financial goal for context, but we'll only use the first updated result later.
        return getWeeklyUpdate(financialGoal, pGoal, savedAmount, completedIdsForThisGoal);
      });

      const results = await Promise.all(updatePromises);
      if (!results || results.length === 0) throw new Error("No results from weekly update.");

      // --- Aggregate State Updates ---
      // 1. Financial Goal (only use the update from the first result to avoid multiple increments)
      const updatedFinancialGoal = results[0].updatedFinancialGoal;

      // 2. Personal Goals - Preserve task completion states from the current week
      const updatedPersonalGoalsMap = new Map(results.map(r => [r.updatedPersonalGoal.id, r.updatedPersonalGoal]));
      const finalPersonalGoals = updatedPersonalGoalsWithCompletions.map(goal => {
        const aiUpdatedGoal = updatedPersonalGoalsMap.get(goal.id);
        if (!aiUpdatedGoal) return goal;

        // Preserve the current week's task completion states and custom tasks
        const preservedGoal = { ...aiUpdatedGoal };
        const currentWeekIndex = goal.currentWeek - 1;

        // More robust task preservation - merge by task ID and preserve custom tasks
        if (goal.taskHistory[currentWeekIndex] && preservedGoal.taskHistory[currentWeekIndex]) {
          console.log(`\n=== TASK PRESERVATION FOR ${goal.description} ===`);
          console.log('Pre-update tasks:', goal.taskHistory[currentWeekIndex].map(t => ({
            id: t.id,
            desc: t.description,
            completed: t.completed,
            isCustom: t.isCustom
          })));
          console.log('AI returned tasks:', preservedGoal.taskHistory[currentWeekIndex].map(t => ({
            id: t.id,
            desc: t.description,
            completed: t.completed,
            isCustom: t.isCustom
          })));

          const preUpdateTasksMap = new Map(goal.taskHistory[currentWeekIndex].map(t => [t.id, t]));

          // Update the AI tasks with our completion states, preserving any new tasks the AI might have added
          preservedGoal.taskHistory[currentWeekIndex] = preservedGoal.taskHistory[currentWeekIndex].map(aiTask => {
            const preUpdateTask = preUpdateTasksMap.get(aiTask.id);
            if (preUpdateTask) {
              console.log(`Preserving completion for task ${aiTask.id}: ${preUpdateTask.completed}`);
              // Use the completion state from our pre-update task
              return { ...aiTask, completed: preUpdateTask.completed };
            }
            console.log(`Keeping AI task as-is: ${aiTask.id}`);
            // Keep AI task as-is if it's new
            return aiTask;
          });

          // Add any tasks that were in pre-update but not in AI response (custom tasks)
          const aiTaskIds = new Set(preservedGoal.taskHistory[currentWeekIndex].map(t => t.id));
          const missingTasks = goal.taskHistory[currentWeekIndex].filter(t => !aiTaskIds.has(t.id));
          console.log('Missing tasks to add back:', missingTasks.map(t => ({
            id: t.id,
            desc: t.description,
            completed: t.completed,
            isCustom: t.isCustom
          })));
          preservedGoal.taskHistory[currentWeekIndex].push(...missingTasks);

          console.log('Final tasks after preservation:', preservedGoal.taskHistory[currentWeekIndex].map(t => ({
            id: t.id,
            desc: t.description,
            completed: t.completed,
            isCustom: t.isCustom
          })));
        } else if (goal.taskHistory[currentWeekIndex] && !preservedGoal.taskHistory[currentWeekIndex]) {
          console.log(`AI returned no tasks for current week, keeping all existing tasks for ${goal.description}`);
          // If AI didn't return any tasks for current week, keep all our tasks
          preservedGoal.taskHistory[currentWeekIndex] = goal.taskHistory[currentWeekIndex];
        }

        return preservedGoal;
      });

      // 3. Insights
      const newInsights = results.map(r => r.newInsight).filter((insight): insight is AIInsight => !!insight);
      const finalInsights = [...newInsights, ...insights];

      // --- Generate Notifications ---
      const newNotifications: Notification[] = [];

      // Financial Milestone Notification (checked once)
      const milestones = [25, 50, 75, 100];
      const prevProgress = financialGoal.targetAmount > 0 ? (financialGoal.currentAmount / financialGoal.targetAmount) * 100 : 0;
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

      // Personal Goal Warning Notifications (checked for each updated goal)
      results.forEach(({ updatedPersonalGoal }) => {
        const lastCompletedWeek = updatedPersonalGoal.completionHistory[updatedPersonalGoal.completionHistory.length - 1];
        if (lastCompletedWeek && lastCompletedWeek.totalTasks > 0) {
          const completionRate = lastCompletedWeek.completedTasks / lastCompletedWeek.totalTasks;
          if (completionRate < 0.4) {
            newNotifications.push({
              id: crypto.randomUUID(),
              type: 'warning',
              title: 'Goal Off-Track',
              message: `You completed less than 40% of your tasks for '${updatedPersonalGoal.description}'. Let's get back on track this week!`,
              date: new Date().toISOString(),
              read: false,
              relatedGoalId: updatedPersonalGoal.id,
              relatedGoalType: 'personal',
            });
          }
        }
      });

      newInsights.forEach(insight => {
        newNotifications.push({
          id: crypto.randomUUID(),
          type: 'insight',
          title: 'New AI Insight',
          message: insight.text,
          date: insight.date,
          read: false,
        });
      });

      const finalNotifications = [...newNotifications, ...notifications];
      const finalFinancialGoals = financialGoals.map(g => g.id === financialGoalId ? updatedFinancialGoal : g);

      // --- Set Final State ---
      console.log('\n=== SETTING FINAL STATE ===');
      finalPersonalGoals.forEach(goal => {
        const currentWeekTasks = goal.taskHistory[goal.currentWeek - 1] || [];
        console.log(`Final state for "${goal.description}":`, currentWeekTasks.map(t => ({
          id: t.id,
          desc: t.description,
          completed: t.completed,
          isCustom: t.isCustom
        })));
      });

      setFinancialGoals(finalFinancialGoals);
      setPersonalGoals(finalPersonalGoals);
      setInsights(finalInsights);
      setNotifications(finalNotifications);
      saveDataToLocalStorage({ userProfile, financialGoals: finalFinancialGoals, personalGoals: finalPersonalGoals, insights: finalInsights, transactions, notifications: finalNotifications });

      console.log('=== STATE SAVED TO LOCALSTORAGE ===');

    } catch (error) {
      console.error("Weekly update failed:", error);
      showToast({
        type: 'error',
        title: 'Weekly Update Failed',
        message: 'There was an error updating your weekly progress. Please try again.',
        duration: 6000
      });
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
    console.log(`\n=== TOGGLING TASK COMPLETION ===`);
    console.log(`Goal ID: ${goalId}, Task ID: ${taskId}`);

    const updatedPersonalGoals = personalGoals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal };
        const currentWeekIndex = updatedGoal.currentWeek - 1;

        if (updatedGoal.taskHistory[currentWeekIndex]) {
          updatedGoal.taskHistory[currentWeekIndex] = updatedGoal.taskHistory[currentWeekIndex].map(task => {
            if (task.id === taskId) {
              console.log(`Toggling task "${task.description}" from ${task.completed} to ${!task.completed}`);
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
    localStorage.removeItem('neuroTrackerPerformanceMode');
    setUserProfile(null);
    setFinancialGoals([]);
    setPersonalGoals([]);
    setInsights([]);
    setTransactions([]);
    setNotifications([]);
    setUsername('Wanderer');
    setActiveView('dashboard');
    setPerformanceMode(false);
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

  const handleTogglePerformanceMode = () => {
    setPerformanceMode(prev => !prev);
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

  const handleClearAllInsights = () => {
    setInsights([]);
    saveDataToLocalStorage({ userProfile, financialGoals, personalGoals, insights: [], transactions, notifications });
  };

  const handleClearInsightsByType = (type: AIInsight['type']) => {
    const filteredInsights = insights.filter(insight => insight.type !== type);
    setInsights(filteredInsights);
    saveDataToLocalStorage({ userProfile, financialGoals, personalGoals, insights: filteredInsights, transactions, notifications });
  };

  const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = crypto.randomUUID();
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const renderContent = () => {
    if (isLoading && financialGoals.length === 0 && !userProfile) {
      return (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col justify-center items-center z-50">
          <div className="bg-card/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-border-glass max-w-sm mx-4">
            <div className="flex flex-col items-center">
              <Spinner />
              <p className="mt-6 text-lg text-foreground font-heading text-center leading-relaxed">{loadingMessage}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {isLoading && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-card/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-border-glass max-w-sm mx-4 animate-modal-in">
              <div className="flex flex-col items-center">
                <Spinner />
                <p className="mt-6 text-lg text-foreground font-heading text-center leading-relaxed">{loadingMessage}</p>
              </div>
            </div>
          </div>
        )}
        <div className={`flex min-h-screen text-foreground font-sans relative ${performanceMode ? 'bg-black' : ''}`}>
          {!performanceMode && <DarkVeilBackground className="fixed inset-0 -z-10 opacity-30" />}
          <Sidebar
            onLogout={handleReset}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            activeView={activeView}
            onNavigate={setActiveView}
            onLoadDemoData={handleLoadDemoData}
            performanceMode={performanceMode}
            onTogglePerformanceMode={handleTogglePerformanceMode}
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
              currentPage={activeView === 'dashboard' ? 'Dashboard' : activeView === 'goals' ? 'Goals' : activeView === 'insights' ? 'Insights' : 'Dashboard'}
              currentSubPage={
                activeView === 'goals'
                  ? (currentGoalsTab === 'financial' ? 'Finance' : 'Personal')
                  : activeView === 'insights' && currentInsightsFilter !== 'all'
                    ? (currentInsightsFilter === 'financial' ? 'Financial'
                      : currentInsightsFilter === 'personal' ? 'Personal'
                        : currentInsightsFilter === 'cross-goal' ? 'Cross-Goal'
                          : currentInsightsFilter === 'motivational' ? 'Motivational'
                            : undefined)
                    : undefined
              }
              onNavigate={(page) => {
                const pageMap: { [key: string]: AppView } = {
                  'Dashboard': 'dashboard',
                  'Goals': 'goals',
                  'Insights': 'insights'
                };
                const targetView = pageMap[page];
                if (targetView) {
                  setActiveView(targetView);
                }
              }}
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
                  showToast={showToast}
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
                  onTabChange={setCurrentGoalsTab}
                />
              )}
              {activeView === 'insights' && (
                <InsightsPage
                  insights={insights}
                  onFilterChange={setCurrentInsightsFilter}
                  onClearAllInsights={handleClearAllInsights}
                  onClearInsightsByType={handleClearInsightsByType}
                />
              )}
            </main>
          </div>
        </div>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
    )
  }

  return renderContent();
};

export default App;