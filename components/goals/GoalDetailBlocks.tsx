import React from 'react';
import { FinancialGoal } from '../../types';
import SimpleLineChart from '../common/SimpleLineChart';

const Metric: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className={`text-center ${className}`}>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold font-heading text-foreground mt-1">{value}</p>
    </div>
);


export const FinancialGoalDetailBlock: React.FC<{ goal: FinancialGoal | null }> = ({ goal }) => {
    if (!goal) {
        return (
            <div className="premium-glass p-5 min-h-[300px] flex flex-col items-center justify-center text-center">
                 <svg className="h-12 w-12 text-muted-foreground/50 mb-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <h4 className="font-semibold text-foreground">Select a Goal</h4>
                <p className="text-sm text-muted-foreground mt-1">Click on a goal from the list to see its detailed progress and history.</p>
            </div>
        );
    }
    
    const chartData = goal.savingsHistory.map(h => ({ label: `Wk ${h.week}`, value: h.amount }));
    const averageSaving = goal.savingsHistory.length > 0
        ? goal.savingsHistory.reduce((sum, h) => sum + h.amount, 0) / goal.savingsHistory.length
        : 0;

    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const weeksRemaining = averageSaving > 0 ? Math.ceil(remainingAmount / averageSaving) : Infinity;
    const projectedDate = isFinite(weeksRemaining)
        ? new Date(new Date().getTime() + weeksRemaining * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'N/A';


    return (
        <div className="premium-glass p-5">
            <h3 className="text-lg font-heading text-foreground mb-1">Goal Details: <span className="text-brand">{goal.itemName}</span></h3>
            <p className="text-sm text-muted-foreground mb-4">{goal.timelineAnalysis}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border-glass">
                <Metric label="Avg. Weekly Saving" value={`£${averageSaving.toFixed(2)}`} />
                <Metric label="Target Saving" value={`£${goal.weeklySavingsTarget}`} />
                <Metric label="Weeks to Go" value={isFinite(weeksRemaining) ? `${weeksRemaining}` : 'N/A'} />
                <Metric label="Projected Finish" value={projectedDate} />
            </div>

            <div className="mt-4">
                <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-2">Weekly Savings History</h4>
                <SimpleLineChart data={chartData} />
            </div>
        </div>
    );
};
