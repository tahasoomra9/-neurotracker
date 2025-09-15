import React, { useState } from 'react';
import { ScrollableContainer } from '../src/components/ScrollableContainer';
import { useScrollable } from '../src/hooks/useScrollable';

/**
 * Usage Examples for Custom Scrollable Components
 * 
 * This file demonstrates different ways to implement custom scrollbars
 * in your Electron + React application.
 */

// Example 1: Basic scrollable container with default styling
const BasicScrollableExample: React.FC = () => {
  const items = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

  return (
    <div className="premium-glass p-6">
      <h3 className="text-lg font-semibold mb-4">Basic Scrollable Container</h3>
      
      {/* Simple usage with className approach */}
      <div className="scrollable scroll-h-64 bg-card rounded-lg p-4">
        {items.map((item, index) => (
          <div key={index} className="py-2 px-3 mb-2 bg-muted rounded border-l-2 border-brand/30">
            {item} - This is some sample content that demonstrates scrolling behavior.
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 2: Using the ScrollableContainer component with different variants
const ScrollableVariantsExample: React.FC = () => {
  const [scrollUtils, setScrollUtils] = useState<any>(null);
  const longContent = Array.from({ length: 30 }, (_, i) => 
    `This is line ${i + 1} of content that will demonstrate the different scrollbar variants.`
  );

  return (
    <div className="premium-glass p-6">
      <h3 className="text-lg font-semibold mb-4">Scrollable Variants</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Default variant */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Default (6px, hover visible)</h4>
          <ScrollableContainer 
            variant="default" 
            maxHeight="h-64"
            className="bg-card rounded-lg p-4"
          >
            {longContent.map((line, index) => (
              <p key={index} className="mb-2 text-sm">{line}</p>
            ))}
          </ScrollableContainer>
        </div>

        {/* Thin variant */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Thin (4px)</h4>
          <ScrollableContainer 
            variant="thin" 
            maxHeight="h-64"
            className="bg-card rounded-lg p-4"
          >
            {longContent.map((line, index) => (
              <p key={index} className="mb-2 text-sm">{line}</p>
            ))}
          </ScrollableContainer>
        </div>

        {/* Auto-hide variant */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Auto-hide (hidden by default)</h4>
          <ScrollableContainer 
            variant="auto-hide" 
            maxHeight="h-64"
            className="bg-card rounded-lg p-4"
            onScrollUtilsReady={setScrollUtils}
          >
            {longContent.map((line, index) => (
              <p key={index} className="mb-2 text-sm">{line}</p>
            ))}
          </ScrollableContainer>
        </div>
      </div>

      {/* Scroll controls for the auto-hide variant */}
      {scrollUtils && (
        <div className="mt-4 flex gap-2">
          <button 
            onClick={scrollUtils.scrollToTop}
            className="px-3 py-1 text-xs bg-brand text-brand-foreground rounded hover:bg-brand/90"
          >
            Scroll to Top
          </button>
          <button 
            onClick={scrollUtils.scrollToBottom}
            className="px-3 py-1 text-xs bg-brand text-brand-foreground rounded hover:bg-brand/90"
          >
            Scroll to Bottom
          </button>
        </div>
      )}
    </div>
  );
};

// Example 3: Using the useScrollable hook directly
const CustomScrollableExample: React.FC = () => {
  const { scrollRef, scrollToTop, scrollToBottom, isAtBottom, isAtTop } = useScrollable({
    enhanceWheel: true,
    wheelSpeed: 1.5,
    autoScrollToBottom: false
  });

  const [messages, setMessages] = useState([
    'Welcome to the chat!',
    'This demonstrates auto-scroll behavior.',
    'Try adding new messages...'
  ]);

  const addMessage = () => {
    const newMessage = `Message ${messages.length + 1} - ${new Date().toLocaleTimeString()}`;
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="premium-glass p-6">
      <h3 className="text-lg font-semibold mb-4">Custom Hook Usage</h3>
      
      <div className="bg-card rounded-lg p-4">
        {/* Chat-like interface */}
        <div 
          ref={scrollRef}
          className="scrollable h-48 mb-4 p-3 bg-muted/30 rounded border"
        >
          {messages.map((message, index) => (
            <div key={index} className="mb-2 p-2 bg-background rounded text-sm">
              {message}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={addMessage}
            className="px-3 py-1 text-xs bg-brand text-brand-foreground rounded hover:bg-brand/90"
          >
            Add Message
          </button>
          <button 
            onClick={scrollToTop}
            className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
          >
            Top
          </button>
          <button 
            onClick={scrollToBottom}
            className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
          >
            Bottom
          </button>
          <span className="px-3 py-1 text-xs bg-muted rounded">
            {isAtTop() ? 'At Top' : isAtBottom() ? 'At Bottom' : 'Scrolling'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Example 4: Dashboard-style scrollable panels
const DashboardScrollableExample: React.FC = () => {
  const tasks = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Task ${i + 1}`,
    description: `This is the description for task ${i + 1}. It contains some details about what needs to be done.`,
    completed: Math.random() > 0.5
  }));

  const notifications = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    title: `Notification ${i + 1}`,
    message: `This is notification message ${i + 1} with some important information.`,
    time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tasks Panel */}
      <div className="premium-glass p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Tasks</h3>
        <ScrollableContainer 
          variant="default" 
          maxHeight="h-80"
          className="space-y-2"
        >
          {tasks.map(task => (
            <div key={task.id} className="flex items-start gap-3 p-3 bg-card rounded-lg">
              <div className={`w-4 h-4 rounded-full mt-1 ${task.completed ? 'bg-success' : 'bg-muted'}`} />
              <div className="flex-1">
                <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
              </div>
            </div>
          ))}
        </ScrollableContainer>
      </div>

      {/* Notifications Panel */}
      <div className="premium-glass p-6">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <ScrollableContainer 
          variant="thin" 
          maxHeight="h-80"
          className="space-y-2"
        >
          {notifications.map(notification => (
            <div key={notification.id} className="p-3 bg-card rounded-lg border-l-2 border-brand/30">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </div>
              <p className="text-xs text-muted-foreground">{notification.message}</p>
            </div>
          ))}
        </ScrollableContainer>
      </div>
    </div>
  );
};

// Main component that shows all examples
const ScrollableUsageExamples: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-2">Custom Scrollbar Examples</h1>
        <p className="text-muted-foreground mb-8">
          Demonstrations of minimal, lightweight scrolling solutions for Electron + React applications.
        </p>

        <BasicScrollableExample />
        <ScrollableVariantsExample />
        <CustomScrollableExample />
        <DashboardScrollableExample />
      </div>
    </div>
  );
};

export default ScrollableUsageExamples;