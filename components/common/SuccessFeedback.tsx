import React, { useEffect, useState } from 'react';

type ActionType = 'paused' | 'resumed' | 'completed' | 'deleted' | 'created';

interface ActionFeedbackProps {
  message: string;
  action: ActionType;
  show: boolean;
  onHide?: () => void;
  duration?: number;
}

const ActionFeedback: React.FC<ActionFeedbackProps> = ({ 
  message, 
  action,
  show, 
  onHide,
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onHide?.();
        }, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  const getActionIcon = (actionType: ActionType) => {
    switch (actionType) {
      case 'paused':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
          </svg>
        );
      case 'resumed':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 5a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'deleted':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'created':
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
    }
  };

  if (!show && !isVisible) return null;

  const config = { icon: getActionIcon(action) };

  const formatMessage = (msg: string, actionType: ActionType) => {
    const actionWords = {
      paused: 'paused',
      resumed: 'resumed', 
      completed: 'completed',
      deleted: 'deleted',
      created: 'created'
    };

    const actionColors = {
      paused: 'text-warning',
      resumed: 'text-brand',
      completed: 'text-success', 
      deleted: 'text-destructive',
      created: 'text-success'
    };

    const actionWord = actionWords[actionType];
    const actionColor = actionColors[actionType];
    
    // Split message and highlight the action word
    const parts = msg.split(actionWord);
    if (parts.length === 2) {
      return (
        <>
          {parts[0]}
          <span className={actionColor}>{actionWord}</span>
          {parts[1]}
        </>
      );
    }
    return msg;
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`}>
      <div className="premium-glass px-6 py-4 flex items-center gap-4 max-w-md">
        <div className="flex-shrink-0 text-foreground">
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {formatMessage(message, action)}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onHide?.(), 300);
          }}
          className="flex-shrink-0 ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ActionFeedback;