import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FinancialGoal, PersonalGoal, FinancialGoalSetupData, PersonalGoalSetupData, UserProfile, Transaction, NewTransaction } from '../../types';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import ConfirmationModal from '../common/ConfirmationModal';
import FinancialGoalSetupModal from '../FinancialGoalSetupModal';
import PersonalGoalSetupModal from '../PersonalGoalSetupModal';
import AddTransactionModal from '../finance/AddTransactionModal';
import ActionFeedback from '../common/SuccessFeedback';
import ErrorBoundary from '../common/ErrorBoundary';
import { ActiveGoalSummaryBlock, MetricCard, AllFinancialGoalsBlock, RecentTransactionsBlock, SpendingBreakdownBlock } from '../finance/FinanceBlocks';
import { FinancialGoalDetailBlock } from './GoalDetailBlocks';

// ===================================
// Props
// ===================================
interface GoalsPageProps {
    userProfile: UserProfile | null;
    financialGoals: FinancialGoal[];
    personalGoals: PersonalGoal[];
    transactions: Transaction[];
    onToggleGoalStatus: (id: string, type: 'financial' | 'personal', newStatus: 'active' | 'paused' | 'completed') => void;
    onDeleteGoal: (id: string, type: 'financial' | 'personal') => void;
    onSetupFinancialGoal: (data: FinancialGoalSetupData) => Promise<void>;
    onSetupPersonalGoal: (data: PersonalGoalSetupData) => Promise<void>;
    onAddTransaction: (transaction: NewTransaction) => void;
    onDeleteTransaction: (id: string) => void;
    onTabChange?: (tab: 'financial' | 'personal') => void;
}

type GoalFilter = 'active' | 'paused' | 'completed' | 'all';
type GoalType = 'financial' | 'personal';
type ActionType = 'pause' | 'resume' | 'complete' | 'delete';

// ===================================
// Helper Function
// ===================================
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


// ===================================
// Icons & Helper Components
// ===================================
const KebabIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
);
const PlusIcon = () => <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const PauseIcon = () => <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm0-3a1 1 0 012 0v.5a1 1 0 11-2 0V5z" clipRule="evenodd" /></svg>;
const PlayIcon = () => <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;


const useOutsideClick = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
};

const ActionMenu: React.FC<{
    status: 'active' | 'paused' | 'completed';
    onAction: (action: ActionType) => void;
}> = ({ status, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    useOutsideClick(menuRef, () => setIsOpen(false));

    const menuItems = {
        active: [
            { label: 'Pause Goal', icon: <PauseIcon />, action: 'pause' },
            { label: 'Mark as Complete', icon: <CheckCircleIcon />, action: 'complete' },
        ],
        paused: [
            { label: 'Resume Goal', icon: <PlayIcon />, action: 'resume' },
        ],
        completed: []
    };

    const actions = status === 'active' ? menuItems.active : status === 'paused' ? menuItems.paused : [];

    const handleToggleMenu = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const menuWidth = 192; // 192px = w-48 (12rem * 16px)
            const menuHeight = 120; // Approximate menu height

            // Calculate position relative to viewport (fixed positioning)
            let left = rect.left;
            let top = rect.bottom + 4;

            // Adjust if menu would go off-screen to the right
            if (left + menuWidth > window.innerWidth - 8) {
                left = rect.right - menuWidth;
            }

            // Adjust if menu would go off-screen to the left
            if (left < 8) {
                left = 8;
            }

            // Adjust if menu would go off-screen at the bottom
            if (top + menuHeight > window.innerHeight - 8) {
                top = rect.top - menuHeight - 4;
            }

            // Ensure menu doesn't go above viewport
            if (top < 8) {
                top = rect.bottom + 4;
            }

            setMenuPosition({ top, left });
        }
        setIsOpen(!isOpen);
    };

    const handleAction = async (action: ActionType) => {
        setIsProcessing(true);
        setIsOpen(false);

        // Add visual feedback delay
        setTimeout(() => {
            onAction(action);
            setIsProcessing(false);
        }, 150);
    };

    const dropdownContent = isOpen ? (
        <div
            ref={menuRef}
            className="fixed w-48 bg-popover rounded-lg shadow-xl z-[10000] border border-border p-1 animate-modal-in backdrop-blur-sm"
            style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {actions.map(item => (
                <button
                    key={item.action}
                    onClick={() => handleAction(item.action as ActionType)}
                    className="w-full flex items-center px-3 py-3 text-sm text-foreground hover:bg-accent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={isProcessing}
                >
                    {item.icon} {item.label}
                </button>
            ))}
            <div className="my-1 h-px bg-border" />
            <button
                onClick={() => handleAction('delete')}
                className="w-full flex items-center px-3 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-destructive"
                disabled={isProcessing}
            >
                <TrashIcon /> Delete Goal
            </button>
        </div>
    ) : null;

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                ref={buttonRef}
                onClick={handleToggleMenu}
                className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isProcessing}
                aria-label="Goal actions menu"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {isProcessing ? (
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                    <KebabIcon />
                )}
            </button>
            {dropdownContent && createPortal(dropdownContent, document.body)}
        </div>
    );
};

const GoalStatusIndicator: React.FC<{ status: 'active' | 'paused' | 'completed' }> = ({ status }) => {
    const statusConfig = {
        active: {
            bg: 'bg-success/20',
            text: 'text-success',
            icon: '●',
            label: 'Active'
        },
        paused: {
            bg: 'bg-warning/20',
            text: 'text-warning',
            icon: '⏸',
            label: 'Paused'
        },
        completed: {
            bg: 'bg-brand/20',
            text: 'text-brand',
            icon: '✓',
            label: 'Completed'
        }
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${config.bg} ${config.text}`}>
            <span className="text-sm" aria-hidden="true">{config.icon}</span>
            {config.label}
        </span>
    );
};


const PersonalGoalCard: React.FC<{
    goal: PersonalGoal,
    onAction: (action: ActionType, goal: PersonalGoal) => void,
    isExpanded: boolean,
    onCardClick: () => void
}> = ({ goal, onAction, isExpanded, onCardClick }) => {
    const totalWeeks = parseTimelineToWeeks(goal.targetDate);
    const progress = totalWeeks > 0 ? (goal.currentWeek / totalWeeks) * 100 : 0;
    const detailsRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleLocalAction = (action: ActionType) => {
        if (action === 'resume') {
            onAction('resume', { ...goal, status: 'active' });
        } else {
            onAction(action, goal);
        }
    }

    const handleCardClick = () => {
        onCardClick();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
        }
    };

    return (
        <div
            className={`premium-glass p-6 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring ${isExpanded ? 'ring-2 ring-brand/50' : ''}`}
            style={{ overflow: 'visible' }}
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-expanded={isExpanded}
            aria-label={`${goal.description} goal card. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                    <h4 className="font-semibold text-xl text-foreground mb-2 leading-tight">{goal.description}</h4>
                    <p className="text-sm text-muted-foreground">
                        {goal.goalType} • {goal.dailyTimeAvailable}/day
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <GoalStatusIndicator status={goal.status} />
                    {isHovered && (
                        <span className="text-xs text-muted-foreground animate-fade-in">
                            {isExpanded ? 'Click to collapse' : 'Click to expand'}
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Progress</span>
                    <span className="text-sm font-bold text-brand">Week {goal.currentWeek} of {totalWeeks}</span>
                </div>
                <ProgressBar
                    progress={progress}
                    size="md"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{Math.round(progress)}% complete</span>
                    <span>{totalWeeks - goal.currentWeek} weeks remaining</span>
                </div>
            </div>

            <div
                ref={detailsRef}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isExpanded ? `${detailsRef.current?.scrollHeight}px` : '0px' }}
            >
                <div className="pt-2 pb-4 border-t border-border-glass">
                    <h5 className="font-semibold text-sm text-foreground mb-2">AI Analysis</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {goal.timelineAnalysis}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center mt-auto pt-4">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${goal.status === 'active' ? 'bg-success animate-pulse' : goal.status === 'paused' ? 'bg-warning' : 'bg-brand'}`} />
                    <span className="text-xs text-muted-foreground capitalize">{goal.status}</span>
                </div>
                <ActionMenu status={goal.status} onAction={handleLocalAction} />
            </div>
        </div>
    );
};


const FilterTab: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    count?: number;
}> = ({ label, isActive, onClick, count }) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.blur(); // Remove focus after click
        onClick();
    };

    return (
        <button
            onClick={handleClick}
            className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none ${isActive
                ? 'text-brand'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            aria-pressed={isActive}
            role="tab"
        >
            {label}
            {count !== undefined && (
                <span className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${isActive
                    ? 'bg-brand/20 text-brand'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {count}
                </span>
            )}
            {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
            )}
        </button>
    );
};


const GoalsPage: React.FC<GoalsPageProps> = ({
    userProfile,
    financialGoals,
    personalGoals,
    transactions,
    onToggleGoalStatus,
    onDeleteGoal,
    onSetupFinancialGoal,
    onSetupPersonalGoal,
    onAddTransaction,
    onDeleteTransaction,
    onTabChange
}) => {
    const [activeTab, setActiveTab] = useState<GoalType>('financial');

    // Notify parent when tab changes
    useEffect(() => {
        if (onTabChange) {
            onTabChange(activeTab);
        }
    }, [activeTab, onTabChange]);
    const [filter, setFilter] = useState<GoalFilter>('active');
    const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

    const [selectedFinancialGoalId, setSelectedFinancialGoalId] = useState<string | null>(null);

    const selectedFinancialGoal = useMemo(() => {
        return financialGoals.find(g => g.id === selectedFinancialGoalId) || null;
    }, [financialGoals, selectedFinancialGoalId]);

    useEffect(() => {
        if (selectedFinancialGoalId && !financialGoals.some(g => g.id === selectedFinancialGoalId)) {
            setSelectedFinancialGoalId(null);
        }
        if (!selectedFinancialGoalId && activeTab === 'financial') {
            const firstActive = financialGoals.find(g => g.status === 'active');
            if (firstActive) {
                setSelectedFinancialGoalId(firstActive.id);
            }
        }
    }, [financialGoals, selectedFinancialGoalId, activeTab]);

    const handleCardClick = (goalId: string) => {
        setExpandedGoalId(prevId => (prevId === goalId ? null : goalId));
    };

    // Modals State
    const [isFinancialSetupOpen, setIsFinancialSetupOpen] = useState(false);
    const [isPersonalSetupOpen, setIsPersonalSetupOpen] = useState(false);
    const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<{ id: string; type: GoalType, name: string } | null>(null);

    // Action feedback state
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');
    const [feedbackAction, setFeedbackAction] = useState<'paused' | 'resumed' | 'completed' | 'deleted' | 'created'>('created');
    const [showFeedback, setShowFeedback] = useState(false);

    const showActionFeedback = (message: string, action: 'paused' | 'resumed' | 'completed' | 'deleted' | 'created') => {
        setFeedbackMessage(message);
        setFeedbackAction(action);
        setShowFeedback(true);
    };

    const handleAction = (action: ActionType, goal: FinancialGoal | PersonalGoal) => {
        const goalType: GoalType = 'itemName' in goal ? 'financial' : 'personal';
        const goalName = 'itemName' in goal ? goal.itemName : goal.description;

        switch (action) {
            case 'pause':
                onToggleGoalStatus(goal.id, goalType, 'paused');
                showActionFeedback(`"${goalName}" has been paused`, 'paused');
                break;
            case 'resume':
                onToggleGoalStatus(goal.id, goalType, 'active');
                showActionFeedback(`"${goalName}" has been resumed`, 'resumed');
                break;
            case 'complete':
                onToggleGoalStatus(goal.id, goalType, 'completed');
                showActionFeedback(`Congratulations! "${goalName}" completed!`, 'completed');
                break;
            case 'delete':
                setGoalToDelete({ id: goal.id, type: goalType, name: goalName });
                break;
        }
    };

    const confirmDelete = () => {
        if (goalToDelete) {
            onDeleteGoal(goalToDelete.id, goalToDelete.type);
            showActionFeedback(`"${goalToDelete.name}" has been deleted`, 'deleted');
            setGoalToDelete(null);
        }
    };

    const handleFinancialSetupComplete = async (data: FinancialGoalSetupData) => {
        await onSetupFinancialGoal(data);
        setIsFinancialSetupOpen(false);
        showActionFeedback(`Financial goal "${data.savingsGoal}" created successfully!`, 'created');
    }
    const handlePersonalSetupComplete = async (data: PersonalGoalSetupData) => {
        await onSetupPersonalGoal(data);
        setIsPersonalSetupOpen(false);
        showActionFeedback(`Personal goal "${data.personalGoal}" created successfully!`, 'created');
    }
    const handleAddTransactionComplete = (data: NewTransaction) => {
        onAddTransaction(data);
        setIsAddTransactionOpen(false);
        showActionFeedback(`Transaction "${data.description}" added successfully!`, 'created');
    }

    const filteredPersonalGoals = useMemo(() => {
        if (filter === 'all') return personalGoals;
        return personalGoals.filter(g => g.status === filter);
    }, [personalGoals, filter]);

    const renderEmptyState = (type: GoalType) => {
        const isFiltered = filter !== 'all';
        const hasGoalsInOtherStates = type === 'personal' && personalGoals.length > 0;

        return (
            <div className="col-span-full flex flex-col items-center justify-center text-center p-16 bg-gradient-to-br from-card/30 to-card/60 rounded-xl border border-dashed border-border">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                    {type === 'financial' ? (
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    )}
                </div>

                <h3 className="text-2xl font-heading text-foreground mb-3">
                    {isFiltered ? `No ${filter} goals` : `No ${type} goals yet`}
                </h3>

                <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                    {isFiltered && hasGoalsInOtherStates ? (
                        `You don't have any ${filter} ${type} goals. Try switching to a different filter or create a new goal.`
                    ) : type === 'financial' ? (
                        "Start your financial journey by setting a savings goal. Whether it's for a vacation, emergency fund, or major purchase, we'll help you create a realistic plan."
                    ) : (
                        "Personal goals help you grow and achieve your dreams. Set a learning goal, fitness target, or skill development plan and let our AI guide your weekly tasks."
                    )}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={() => type === 'financial' ? setIsFinancialSetupOpen(true) : setIsPersonalSetupOpen(true)}
                        className="px-6 py-3"
                    >
                        <PlusIcon /> Create {type === 'financial' ? 'Financial' : 'Personal'} Goal
                    </Button>

                    {isFiltered && hasGoalsInOtherStates && (
                        <Button
                            variant="outline"
                            onClick={() => setFilter('all')}
                            className="px-6 py-3"
                        >
                            View All Goals
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const FinancialGoalsDashboard = () => {
        const totalSaved = financialGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);
        const activeGoal = financialGoals.find(g => g.status === 'active');

        let weeklyAverage = 0;
        if (activeGoal && activeGoal.savingsHistory.length > 0) {
            const totalSavedForGoal = activeGoal.savingsHistory.reduce((acc, week) => acc + week.amount, 0);
            weeklyAverage = totalSavedForGoal / activeGoal.savingsHistory.length;
        }
        const savingsRate = activeGoal && activeGoal.weeklySavingsTarget > 0 ? (weeklyAverage / activeGoal.weeklySavingsTarget) * 100 : 0;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                        <ActiveGoalSummaryBlock goal={activeGoal} />
                    </div>
                    <MetricCard title="Total Savings" value={`£${totalSaved.toLocaleString()}`} subtext="Across all goals" />
                    <MetricCard title="Savings Rate" value={`${savingsRate.toFixed(0)}%`} subtext="Active goal vs. target" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <AllFinancialGoalsBlock
                            goals={financialGoals}
                            onAddNew={() => setIsFinancialSetupOpen(true)}
                            onAction={handleAction}
                            onGoalClick={setSelectedFinancialGoalId}
                            selectedGoalId={selectedFinancialGoalId}
                        />
                        <FinancialGoalDetailBlock goal={selectedFinancialGoal} />
                    </div>
                    <div className="space-y-6">
                        <RecentTransactionsBlock
                            transactions={transactions}
                            onAdd={() => setIsAddTransactionOpen(true)}
                            onDelete={onDeleteTransaction}
                        />
                        <SpendingBreakdownBlock transactions={transactions} />
                    </div>
                </div>
            </div>
        )
    }


    return (
        <ErrorBoundary>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-heading text-foreground mb-2">My Goals</h1>
                        <p className="text-muted-foreground">
                            Track your progress and achieve your dreams with AI-powered guidance
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => {
                                // Quick action to view all goals
                                setActiveTab('personal');
                                setFilter('all');
                            }}
                            className="hidden sm:inline-flex"
                        >
                            View All
                        </Button>
                        <Button
                            onClick={() => activeTab === 'financial' ? setIsFinancialSetupOpen(true) : setIsPersonalSetupOpen(true)}
                            size="md"
                        >
                            <PlusIcon /> Add New Goal
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border" role="tablist" aria-label="Goal categories">
                    <button
                        onClick={(e) => {
                            e.currentTarget.blur();
                            setActiveTab('financial');
                            setFilter('active');
                        }}
                        className={`relative px-6 py-4 font-semibold transition-all duration-200 focus:outline-none ${activeTab === 'financial'
                            ? 'text-brand'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        role="tab"
                        aria-selected={activeTab === 'financial'}
                        aria-controls="financial-panel"
                    >
                        <span className="flex items-center gap-2">
                            Financial Goals
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-muted text-muted-foreground rounded-full">
                                {financialGoals.length}
                            </span>
                        </span>
                        {activeTab === 'financial' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={(e) => {
                            e.currentTarget.blur();
                            setActiveTab('personal');
                            setFilter('active');
                        }}
                        className={`relative px-6 py-4 font-semibold transition-all duration-200 focus:outline-none ${activeTab === 'personal'
                            ? 'text-brand'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        role="tab"
                        aria-selected={activeTab === 'personal'}
                        aria-controls="personal-panel"
                    >
                        <span className="flex items-center gap-2">
                            Personal Goals
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-muted text-muted-foreground rounded-full">
                                {personalGoals.length}
                            </span>
                        </span>
                        {activeTab === 'personal' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
                        )}
                    </button>
                </div>

                <div
                    id="financial-panel"
                    role="tabpanel"
                    aria-labelledby="financial-tab"
                    className={activeTab === 'financial' ? 'block' : 'hidden'}
                >
                    {activeTab === 'financial' && <FinancialGoalsDashboard />}
                </div>

                <div
                    id="personal-panel"
                    role="tabpanel"
                    aria-labelledby="personal-tab"
                    className={activeTab === 'personal' ? 'block' : 'hidden'}
                >
                    {activeTab === 'personal' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 flex-wrap" role="tablist" aria-label="Goal status filters">
                                <FilterTab
                                    label="Active"
                                    isActive={filter === 'active'}
                                    onClick={() => setFilter('active')}
                                    count={personalGoals.filter(g => g.status === 'active').length}
                                />
                                <FilterTab
                                    label="Paused"
                                    isActive={filter === 'paused'}
                                    onClick={() => setFilter('paused')}
                                    count={personalGoals.filter(g => g.status === 'paused').length}
                                />
                                <FilterTab
                                    label="Completed"
                                    isActive={filter === 'completed'}
                                    onClick={() => setFilter('completed')}
                                    count={personalGoals.filter(g => g.status === 'completed').length}
                                />
                                <FilterTab
                                    label="All"
                                    isActive={filter === 'all'}
                                    onClick={() => setFilter('all')}
                                    count={personalGoals.length}
                                />
                            </div>
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start"
                                role="grid"
                                aria-label={`${filter} personal goals`}
                            >
                                {filteredPersonalGoals.length > 0
                                    ? filteredPersonalGoals.map((goal, index) =>
                                        <div key={goal.id} role="gridcell">
                                            <PersonalGoalCard
                                                goal={goal}
                                                onAction={handleAction}
                                                isExpanded={expandedGoalId === goal.id}
                                                onCardClick={() => handleCardClick(goal.id)}
                                            />
                                        </div>)
                                    : renderEmptyState('personal')
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={!!goalToDelete}
                onClose={() => setGoalToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to permanently delete the goal "${goalToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete Goal"
            />
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
            {isAddTransactionOpen && (
                <AddTransactionModal
                    onComplete={handleAddTransactionComplete}
                    onClose={() => setIsAddTransactionOpen(false)}
                />
            )}

            <ActionFeedback
                message={feedbackMessage}
                action={feedbackAction}
                show={showFeedback}
                onHide={() => setShowFeedback(false)}
            />
        </ErrorBoundary>
    );
};

export default GoalsPage;
