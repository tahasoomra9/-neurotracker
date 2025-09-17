import React from 'react';
import { Notification } from '../../types';
import Button from '../common/Button';

const InsightIcon = () => <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const MilestoneIcon = () => <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const WarningIcon = () => <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const NOTIFICATION_ICONS: Record<Notification['type'], React.ReactNode> = {
    insight: <InsightIcon />,
    milestone: <MilestoneIcon />,
    warning: <WarningIcon />,
};

const timeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
};

const NotificationItem: React.FC<{ notification: Notification; onMarkAsRead: (id: string) => void; }> = ({ notification, onMarkAsRead }) => {
    return (
        <div 
            className={`flex items-start p-3 gap-3 transition-colors duration-200 cursor-pointer ${!notification.read ? 'bg-accent/60 hover:bg-accent' : 'hover:bg-accent/40'}`}
            onClick={() => onMarkAsRead(notification.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onMarkAsRead(notification.id)}}
        >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center mt-1 border border-border`}>
                {NOTIFICATION_ICONS[notification.type]}
            </div>
            <div className="flex-1">
                <p className={`font-semibold text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                <p className="text-muted-foreground text-sm line-clamp-3">{notification.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{timeAgo(notification.date)}</p>
            </div>
        </div>
    );
};

interface NotificationPopoverProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClearRead: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClearRead }) => {
    const hasReadNotifications = notifications.some(n => n.read);
    
    return (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-popover rounded-lg border border-border shadow-lg z-50 animate-modal-in overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-border flex-shrink-0">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <Button variant="ghost" className="text-xs px-2 py-1 h-auto" onClick={onMarkAllAsRead}>Mark all as read</Button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    [...notifications]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(n => <NotificationItem key={n.id} notification={n} onMarkAsRead={onMarkAsRead} />)
                ) : (
                    <p className="p-8 text-center text-sm text-muted-foreground">You're all caught up!</p>
                )}
            </div>
            {hasReadNotifications && (
                <div className="p-2 border-t border-border text-center flex-shrink-0">
                     <Button variant="ghost" className="text-xs w-full" onClick={onClearRead}>Clear Read Notifications</Button>
                </div>
            )}
        </div>
    );
};

export default NotificationPopover;
