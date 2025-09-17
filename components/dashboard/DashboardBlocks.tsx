import React, { useState, useEffect, useRef, useLayoutEffect, useId, useMemo } from 'react';
import { FinancialGoal, PersonalGoal, AIInsight, UserProfile, GoalHealth, WeeklyTask } from '../../types';
import Button from '../common/Button';

// ====================================================================================
// New Universal Expandable Block Wrapper Component
// ====================================================================================

const ExpandIcon = ({ isExpanded }: { isExpanded: boolean }) => (
    <svg className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

interface DashboardBlockProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
    defaultMaxHeight?: number; // allow customization
}

const DashboardBlock: React.FC<DashboardBlockProps> = ({ title, children, className, actions, defaultMaxHeight = 150 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const contentId = useId();

    useLayoutEffect(() => {
        if (contentRef.current) {
            const isOverflowing = contentRef.current.scrollHeight > defaultMaxHeight;
            if(isOverflowing !== hasOverflow) {
                setHasOverflow(isOverflowing);
            }
        }
    }, [children, defaultMaxHeight, hasOverflow]);
    
    return (
        <div ref={rootRef} className={`premium-glass text-foreground flex flex-col ${className}`}>
           {title && (
             <div className="flex justify-between items-center p-5 pb-3">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">{title}</h3>
                <div className="flex items-center gap-2">
                    {actions}
                    {hasOverflow && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-expanded={isExpanded}
                            aria-controls={contentId}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ExpandIcon isExpanded={isExpanded} />
                            <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'}</span>
                        </button>
                    )}
                </div>
            </div>
           )}
            <div
                ref={contentRef}
                id={contentId}
                style={{ maxHeight: isExpanded ? contentRef.current?.scrollHeight : `${defaultMaxHeight}px` }}
                className="overflow-hidden transition-all duration-400 ease-in-out px-5 pb-5 flex-1"
            >
                {children}
            </div>
        </div>
    );
};

// Renamed the original DashboardBlock to BlockContainer for use in MultiGoalBlock
const BlockContainer: React.FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => {
    const rootRef = useRef<HTMLDivElement>(null);
    
  return (
    <div ref={rootRef} className={`premium-glass p-5 text-foreground flex flex-col ${className}`}>
      {children}
    </div>
  );
};

// ====================================================================================
// Helper Components & Functions
// ====================================================================================

const PlaceholderBlock: React.FC<{ onSetup: () => void, message: string, cta: string }> = ({ onSetup, message, cta }) => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-2 min-h-[150px]">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button onClick={onSetup} variant="primary" className="mt-4 px-4 py-2 text-xs">
            {cta}
        </Button>
    </div>
)

const parseTimelineToWeeks = (timeline: string): number => {
    if (!timeline) return 12; // Default
    const parts = timeline.toLowerCase().split(' ');
    if (parts.length < 2) return 12; 
    const value = parseInt(parts[0], 10);
    if (isNaN(value)) return 12;

    if (parts[1].startsWith('month')) {
        return Math.round(value * 4.33);
    }
    if (parts[1].startsWith('week')) {
        return value;
    }
    return 12;
};

// ====================================================================================
// New Multi-Goal Tabbed Interface Components
// ====================================================================================

const getFinancialGoalHealth = (goal: FinancialGoal): GoalHealth => {
    if (goal.savingsHistory.length === 0) return 'good';
    const weeksElapsed = goal.savingsHistory.length;
    const expectedSavings = weeksElapsed * goal.weeklySavingsTarget;
    if (expectedSavings === 0) return 'good';
    const performanceRatio = goal.currentAmount / expectedSavings;
    if (performanceRatio >= 0.9) return 'good';
    if (performanceRatio >= 0.6) return 'average';
    return 'poor';
};

const getPersonalGoalHealth = (goal: PersonalGoal): GoalHealth => {
    if (goal.completionHistory.length === 0) return 'good';
    const lastWeek = goal.completionHistory[goal.completionHistory.length - 1];
    if (!lastWeek || lastWeek.totalTasks === 0) return 'good';
    const completionRate = lastWeek.completedTasks / lastWeek.totalTasks;
    if (completionRate >= 0.7) return 'good';
    if (completionRate >= 0.4) return 'average';
    return 'poor';
}

const GoalHealthIndicator: React.FC<{ health: GoalHealth }> = ({ health }) => {
    const healthColors = {
        good: 'bg-success',
        average: 'bg-warning',
        poor: 'bg-destructive'
    };
    return <div className={`w-2 h-2 rounded-full ${healthColors[health]}`}></div>;
};

const GoalTab: React.FC<{
    label: string;
    health: GoalHealth;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, health, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-semibold flex flex-col items-center gap-1.5 transition-all duration-300 ease-in-out
            ${isActive
                ? 'bg-brand/20 text-brand flex-shrink-0 whitespace-normal'
                : 'hover:bg-accent flex-shrink-1 min-w-0'
            }`
        }
    >
        <span className={`w-full text-center ${isActive ? 'whitespace-normal' : 'truncate'}`}>{label}</span>
        <GoalHealthIndicator health={health} />
    </button>
);

interface MultiGoalBlockProps<T extends FinancialGoal | PersonalGoal> {
    title: string;
    goals: T[];
    onSetup: () => void;
    onToggleStatus: (id: string, type: 'financial' | 'personal', newStatus: 'active' | 'paused' | 'completed') => void;
    getGoalHealth: (goal: T) => GoalHealth;
    renderGoalDetails: (goal: T) => React.ReactNode;
    goalType: 'financial' | 'personal';
    setupMessage: string;
    setupCta: string;
}

function MultiGoalBlock<T extends FinancialGoal | PersonalGoal>({ 
    title, goals, onSetup, onToggleStatus, getGoalHealth, renderGoalDetails, goalType, setupMessage, setupCta 
}: MultiGoalBlockProps<T>) {
    const [searchQuery, setSearchQuery] = useState("");
    const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals]);

    const filteredActiveGoals = useMemo(() => {
        if (!searchQuery) return activeGoals;
        return activeGoals.filter(g =>
            ('itemName' in g ? g.itemName : g.description)
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
    }, [activeGoals, searchQuery]);

    const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
    
    useEffect(() => {
        const currentGoalIsVisible = filteredActiveGoals.some(g => g.id === activeGoalId);

        if (filteredActiveGoals.length > 0 && !currentGoalIsVisible) {
            // If current selection is invalid or null, select the first visible goal
            setActiveGoalId(filteredActiveGoals[0].id);
        } else if (filteredActiveGoals.length === 0) {
            // If no goals are visible, deselect
            setActiveGoalId(null);
        }
    }, [filteredActiveGoals, activeGoalId]);


    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
    const [detailsHasOverflow, setDetailsHasOverflow] = useState(false);
    const detailsContentRef = useRef<HTMLDivElement>(null);
    const detailsContentId = useId();
    const DEFAULT_DETAILS_MAX_HEIGHT = 90;
    
    useLayoutEffect(() => {
        setIsDetailsExpanded(false); // Reset on goal change
        if (detailsContentRef.current) {
            const isOverflowing = detailsContentRef.current.scrollHeight > DEFAULT_DETAILS_MAX_HEIGHT;
            if(isOverflowing !== detailsHasOverflow) {
                setDetailsHasOverflow(isOverflowing);
            }
        }
    }, [activeGoalId, detailsHasOverflow]);


    const activeGoal = filteredActiveGoals.find(g => g.id === activeGoalId);
    
    return (
        <BlockContainer>
            <div className="flex justify-between items-center mb-1 -mt-1 flex-wrap gap-y-2">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    <div className="relative hidden sm:block">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border border-input rounded-md h-8 text-sm pl-8 pr-2 w-32 focus:w-40 transition-all duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-ring"
                            aria-label="Search savings goals"
                        />
                    </div>
                    <Button onClick={onSetup} variant="ghost" className="text-xs px-2 py-1 h-auto">+ Add New</Button>
                    {detailsHasOverflow && (
                         <button
                            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                            aria-expanded={isDetailsExpanded}
                            aria-controls={detailsContentId}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ExpandIcon isExpanded={isDetailsExpanded} />
                            <span className="sr-only">{isDetailsExpanded ? 'Collapse' : 'Expand'}</span>
                        </button>
                    )}
                </div>
            </div>
            
            {activeGoals.length > 0 ? (
                <>
                    <div className="flex items-stretch gap-2 border-b border-border -mx-5 px-5 pb-2 mb-4">
                        {filteredActiveGoals.map(goal => (
                            <GoalTab 
                                key={goal.id}
                                label={'itemName' in goal ? goal.itemName : goal.description}
                                health={getGoalHealth(goal)}
                                isActive={goal.id === activeGoalId}
                                onClick={() => setActiveGoalId(goal.id)}
                            />
                        ))}
                    </div>
                    <div className="flex-1 flex flex-col -mb-1">
                        <div
                            ref={detailsContentRef}
                            id={detailsContentId}
                            style={{ maxHeight: isDetailsExpanded ? detailsContentRef.current?.scrollHeight : `${DEFAULT_DETAILS_MAX_HEIGHT}px` }}
                            className="overflow-hidden transition-all duration-400 ease-in-out"
                        >
                            {activeGoal ? (
                                <div key={activeGoal.id} className="animate-details-in">
                                    {renderGoalDetails(activeGoal)}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full min-h-[90px]">
                                    <p className="text-sm text-muted-foreground text-center px-4">
                                        {searchQuery
                                            ? "No goals match your search."
                                            : "Select a goal to see details."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <PlaceholderBlock 
                    onSetup={onSetup}
                    message={goals.length > 0 ? "All goals are paused or completed." : setupMessage}
                    cta={goals.length > 0 ? "Create New Goal" : setupCta}
                />
            )}
        </BlockContainer>
    );
}

// ====================================================================================
// Individual Block Components (Refactored)
// ====================================================================================

export const FinancialOverviewBlock: React.FC<{ profile: UserProfile | null; onSetup: () => void; }> = ({ profile, onSetup }) => {
    return (
        <DashboardBlock title="Financial Overview">
            {!profile ? <PlaceholderBlock onSetup={onSetup} message="Add income & housing costs for a clear financial picture." cta="Add Financials" /> : (
                <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Income</span> 
                            <span className="font-semibold text-lg font-heading">£{profile.income.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Housing</span> 
                            <span className="font-semibold text-lg font-heading">-£{profile.housingCost.toLocaleString()}</span>
                        </div>
                         <hr className="border-border my-2"/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Available</span> 
                            <span className="font-bold text-xl text-success font-heading">£{(profile.income - profile.housingCost).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </DashboardBlock>
    );
};

export const SavingsGoalsBlock: React.FC<{ goals: FinancialGoal[], onSetup: () => void; onToggleStatus: (id: string, type: 'financial', newStatus: 'active' | 'paused' | 'completed') => void; }> = ({ goals, onSetup, onToggleStatus }) => {
    return (
        <MultiGoalBlock
            title="Savings Goals"
            goals={goals}
            onSetup={onSetup}
            onToggleStatus={onToggleStatus}
            getGoalHealth={getFinancialGoalHealth}
            goalType="financial"
            setupMessage="What are you saving for? Let's make a plan."
            setupCta="Create Savings Goal"
            renderGoalDetails={(goal) => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                return (
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Target: {goal.targetDate}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-brand h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span>£{goal.currentAmount.toLocaleString()}</span>
                                <span>£{goal.targetAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-end items-center text-xs mt-3 text-muted-foreground gap-3">
                            <button onClick={() => onToggleStatus(goal.id, 'financial', 'paused')} className="hover:text-warning transition-colors">Pause</button>
                            <button onClick={() => onToggleStatus(goal.id, 'financial', 'completed')} className="hover:text-brand transition-colors">Complete</button>
                        </div>
                    </div>
                )
            }}
        />
    );
};

export const AiCoachInsightsBlock: React.FC<{ insight: Pick<AIInsight, 'text'> }> = ({ insight }) => (
    <DashboardBlock title="AI Coach" actions={<Button variant="outline" className="text-xs py-1 px-3">More Insights</Button>}>
        <div className="flex-1 flex items-center justify-center min-h-[100px]">
            <p className="text-center font-semibold text-base leading-relaxed">{insight.text}</p>
        </div>
    </DashboardBlock>
);

export const GoalProgressBlock: React.FC<{ financialGoals: FinancialGoal[], personalGoals: PersonalGoal[] }> = ({ financialGoals, personalGoals }) => {
    
    const activeFinancialGoals = financialGoals.filter(g => g.status === 'active');
    const activePersonalGoals = personalGoals.filter(g => g.status === 'active');

    const financialProgress = activeFinancialGoals.length > 0 
        ? activeFinancialGoals.reduce((acc, g) => acc + (g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0), 0) / activeFinancialGoals.length
        : 0;
    
    const personalProgress = activePersonalGoals.length > 0
        ? activePersonalGoals.reduce((acc, g) => acc + (g.completionHistory.length / parseTimelineToWeeks(g.targetDate)) * 100, 0) / activePersonalGoals.length
        : 0;

    let overallProgress = 0;
    if (activeFinancialGoals.length > 0 && activePersonalGoals.length > 0) {
        overallProgress = (financialProgress + personalProgress) / 2;
    } else if (activeFinancialGoals.length > 0) {
        overallProgress = financialProgress;
    } else if (activePersonalGoals.length > 0) {
        overallProgress = personalProgress;
    }

    let streak = 0;
    if (financialGoals.length > 0 && personalGoals.length > 0) {
        const primaryFinancial = financialGoals.find(g => g.status === 'active');
        const primaryPersonal = personalGoals.find(g => g.status === 'active');
        if (primaryFinancial && primaryPersonal) {
            const historyLength = Math.min(primaryFinancial.savingsHistory.length, primaryPersonal.completionHistory.length);
            for (let i = historyLength - 1; i >= 0; i--) {
                const finHist = primaryFinancial.savingsHistory[i];
                const perHist = primaryPersonal.completionHistory[i];
                
                const savedEnough = finHist.amount >= primaryFinancial.weeklySavingsTarget;
                const didEnoughTasks = perHist.totalTasks > 0 ? (perHist.completedTasks / perHist.totalTasks) >= 0.5 : true;

                if (savedEnough && didEnoughTasks) {
                    streak++;
                } else {
                    break;
                }
            }
        }
    }

    return (
        <DashboardBlock title="Overall Progress">
             { (activeFinancialGoals.length === 0 && activePersonalGoals.length === 0) ? (
                 <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">Set up or resume a goal to see your overall progress.</p>
                </div>
             ) : (
                <div className="flex-1 flex flex-col justify-center text-center">
                    <p className="text-5xl font-heading font-extrabold text-brand">{Math.round(overallProgress)}%</p>
                    <p className="text-sm font-semibold mt-2">Current Streak: <span className="text-foreground">{streak} {streak === 1 ? 'week' : 'weeks'}</span></p>
                </div>
             )}
        </DashboardBlock>
    );
};

const TaskItem: React.FC<{
  task: WeeklyTask;
  isReadOnly: boolean;
  onToggleCompletion: () => void;
  onDelete: () => void;
}> = ({ task, isReadOnly, onToggleCompletion, onDelete }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggleCompletion = async (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!isReadOnly && !isCompleting) {
      setIsCompleting(true);
      // Add a small delay for visual feedback
      setTimeout(() => {
        onToggleCompletion();
        setIsCompleting(false);
      }, 150);
    }
  };

  return (
    <div className={`group bg-card/80 rounded-lg transition-all duration-200 hover:shadow-md ${
      task.completed ? 'bg-card/50 border border-success/20' : 'hover:bg-card border border-transparent hover:border-border'
    } ${isCompleting ? 'animate-pulse-success' : ''}`}>
      <div className="flex items-start p-4 gap-4">
        {/* Checkbox */}
        <div
          role="checkbox"
          aria-checked={task.completed}
          tabIndex={isReadOnly ? -1 : 0}
          onClick={handleToggleCompletion}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleCompletion(e);
            }
          }}
          className={`group relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 transition-all duration-200
            ${task.completed 
              ? 'bg-success text-success-foreground shadow-md' 
              : 'bg-transparent border-2 border-input group-hover:border-brand/50 hover:bg-brand/5'
            }
            ${isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            ${isCompleting ? 'scale-110' : ''}
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`
          }
          aria-label={`${task.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${task.description}`}
        >
          {isCompleting ? (
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : task.completed ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </div>

        {/* Task Title */}
        <div className="flex-1 min-w-0">
          <p className={`transition-all duration-200 ${
            task.completed 
              ? 'line-through text-muted-foreground' 
              : 'text-foreground group-hover:text-foreground'
          }`}>
            {task.description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {task.isCustom && (
              <span className="inline-block text-xs font-semibold text-brand/80 bg-brand/10 px-2 py-0.5 rounded-full">
                Custom
              </span>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-2 p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
            aria-label={`Delete task: ${task.description}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const WeeklyTasksBlock: React.FC<{ 
    goals: PersonalGoal[], 
    onAddTask: (goalId: string, taskDescription: string) => void;
    onToggleTaskCompletion: (goalId: string, taskId: string) => void;
    onDeleteTask: (goalId: string, taskId: string) => void;
    onStartCheckin: () => void;
    isCheckinReady: boolean;
}> = ({ goals, onAddTask, onToggleTaskCompletion, onDeleteTask, onStartCheckin, isCheckinReady }) => {
    const activeGoals = goals.filter(g => g.status === 'active');
    const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeGoals.length > 0 && !activeGoals.some(g => g.id === activeGoalId)) {
            setActiveGoalId(activeGoals[0].id);
        } else if (activeGoals.length === 0) {
            setActiveGoalId(null);
        }
    }, [goals, activeGoals, activeGoalId]);

    const activeGoal = activeGoals.find(g => g.id === activeGoalId);
    
    const [viewedWeek, setViewedWeek] = useState(activeGoal?.currentWeek || 1);
    const [customTask, setCustomTask] = useState("");

    useEffect(() => {
        if (activeGoal) {
            setViewedWeek(activeGoal.currentWeek);
        }
    }, [activeGoal?.id, activeGoal?.currentWeek]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (customTask.trim() && activeGoal) {
            onAddTask(activeGoal.id, customTask.trim());
            setCustomTask("");
        }
    };

    const renderContent = () => {
        if (activeGoals.length === 0) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand/20 to-brand/40 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h4 className="font-heading text-2xl text-foreground mb-3">Welcome to NeuroTracker</h4>
                    <p className="text-muted-foreground mb-6 max-w-lg leading-relaxed">
                        Transform your dreams into achievable goals with AI-powered guidance. Create your first financial and personal goals to get started on your journey.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                        <Button 
                            onClick={() => {/* This will be handled by parent component */}} 
                            className="flex-1"
                            size="lg"
                        >
                            🎯 Create First Goal
                        </Button>
                    </div>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md text-sm">
                        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                            <div className="w-8 h-8 bg-brand/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Financial Goals</p>
                                <p className="text-muted-foreground text-xs">Save for what matters</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Personal Goals</p>
                                <p className="text-muted-foreground text-xs">Grow your skills</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        
        if (!activeGoal) {
             return (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[300px]">
                    <p className="text-sm text-muted-foreground">Select a goal to view your tasks.</p>
                </div>
            )
        }

        const totalWeeks = parseTimelineToWeeks(activeGoal.targetDate);
        const tasksForViewedWeek = activeGoal.taskHistory[viewedWeek - 1] || [];
        const isCurrentWeek = viewedWeek === activeGoal.currentWeek;
        const completedCount = tasksForViewedWeek.filter(t => t.completed).length;
        const totalCount = tasksForViewedWeek.length;
        
        return (
            <div className="p-5 flex flex-col flex-1 min-h-0">
                 <div className="flex justify-between items-center mb-4">
                    <button 
                        onClick={() => setViewedWeek(v => v - 1)} 
                        disabled={viewedWeek <= 1}
                        className="p-1 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <div className="text-center">
                        <p className="font-semibold text-base">
                           {viewedWeek < activeGoal.currentWeek ? 'Completed:' : ''} Week {viewedWeek}
                        </p>
                        <p className="text-xs text-muted-foreground">of {totalWeeks} total</p>
                    </div>
                    <button 
                        onClick={() => setViewedWeek(v => v + 1)} 
                        disabled={viewedWeek >= activeGoal.currentWeek}
                        className="p-1 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-sm font-semibold text-muted-foreground">Progress: {completedCount}/{totalCount}</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                            className="bg-brand h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex-1 space-y-2 text-sm overflow-y-auto pr-2">
                    {tasksForViewedWeek.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No tasks for this week.</p>
                    ) : tasksForViewedWeek.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            isReadOnly={!isCurrentWeek}
                            onToggleCompletion={() => onToggleTaskCompletion(activeGoal.id, task.id)}
                            onDelete={() => onDeleteTask(activeGoal.id, task.id)}
                        />
                    ))}
                </div>

                <div className="mt-4">
                    {isCurrentWeek && (
                         <form onSubmit={handleAddTask} className="flex gap-2">
                            <input
                                type="text"
                                value={customTask}
                                onChange={(e) => setCustomTask(e.target.value)}
                                placeholder="+ Add a custom task"
                                className="w-full text-sm p-2 rounded-md bg-transparent border border-input focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                            />
                            <Button type="submit" variant="secondary" className="px-3 py-2 text-xs">Add</Button>
                        </form>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div ref={rootRef} className="premium-glass text-foreground flex flex-col h-full max-h-[calc(100vh-128px)]">
            <div className="flex justify-between items-center p-5 pb-0">
                <h3 className="text-lg font-heading text-foreground">Your Weekly Journey</h3>
            </div>

            {activeGoals.length > 0 && (
                <div className="flex items-start flex-wrap gap-2 border-b border-border px-5 pt-2 pb-2 mb-0">
                    {activeGoals.map(goal => (
                        <GoalTab 
                            key={goal.id}
                            label={goal.description}
                            health={getPersonalGoalHealth(goal)}
                            isActive={goal.id === activeGoalId}
                            onClick={() => setActiveGoalId(goal.id)}
                        />
                    ))}
                </div>
            )}
            
            <div className="flex flex-col flex-1 min-h-0">
              {renderContent()}
            </div>

            <div className="p-5 pt-4 border-t border-border mt-auto">
                <Button 
                    onClick={onStartCheckin}
                    disabled={!isCheckinReady}
                    variant="primary"
                    className="w-full"
                >
                    Start Weekly Check-in
                </Button>
            </div>
        </div>
    )
};


export const AddNewGoalBlock: React.FC<{ onAddFinancial: () => void; onAddPersonal: () => void; }> = ({ onAddFinancial, onAddPersonal }) => (
    <DashboardBlock title="Manage Goals">
        <div className="flex-1 flex flex-col justify-center items-center gap-3">
            <Button onClick={onAddFinancial} variant="secondary" className="w-full">New Savings Goal</Button>
            <Button onClick={onAddPersonal} variant="secondary" className="w-full">New Personal Goal</Button>
        </div>
    </DashboardBlock>
);