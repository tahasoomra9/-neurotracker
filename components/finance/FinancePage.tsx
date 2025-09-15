import React, { useState } from 'react';
import { FinancialGoal, UserProfile, FinancialGoalSetupData, Transaction, NewTransaction } from '../../types';
import { ActiveGoalSummaryBlock, MetricCard, AllFinancialGoalsBlock, RecentTransactionsBlock, SpendingBreakdownBlock } from './FinanceBlocks';
import FinancialGoalSetupModal from '../FinancialGoalSetupModal';
import AddTransactionModal from './AddTransactionModal';
// FIX: Import ConfirmationModal for handling goal deletion confirmation.
import ConfirmationModal from '../common/ConfirmationModal';

interface FinancePageProps {
    userProfile: UserProfile | null;
    financialGoals: FinancialGoal[];
    transactions: Transaction[];
    onSetupFinancialGoal: (data: FinancialGoalSetupData) => Promise<void>;
    onAddTransaction: (transaction: NewTransaction) => void;
    onDeleteTransaction: (id: string) => void;
    // FIX: Add props for toggling goal status and deleting goals to enable actions on financial goals.
    onToggleGoalStatus: (id: string, type: 'financial' | 'personal', newStatus: 'active' | 'paused' | 'completed') => void;
    onDeleteGoal: (id: string, type: 'financial' | 'personal') => void;
}

// FIX: Define ActionType to match what AllFinancialGoalsBlock expects for its onAction prop.
type ActionType = 'pause' | 'resume' | 'complete' | 'delete';

const FinancePage: React.FC<FinancePageProps> = ({ 
    userProfile, 
    financialGoals, 
    transactions,
    onSetupFinancialGoal,
    onAddTransaction,
    onDeleteTransaction,
    // FIX: Destructure the new props.
    onToggleGoalStatus,
    onDeleteGoal
}) => {
    const [isFinancialSetupOpen, setIsFinancialSetupOpen] = useState(false);
    const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
    // FIX: Add state to manage the goal deletion confirmation modal.
    const [goalToDelete, setGoalToDelete] = useState<{ id: string; type: 'financial', name: string } | null>(null);

    // FIX: Implement the handler for actions triggered from AllFinancialGoalsBlock.
    const handleAction = (action: ActionType, goal: FinancialGoal) => {
        switch (action) {
            case 'pause':
                onToggleGoalStatus(goal.id, 'financial', 'paused');
                break;
            case 'resume':
                onToggleGoalStatus(goal.id, 'financial', 'active');
                break;
            case 'complete':
                onToggleGoalStatus(goal.id, 'financial', 'completed');
                break;
            case 'delete':
                setGoalToDelete({ id: goal.id, type: 'financial', name: goal.itemName });
                break;
        }
    };

    // FIX: Implement the confirmation logic for deleting a goal.
    const confirmDelete = () => {
        if (goalToDelete) {
            onDeleteGoal(goalToDelete.id, 'financial');
            setGoalToDelete(null);
        }
    };
    
    const handleFinancialSetupComplete = async (data: FinancialGoalSetupData) => {
        await onSetupFinancialGoal(data);
        setIsFinancialSetupOpen(false);
    }

    const handleAddTransactionComplete = (data: NewTransaction) => {
        onAddTransaction(data);
        setIsAddTransactionOpen(false);
    }

    const totalSaved = financialGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);
    const activeGoal = financialGoals.find(g => g.status === 'active');
    
    let weeklyAverage = 0;
    if (activeGoal && activeGoal.savingsHistory.length > 0) {
        const totalSavedForGoal = activeGoal.savingsHistory.reduce((acc, week) => acc + week.amount, 0);
        weeklyAverage = totalSavedForGoal / activeGoal.savingsHistory.length;
    }
    const savingsRate = activeGoal && activeGoal.weeklySavingsTarget > 0 ? (weeklyAverage / activeGoal.weeklySavingsTarget) * 100 : 0;

    
    return (
        <>
            <div className="space-y-6">
                {/* Top Row: Summary Cards with improved hierarchy */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                       <ActiveGoalSummaryBlock goal={activeGoal} />
                    </div>
                    <MetricCard title="Total Savings" value={`£${totalSaved.toLocaleString()}`} />
                    <MetricCard title="Savings Rate" value={`${savingsRate.toFixed(0)}%`} subtext="vs. weekly target" />
                </div>

                {/* Main Content: Goals and Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <AllFinancialGoalsBlock 
                            goals={financialGoals} 
                            onAddNew={() => setIsFinancialSetupOpen(true)}
                            // FIX: Pass the required onAction prop to AllFinancialGoalsBlock.
                            onAction={handleAction}
                        />
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

            {isFinancialSetupOpen && (
                <FinancialGoalSetupModal
                    onComplete={handleFinancialSetupComplete}
                    onClose={() => setIsFinancialSetupOpen(false)}
                />
            )}

            {isAddTransactionOpen && (
                <AddTransactionModal
                    onComplete={handleAddTransactionComplete}
                    onClose={() => setIsAddTransactionOpen(false)}
                />
            )}
            
            {/* FIX: Add the confirmation modal for deleting goals. */}
            <ConfirmationModal 
                isOpen={!!goalToDelete}
                onClose={() => setGoalToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to permanently delete the goal "${goalToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete Goal"
            />
        </>
    );
};

export default FinancePage;