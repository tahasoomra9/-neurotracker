import React, { useState, useMemo } from 'react';
import { AIInsight } from '../../types';
import InsightCard from './InsightCard';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';

interface InsightsPageProps {
    insights: AIInsight[];
    onFilterChange?: (filter: InsightFilter) => void;
    onClearAllInsights?: () => void;
    onClearInsightsByType?: (type: AIInsight['type']) => void;
}

type InsightFilter = 'all' | AIInsight['type'];

const FilterTab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors capitalize ${
            isActive ? 'bg-brand/20 text-brand' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
    >
        {label}
    </button>
);


const InsightsPage: React.FC<InsightsPageProps> = ({ insights, onFilterChange, onClearAllInsights, onClearInsightsByType }) => {
    const [filter, setFilter] = useState<InsightFilter>('all');
    const [showClearConfirmation, setShowClearConfirmation] = useState(false);

    // Notify parent when filter changes
    React.useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filter);
        }
    }, [filter, onFilterChange]);

    const filteredInsights = useMemo(() => {
        if (filter === 'all') return insights;
        return insights.filter(i => i.type === filter);
    }, [insights, filter]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading text-foreground">AI Coach Insights</h1>
                {insights.length > 0 && onClearAllInsights && (
                    <Button 
                        onClick={() => setShowClearConfirmation(true)}
                        variant="outline"
                        className="text-sm"
                    >
                        Clear All Insights
                    </Button>
                )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-border">
                <FilterTab label="All" isActive={filter === 'all'} onClick={() => setFilter('all')} />
                <FilterTab label="Financial" isActive={filter === 'financial'} onClick={() => setFilter('financial')} />
                <FilterTab label="Personal" isActive={filter === 'personal'} onClick={() => setFilter('personal')} />
                <FilterTab label="Cross-Goal" isActive={filter === 'cross-goal'} onClick={() => setFilter('cross-goal')} />
                <FilterTab label="Motivational" isActive={filter === 'motivational'} onClick={() => setFilter('motivational')} />
            </div>

            {filteredInsights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredInsights.map(insight => (
                        <InsightCard key={insight.id} insight={insight} />
                    ))}
                </div>
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center p-12 bg-card/50 rounded-lg border border-dashed border-border mt-8">
                    <h3 className="text-xl font-heading text-foreground">No Insights Yet</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        Your personalized AI insights will appear here after you complete your first weekly check-in.
                    </p>
                </div>
            )}

            <ConfirmationModal
                isOpen={showClearConfirmation}
                onClose={() => setShowClearConfirmation(false)}
                onConfirm={() => {
                    onClearAllInsights?.();
                    setShowClearConfirmation(false);
                }}
                title="Clear All Insights"
                message="Are you sure you want to clear all AI insights? This action cannot be undone and will remove all your personalized coaching insights."
                confirmText="Clear All"
                cancelText="Keep Insights"
            />
        </div>
    );
};

export default InsightsPage;
