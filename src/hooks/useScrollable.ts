import { useRef, useEffect, RefObject } from 'react';

interface ScrollableOptions {
  /**
   * Scroll behavior type
   * - 'smooth': CSS smooth scrolling
   * - 'instant': Immediate scrolling
   * - 'auto': Browser default
   */
  behavior?: ScrollBehavior;
  
  /**
   * Enable mouse wheel scrolling enhancement
   */
  enhanceWheel?: boolean;
  
  /**
   * Scroll speed multiplier for wheel events (default: 1)
   */
  wheelSpeed?: number;
  
  /**
   * Auto-scroll to bottom when content changes
   */
  autoScrollToBottom?: boolean;
}

interface ScrollableReturn {
  /**
   * Ref to attach to the scrollable element
   */
  scrollRef: RefObject<HTMLDivElement>;
  
  /**
   * Scroll to top of container
   */
  scrollToTop: () => void;
  
  /**
   * Scroll to bottom of container
   */
  scrollToBottom: () => void;
  
  /**
   * Scroll to specific position
   */
  scrollTo: (position: number) => void;
  
  /**
   * Check if scrolled to bottom
   */
  isAtBottom: () => boolean;
  
  /**
   * Check if scrolled to top
   */
  isAtTop: () => boolean;
}

/**
 * Custom hook for enhanced scrollable behavior
 * Provides smooth scrolling utilities and optional wheel enhancement
 */
export const useScrollable = (options: ScrollableOptions = {}): ScrollableReturn => {
  const {
    behavior = 'smooth',
    enhanceWheel = false,
    wheelSpeed = 1,
    autoScrollToBottom = false
  } = options;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentObserverRef = useRef<MutationObserver | null>(null);
  
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    
    // Enhanced wheel scrolling
    if (enhanceWheel) {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * wheelSpeed;
        element.scrollBy({
          top: delta,
          behavior: behavior
        });
      };
      
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => element.removeEventListener('wheel', handleWheel);
    }
  }, [enhanceWheel, wheelSpeed, behavior]);
  
  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !autoScrollToBottom) return;
    
    // Auto-scroll to bottom when content changes
    const observer = new MutationObserver(() => {
      if (isAtBottom()) {
        scrollToBottom();
      }
    });
    
    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    contentObserverRef.current = observer;
    
    return () => {
      observer.disconnect();
      contentObserverRef.current = null;
    };
  }, [autoScrollToBottom]);
  
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior
    });
  };
  
  const scrollToBottom = () => {
    const element = scrollRef.current;
    if (element) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior
      });
    }
  };
  
  const scrollTo = (position: number) => {
    scrollRef.current?.scrollTo({
      top: position,
      behavior
    });
  };
  
  const isAtBottom = (): boolean => {
    const element = scrollRef.current;
    if (!element) return false;
    
    const threshold = 5; // 5px threshold for "at bottom"
    return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
  };
  
  const isAtTop = (): boolean => {
    const element = scrollRef.current;
    if (!element) return false;
    
    return element.scrollTop <= 5; // 5px threshold for "at top"
  };
  
  return {
    scrollRef,
    scrollToTop,
    scrollToBottom,
    scrollTo,
    isAtBottom,
    isAtTop
  };
};