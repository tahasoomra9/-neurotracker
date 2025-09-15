import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../../types';
import NotificationPopover from './NotificationPopover';

const useOutsideClick = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
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

interface HeaderProps {
    username: string;
    onToggleSidebar: () => void;
    onUpdateUsername: (newName: string) => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClearRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    username, 
    onToggleSidebar, 
    onUpdateUsername, 
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearRead
}) => {
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(username);
    const inputRef = useRef<HTMLInputElement>(null);

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);
    useOutsideClick(notificationsRef, () => setIsNotificationsOpen(false));
    
    const [isMaximized, setIsMaximized] = useState(false);
    
    const unreadCount = notifications.filter(n => !n.read).length;

    // Window control handlers
    const handleMinimize = () => {
        console.log('Minimize clicked, electronAPI available:', !!window.electronAPI);
        if (window.electronAPI) {
            window.electronAPI.minimizeWindow().catch(console.error);
        }
    };

    const handleMaximize = async () => {
        console.log('Maximize clicked, electronAPI available:', !!window.electronAPI);
        if (window.electronAPI) {
            try {
                await window.electronAPI.maximizeWindow();
                const maximized = await window.electronAPI.isMaximized();
                setIsMaximized(maximized);
            } catch (error) {
                console.error('Maximize error:', error);
            }
        }
    };

    const handleClose = () => {
        console.log('Close clicked, electronAPI available:', !!window.electronAPI);
        if (window.electronAPI) {
            window.electronAPI.closeWindow().catch(console.error);
        }
    };

    useEffect(() => {
        // Check if window is maximized on mount
        console.log("Header mounted, checking electronAPI...");
        console.log("window.electronAPI:", window.electronAPI);
        console.log("Available window properties:", Object.keys(window));
        
        if (window.electronAPI) {
            window.electronAPI.isMaximized().then(setIsMaximized);
        } else {
            // Try again after a short delay in case preload is still loading
            setTimeout(() => {
                console.log("Retry - window.electronAPI:", window.electronAPI);
                if (window.electronAPI) {
                    window.electronAPI.isMaximized().then(setIsMaximized);
                }
            }, 100);
        }
    }, []);

    useEffect(() => {
        setName(username);
    }, [username]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleNameUpdate = () => {
        setIsEditing(false);
        if (name.trim() && name.trim() !== username) {
            onUpdateUsername(name.trim());
        } else {
            setName(username); // Revert if empty or unchanged
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNameUpdate();
        } else if (e.key === 'Escape') {
            setName(username);
            setIsEditing(false);
        }
    };

    return (
        <header className="premium-header flex justify-between items-center px-4 sm:px-6 h-[80px] sticky top-0 z-20" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
            <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                 <button onClick={onToggleSidebar} className="lg:hidden text-muted-foreground hover:text-foreground">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                 </button>
                 {isEditing ? (
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-heading text-foreground whitespace-nowrap">Good afternoon,</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleNameUpdate}
                            onKeyDown={handleKeyDown}
                            className="text-xl sm:text-2xl font-heading text-foreground bg-transparent border-b-2 border-brand focus:outline-none w-full"
                            aria-label="Edit user name"
                        />
                    </div>
                 ) : (
                    <div 
                        className="group flex items-center gap-2 cursor-pointer"
                        onClick={() => setIsEditing(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditing(true); }}
                        aria-label={`Current user: ${username}. Click to edit.`}
                    >
                        <h1 className="text-xl sm:text-2xl font-heading text-foreground">
                            Good afternoon, {username}
                        </h1>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                            </svg>
                        </div>
                    </div>
                 )}
            </div>
            <div className="flex items-center gap-4 sm:gap-6" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                <span className="hidden sm:block text-sm text-muted-foreground">{dateString}</span>
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(prev => !prev)}
                        className="relative text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={`View notifications. ${unreadCount} unread.`}
                        aria-haspopup="true"
                        aria-expanded={isNotificationsOpen}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a2 2 0 00-4 0v.083A6 6 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2 w-4 h-4 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {isNotificationsOpen && (
                        <NotificationPopover
                            notifications={notifications}
                            onMarkAsRead={onMarkAsRead}
                            onMarkAllAsRead={onMarkAllAsRead}
                            onClearRead={onClearRead}
                        />
                    )}
                </div>
                
                {/* Window Controls */}
                <div className="flex items-center">
                    <button
                        onClick={handleMinimize}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                        title="Minimize"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <button
                        onClick={handleMaximize}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                        title={isMaximized ? "Restore" : "Maximize"}
                    >
                        {isMaximized ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 3h6v6H3V3z M1 5v4a2 2 0 002 2h4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            </svg>
                        ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <rect x="2" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-destructive/20 hover:text-destructive rounded transition-colors"
                        title="Close"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;