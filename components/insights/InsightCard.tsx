import React from 'react';
import { AIInsight } from '../../types';

const FinancialIcon = () => <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const PersonalIcon = () => <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CrossGoalIcon = () => <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const MotivationalIcon = () => <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;


const INSIGHT_ICONS: Record<AIInsight['type'], React.ReactNode> = {
    financial: <FinancialIcon />,
    personal: <PersonalIcon />,
    'cross-goal': <CrossGoalIcon />,
    motivational: <MotivationalIcon />,
};

const timeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

interface InsightCardProps {
    insight: AIInsight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
    return (
        <div className="premium-glass p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border-glass">
                        {INSIGHT_ICONS[insight.type]}
                    </div>
                    <span className="font-semibold text-sm capitalize text-muted-foreground">{insight.type.replace('-', ' ')}</span>
                </div>
                <span className="text-xs text-muted-foreground/80 flex-shrink-0 ml-2">{timeAgo(insight.date)}</span>
            </div>
            
            <p className="flex-1 text-base leading-relaxed text-foreground/90">
                {insight.text}
            </p>
        </div>
    );
};

export default InsightCard;