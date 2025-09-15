import React, { forwardRef, HTMLAttributes } from 'react';
import { useScrollable } from '../hooks/useScrollable';

interface ScrollableContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Scrollbar variant
   * - 'default': Standard 6px scrollbar, visible on hover
   * - 'thin': Thinner 4px scrollbar
   * - 'auto-hide': Hidden by default, shows on hover
   */
  variant?: 'default' | 'thin' | 'auto-hide';
  
  /**
   * Maximum height utility class
   */
  maxHeight?: 'h-64' | 'h-80' | 'h-96' | 'h-screen' | 'h-1/2' | 'h-2/3' | 'h-3/4';
  
  /**
   * Enable enhanced wheel scrolling
   */
  enhanceWheel?: boolean;
  
  /**
   * Scroll speed multiplier for wheel events
   */
  wheelSpeed?: number;
  
  /**
   * Auto-scroll to bottom when content changes
   */
  autoScrollToBottom?: boolean;
  
  /**
   * Expose scroll utilities via ref
   */
  onScrollUtilsReady?: (utils: {
    scrollToTop: () => void;
    scrollToBottom: () => void;
    scrollTo: (position: number) => void;
    isAtBottom: () => boolean;
    isAtTop: () => boolean;
  }) => void;
}

/**
 * Scrollable container component with custom scrollbar styling
 * Provides a clean, minimal scrollbar that appears on hover
 */
export const ScrollableContainer = forwardRef<HTMLDivElement, ScrollableContainerProps>(
  ({
    variant = 'default',
    maxHeight,
    enhanceWheel = false,
    wheelSpeed = 1,
    autoScrollToBottom = false,
    onScrollUtilsReady,
    className = '',
    children,
    ...props
  }, ref) => {
    const { scrollRef, scrollToTop, scrollToBottom, scrollTo, isAtBottom, isAtTop } = useScrollable({
      enhanceWheel,
      wheelSpeed,
      autoScrollToBottom
    });
    
    // Expose scroll utilities to parent
    React.useEffect(() => {
      if (onScrollUtilsReady) {
        onScrollUtilsReady({
          scrollToTop,
          scrollToBottom,
          scrollTo,
          isAtBottom,
          isAtTop
        });
      }
    }, [onScrollUtilsReady, scrollToTop, scrollToBottom, scrollTo, isAtBottom, isAtTop]);
    
    const getScrollbarClass = () => {
      switch (variant) {
        case 'thin':
          return 'scrollable-thin';
        case 'auto-hide':
          return 'scrollable-auto-hide';
        default:
          return 'scrollable';
      }
    };
    
    const getMaxHeightClass = () => {
      if (!maxHeight) return '';
      return `scroll-${maxHeight}`;
    };
    
    const combinedClassName = [
      getScrollbarClass(),
      getMaxHeightClass(),
      className
    ].filter(Boolean).join(' ');
    
    return (
      <div
        ref={ref || scrollRef}
        className={combinedClassName}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollableContainer.displayName = 'ScrollableContainer';