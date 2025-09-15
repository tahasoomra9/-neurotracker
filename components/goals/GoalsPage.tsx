import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FinancialGoal, PersonalGoal, FinancialGoalSetupData, PersonalGoalSetupData, UserProfile, Transaction, NewTransaction } from '../../types';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import ConfirmationModal from '../common/ConfirmationModal';
import FinancialGoalSetupModal from '../FinancialGoalSetupModal';
import PersonalGoalSetupModal from '../PersonalGoalSetupModal';
import AddTransactionModal from '../finance/AddTransactionModal';
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
    const menuRef = useRef<HTMLDivElement>(null);
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

    return (
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground">
                <KebabIcon />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-10 w-48 bg-popover rounded-md shadow-lg z-10 border border-border p-1 animate-modal-in">
                    {actions.map(item => (
                        <button key={item.action} onClick={() => { onAction(item.action as ActionType); setIsOpen(false); }} className="w-full flex items-center px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md">
                           {item.icon} {item.label}
                        </button>
                    ))}
                    <div className="my-1 h-px bg-border" />
                    <button onClick={() => { onAction('delete'); setIsOpen(false); }} className="w-full flex items-center px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md">
                        <TrashIcon /> Delete Goal
                    </button>
                </div>
            )}
        </div>
    );
};

const GoalStatusIndicator: React.FC<{ status: 'active' | 'paused' | 'completed' }> = ({ status }) => {
    const statusStyles = {
        active: 'bg-success/20 text-success',
        paused: 'bg-warning/20 text-warning',
        completed: 'bg-brand/20 text-brand'
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[status]}`}>
            {status}
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

    const handleLocalAction = (action: ActionType) => {
        if (action === 'resume') {
            onAction('resume', { ...goal, status: 'active' });
        } else {
            onAction(action, goal);
        }
    }

    return (
        <div className="premium-glass overflow-visible p-5 flex flex-col cursor-pointer" onClick={onCardClick}>
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-lg text-foreground pr-4">{goal.description}</h4>
                <GoalStatusIndicator status={goal.status} />
            </div>
            
            <div className="mb-4">
                <ProgressBar progress={progress} />
                <div className="flex justify-between text-sm font-medium mt-2">
                    <span className="text-brand font-bold">Week {goal.currentWeek}</span>
                    <span className="text-muted-foreground">of {totalWeeks}</span>
                </div>
            </div>

            <div
                ref={detailsRef}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isExpanded ? `${detailsRef.current?.scrollHeight}px` : '0px' }}
            >
                <p className="text-sm text-muted-foreground pt-2 pb-4">
                    <span className="font-semibold text-foreground/90">AI Analysis: </span>
                    {goal.timelineAnalysis}
                </p>
            </div>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border-glass">
                <p className="text-sm font-semibold text-muted-foreground">Time: <span className="text-foreground">{goal.dailyTimeAvailable}/day</span></p>
                <ActionMenu status={goal.status} onAction={handleLocalAction} />
            </div>
        </div>
    );
};


const FilterTab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            isActive ? 'bg-brand/20 text-brand' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
    >
        {label}
    </button>
);


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
    onDeleteTransaction 
}) => {
    const [activeTab, setActiveTab] = useState<GoalType>('financial');
    const [filter, setFilter] = useState<GoalFilter>('active');
    const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

    const [selectedFinancialGoalId, setSelectedFinancialGoalId] = useState<string | null>(null);
    
    const selectedFinancialGoal = useMemo(() => {
        return financialGoals.find(g => g.id === selectedFinancialGoalId) || null;
    }, [financialGoals, selectedFinancialGoalId]);

    useEffect(() => {
        if(selectedFinancialGoalId && !financialGoals.some(g => g.id === selectedFinancialGoalId)) {
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

    const handleAction = (action: ActionType, goal: FinancialGoal | PersonalGoal) => {
        const goalType: GoalType = 'itemName' in goal ? 'financial' : 'personal';
        switch (action) {
            case 'pause':
                onToggleGoalStatus(goal.id, goalType, 'paused');
                break;
            case 'resume':
                onToggleGoalStatus(goal.id, goalType, 'active');
                break;
            case 'complete':
                onToggleGoalStatus(goal.id, goalType, 'completed');
                break;
            case 'delete':
                const name = 'itemName' in goal ? goal.itemName : goal.description;
                setGoalToDelete({ id: goal.id, type: goalType, name });
                break;
        }
    };

    const confirmDelete = () => {
        if (goalToDelete) {
            onDeleteGoal(goalToDelete.id, goalToDelete.type);
            setGoalToDelete(null);
        }
    };
    
    const handleFinancialSetupComplete = async (data: FinancialGoalSetupData) => {
        await onSetupFinancialGoal(data);
        setIsFinancialSetupOpen(false);
    }
    const handlePersonalSetupComplete = async (data: PersonalGoalSetupData) => {
        await onSetupPersonalGoal(data);
        setIsPersonalSetupOpen(false);
    }
    const handleAddTransactionComplete = (data: NewTransaction) => {
        onAddTransaction(data);
        setIsAddTransactionOpen(false);
    }

    const filteredPersonalGoals = useMemo(() => {
        if (filter === 'all') return personalGoals;
        return personalGoals.filter(g => g.status === filter);
    }, [personalGoals, filter]);

    const renderEmptyState = (type: GoalType) => (
        <div className="col-span-full flex flex-col items-center justify-center text-center p-12 bg-card/50 rounded-lg border border-dashed border-border">
            <h3 className="text-xl font-heading text-foreground">No Goals Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
                {`You don't have any ${filter !== 'all' ? filter : ''} ${type} goals. Start by adding a new one to track your progress!`}
            </p>
            <Button onClick={() => type === 'financial' ? setIsFinancialSetupOpen(true) : setIsPersonalSetupOpen(true)} className="mt-6">
                <PlusIcon /> Add {type === 'financial' ? 'Financial' : 'Personal'} Goal
            </Button>
        </div>
    );

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
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-heading text-foreground">My Goals</h1>
                    <Button onClick={() => activeTab === 'financial' ? setIsFinancialSetupOpen(true) : setIsPersonalSetupOpen(true)}>
                        <PlusIcon /> Add New Goal
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button onClick={() => { setActiveTab('financial'); setFilter('active'); }} className={`px-4 py-3 font-semibold transition-colors ${activeTab === 'financial' ? 'text-brand border-b-2 border-brand' : 'text-muted-foreground hover:text-foreground'}`}>
                        Finance
                    </button>
                    <button onClick={() => { setActiveTab('personal'); setFilter('active'); }} className={`px-4 py-3 font-semibold transition-colors ${activeTab === 'personal' ? 'text-brand border-b-2 border-brand' : 'text-muted-foreground hover:text-foreground'}`}>
                        Personal
                    </button>
                </div>
                
                {activeTab === 'financial' && <FinancialGoalsDashboard />}

                {activeTab === 'personal' && (
                    <>
                        <div className="flex items-center gap-2">
                            <FilterTab label="Active" isActive={filter === 'active'} onClick={() => setFilter('active')} />
                            <FilterTab label="Paused" isActive={filter === 'paused'} onClick={() => setFilter('paused')} />
                            <FilterTab label="Completed" isActive={filter === 'completed'} onClick={() => setFilter('completed')} />
                            <FilterTab label="All" isActive={filter === 'all'} onClick={() => setFilter('all')} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                            {filteredPersonalGoals.length > 0
                                    ? filteredPersonalGoals.map(goal => 
                                        <PersonalGoalCard 
                                            key={goal.id} 
                                            goal={goal} 
                                            onAction={handleAction} 
                                            isExpanded={expandedGoalId === goal.id}
                                            onCardClick={() => handleCardClick(goal.id)}
                                        />)
                                    : renderEmptyState('personal')
                            }
                        </div>
                    </>
                )}
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
        </>
    );
};

export default GoalsPage;
