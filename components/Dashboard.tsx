import React, { useState } from 'react';
import { FinancialGoal, PersonalGoal, AIInsight, UserProfile, FinancialGoalSetupData, PersonalGoalSetupData } from '../types';
import WeeklyCheckin from './WeeklyCheckin';
import FinancialGoalSetupModal from './FinancialGoalSetupModal';
import PersonalGoalSetupModal from './PersonalGoalSetupModal';
import {
    FinancialOverviewBlock,
    SavingsGoalsBlock,
    GoalProgressBlock,
    AiCoachInsightsBlock,
    WeeklyTasksBlock,
    AddNewGoalBlock,
} from './dashboard/DashboardBlocks';

interface DashboardProps {
  userProfile: UserProfile | null;
  financialGoals: FinancialGoal[];
  personalGoals: PersonalGoal[];
  insights: AIInsight[];
  onWeeklyCheckin: (financialGoalId: string, personalGoalId: string, savedAmount: number, completedTasks: string[]) => void;
  onSetupFinancialGoal: (data: FinancialGoalSetupData) => Promise<void>;
  onSetupPersonalGoal: (data: PersonalGoalSetupData) => Promise<void>;
  onToggleGoalStatus: (id: string, type: 'financial' | 'personal', newStatus: 'active' | 'paused' | 'completed') => void;
  onAddCustomTask: (goalId: string, taskDescription: string) => void;
  onToggleTaskCompletion: (goalId: string, taskId: string) => void;
  onDeleteTask: (goalId: string, taskId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userProfile, 
  financialGoals,
  personalGoals,
  insights, 
  onWeeklyCheckin, 
  onSetupFinancialGoal,
  onSetupPersonalGoal,
  onToggleGoalStatus,
  onAddCustomTask,
  onToggleTaskCompletion,
  onDeleteTask
}) => {
  const [goalForCheckin, setGoalForCheckin] = useState<{ financialGoal: FinancialGoal, personalGoal: PersonalGoal} | null>(null);
  const [isFinancialSetupOpen, setIsFinancialSetupOpen] = useState(false);
  const [isPersonalSetupOpen, setIsPersonalSetupOpen] = useState(false);
  
  const latestInsight = insights.length > 0 ? insights[insights.length - 1] : { text: "Complete a weekly check-in to get started!" };
  
  const handleFinancialSetupComplete = async (data: FinancialGoalSetupData) => {
    await onSetupFinancialGoal(data);
    setIsFinancialSetupOpen(false);
  }

  const handlePersonalSetupComplete = async (data: PersonalGoalSetupData) => {
    await onSetupPersonalGoal(data);
    setIsPersonalSetupOpen(false);
  }
  
  const handleStartCheckin = () => {
    const activeFinancialGoal = financialGoals.find(g => g.status === 'active');
    const activePersonalGoal = personalGoals.find(g => g.status === 'active');
    if (activeFinancialGoal && activePersonalGoal) {
      setGoalForCheckin({ financialGoal: activeFinancialGoal, personalGoal: activePersonalGoal });
    } else {
      alert("You need at least one active financial and personal goal to start a check-in.");
    }
  };

  const handleCheckinSubmit = (savedAmount: number, completedTasks: string[]) => {
    if (goalForCheckin) {
        onWeeklyCheckin(goalForCheckin.financialGoal.id, goalForCheckin.personalGoal.id, savedAmount, completedTasks);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Main Content Column: The Journey --- */}
        <div className="lg:col-span-2 space-y-6">
            <WeeklyTasksBlock 
                goals={personalGoals} 
                onAddTask={onAddCustomTask}
                onToggleTaskCompletion={onToggleTaskCompletion}
                onStartCheckin={handleStartCheckin}
                onDeleteTask={onDeleteTask}
            />
        </div>

        {/* --- Sidebar Column: At-a-Glance Info --- */}
        <div className="space-y-6">
             <FinancialOverviewBlock 
                profile={userProfile}
                onSetup={() => setIsFinancialSetupOpen(true)}
            />
            <SavingsGoalsBlock 
                goals={financialGoals}
                onSetup={() => setIsFinancialSetupOpen(true)}
                onToggleStatus={onToggleGoalStatus}
            />
            <AiCoachInsightsBlock
                insight={latestInsight}
            />
            <GoalProgressBlock 
              financialGoals={financialGoals}
              personalGoals={personalGoals}
            />
            <AddNewGoalBlock
                onAddFinancial={() => setIsFinancialSetupOpen(true)}
                onAddPersonal={() => setIsPersonalSetupOpen(true)}
            />
        </div>
      </div>

      {goalForCheckin && (
        <WeeklyCheckin
          personalGoal={goalForCheckin.personalGoal}
          financialGoal={goalForCheckin.financialGoal}
          onClose={() => setGoalForCheckin(null)}
          onSubmit={handleCheckinSubmit}
        />
      )}
      
      {isFinancialSetupOpen && (
        <FinancialGoalSetupModal
            onComplete={handleFinancialSetupComplete}
            onClose={() => setIsFinancialSetupOpen(false)}
        />
      )}

      {isPersonalSetupOpen && (
        <PersonalGoalSetupModal
            onComplete={handlePersonalSetupComplete}
            onClose={() => setIsPersonalSetupOpen(false)}
        />
      )}
    </>
  );
};

export default Dashboard;