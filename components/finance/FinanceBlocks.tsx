import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FinancialGoal, Transaction } from '../../types';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

// ===================================
// Block Container
// ===================================
const BlockContainer: React.FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => (
    <div className={`premium-glass p-5 text-foreground flex flex-col ${className}`}>
        {children}
    </div>
);

// ===================================
// Finance Summary Blocks (Refactored for Hierarchy)
// ===================================

export const MetricCard: React.FC<{ title: string; value: string; subtext?: string; }> = ({ title, value, subtext }) => (
    <div className="premium-glass p-4 flex flex-col justify-center h-full">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold font-heading text-foreground mt-1">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
    </div>
);

export const ActiveGoalSummaryBlock: React.FC<{ goal: FinancialGoal | undefined }> = ({ goal }) => {
    if (!goal) {
        return (
             <div className="premium-glass p-4 flex flex-col justify-center h-full text-center">
                <p className="text-muted-foreground">No active financial goal.</p>
                <p className="text-xs text-muted-foreground/80 mt-1">Set a new goal to see your progress here.</p>
            </div>
        )
    }
    
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

    return (
        <div className="premium-glass p-4 flex flex-col justify-center h-full">
            <p className="text-sm text-muted-foreground">Active Goal: <span className="text-foreground font-semibold">{goal.itemName}</span></p>
            <div className="mt-3">
                <ProgressBar progress={progress} />
                <div className="flex justify-between items-baseline mt-2">
                    <span className="text-2xl font-bold font-heading text-brand">£{goal.currentAmount.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">of £{goal.targetAmount.toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
};


// ===================================
// All Financial Goals Block
// ===================================
type ActionType = 'pause' | 'resume' | 'complete' | 'delete';

const KebabIcon = () => <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>;
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
        <div className="relative" ref={menuRef}>
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


const GoalListItem: React.FC<{
    goal: FinancialGoal;
    onAction: (action: ActionType, goal: FinancialGoal) => void;
    onClick?: () => void;
    isSelected: boolean;
}> = ({ goal, onAction, onClick, isSelected }) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    
    const handleLocalAction = (action: ActionType) => {
        if (action === 'resume') {
            onAction('resume', { ...goal, status: 'active' });
        } else {
            onAction(action, goal);
        }
    }

    return (
        <div 
            onClick={onClick}
            className={`bg-card/80 p-4 rounded-lg transition-all duration-300 animate-[modal-in_0.3s_ease-out_forwards] overflow-visible ${onClick ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-brand ring-offset-2 ring-offset-background' : 'hover:bg-card'}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-semibold text-foreground">{goal.itemName}</p>
                    <p className="text-xs text-muted-foreground">Target: {goal.targetDate}</p>
                </div>
                <div className="flex items-center gap-2">
                    <GoalStatusIndicator status={goal.status} />
                    <ActionMenu status={goal.status} onAction={handleLocalAction} />
                </div>
            </div>
            <ProgressBar progress={progress} />
            <div className="flex justify-between text-xs font-medium mt-1">
                <span className="text-muted-foreground">£{goal.currentAmount.toLocaleString()}</span>
                <span className="text-foreground">£{goal.targetAmount.toLocaleString()}</span>
            </div>
        </div>
    );
}

const FilterTab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            isActive ? 'bg-brand/20 text-brand' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
    >
        {label}
    </button>
)

export const AllFinancialGoalsBlock: React.FC<{
    goals: FinancialGoal[];
    onAddNew: () => void;
    onAction: (action: ActionType, goal: FinancialGoal) => void;
    onGoalClick?: (id: string) => void;
    selectedGoalId?: string | null;
}> = ({ goals, onAddNew, onAction, onGoalClick, selectedGoalId }) => {
    const [filter, setFilter] = useState<'active' | 'paused' | 'completed' | 'all'>('active');

    const filteredGoals = useMemo(() => {
        if (filter === 'all') return goals;
        return goals.filter(g => g.status === filter);
    }, [goals, filter]);

    return (
        <BlockContainer className="min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-heading text-foreground">Financial Goals</h3>
                <Button onClick={onAddNew} variant="secondary" className="text-xs px-3 py-1.5">+ Add New Goal</Button>
            </div>

            <div className="flex items-center gap-2 mb-4 border-b border-border -mx-5 px-5 pb-3">
                <FilterTab label="Active" isActive={filter === 'active'} onClick={() => setFilter('active')} />
                <FilterTab label="Paused" isActive={filter === 'paused'} onClick={() => setFilter('paused')} />
                <FilterTab label="Completed" isActive={filter === 'completed'} onClick={() => setFilter('completed')} />
                <FilterTab label="All" isActive={filter === 'all'} onClick={() => setFilter('all')} />
            </div>

            {filteredGoals.length > 0 ? (
                <div className="space-y-3 pr-2">
                    {filteredGoals.map(goal => (
                        <GoalListItem 
                            key={goal.id} 
                            goal={goal} 
                            onAction={onAction}
                            onClick={onGoalClick ? () => onGoalClick(goal.id) : undefined}
                            isSelected={goal.id === selectedGoalId}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-muted-foreground">No {filter !== 'all' ? filter : ''} goals found.</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                        {filter !== 'active' ? 'Try a different filter or add a new goal.' : 'Click "Add New Goal" to get started.'}
                    </p>
                </div>
            )}
        </BlockContainer>
    );
};

// ===================================
// Recent Transactions Block
// ===================================

const TransactionItem: React.FC<{ transaction: Transaction; onDelete: () => void; }> = ({ transaction, onDelete }) => (
    <div className="group flex justify-between items-center bg-card/50 p-3 rounded-md">
        <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">{transaction.category}</p>
        </div>
        <div className="flex items-center gap-3 ml-2">
            <p className={`font-semibold text-sm flex-shrink-0 ${transaction.type === 'income' ? 'text-success' : 'text-foreground'}`}>
               {transaction.type === 'income' ? `+£${transaction.amount.toFixed(2)}` : `-£${transaction.amount.toFixed(2)}`}
            </p>
            <button 
                onClick={onDelete} 
                className="w-6 h-6 flex items-center justify-center rounded-full bg-card hover:bg-destructive text-muted-foreground hover:text-destructive-foreground transition-all opacity-50 group-hover:opacity-100"
                aria-label={`Delete transaction ${transaction.description}`}
            >
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
        </div>
    </div>
);

export const RecentTransactionsBlock: React.FC<{ transactions: Transaction[], onAdd: () => void; onDelete: (id: string) => void; }> = ({ transactions, onAdd, onDelete }) => {
    return (
        <BlockContainer>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-heading text-foreground">Recent Transactions</h3>
                <Button onClick={onAdd} variant="ghost" className="text-xs px-2 py-1 h-auto">+ Add</Button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 min-h-[200px]">
                {transactions.length > 0 ? (
                    transactions.map(tx => (
                        <TransactionItem key={tx.id} transaction={tx} onDelete={() => onDelete(tx.id)} />
                    ))
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 h-full">
                        <p className="text-sm text-muted-foreground">No transactions recorded.</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">Click "+ Add" to log an income or expense.</p>
                    </div>
                )}
            </div>
        </BlockContainer>
    );
};

// ===================================
// Spending Breakdown Block (with Donut Chart)
// ===================================

const DonutChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => {
    const size = 120;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    let cumulativePercent = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="var(--muted)" strokeWidth={strokeWidth} />
            {data.map((item, index) => {
                const segmentLength = (item.value / 100) * circumference;
                const offset = (cumulativePercent / 100) * circumference;
                cumulativePercent += item.value;
                
                return (
                     <circle
                        key={index}
                        cx={size/2}
                        cy={size/2}
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${segmentLength} ${circumference}`}
                        strokeDashoffset={-offset}
                        transform={`rotate(-90 ${size/2} ${size/2})`}
                        className="transition-all duration-500"
                    />
                )
            })}
        </svg>
    );
};

export const SpendingBreakdownBlock: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const categoryData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

        if (totalExpense === 0) return [];
        
        const categoryMap = expenses.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        const colors = [
            'var(--chart-1)',
            'var(--chart-2)',
            'var(--chart-3)',
            'var(--chart-4)',
            'var(--chart-5)',
            'var(--chart-6)',
        ];

        return Object.entries(categoryMap)
            .map(([name, value], index) => ({
                name,
                value: (value / totalExpense) * 100,
                amount: value,
                color: colors[index % colors.length]
            }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);
    
    return (
        <BlockContainer>
             <h3 className="text-lg font-heading text-foreground mb-4">Spending Breakdown</h3>
            {categoryData.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-shrink-0">
                        <DonutChart data={categoryData} />
                    </div>
                    <div className="w-full space-y-2 text-sm overflow-hidden">
                        {categoryData.slice(0, 4).map(item => (
                            <div key={item.name} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-muted-foreground truncate">{item.name}</span>
                                 </div>
                                <span className="font-semibold text-foreground">{item.value.toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-4 min-h-[100px]">
                    <p className="text-sm text-muted-foreground">No spending data available.</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Add some expenses to see a breakdown.</p>
                </div>
            )}
        </BlockContainer>
    )
}