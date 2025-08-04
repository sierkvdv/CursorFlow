import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface CursorPosition {
  x: number;
  y: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'none';
}

interface CursorTrackingOptions {
  enabled?: boolean;
  sensitivity?: number;
  throttleMs?: number;
}

export const useCursorTracking = (options: CursorTrackingOptions = {}) => {
  const { enabled = true, sensitivity = 3, throttleMs = 16 } = options; // 3x higher sensitivity for iPhone
  
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    x: 0,
    y: 0,
    velocity: 0,
    direction: 'none'
  });

  const [isMoving, setIsMoving] = useState(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(performance.now());
  const isMovingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const throttleTimeoutRef = useRef<number | null>(null);
  
  // Reuse objects to reduce garbage collection
  const positionObjectRef = useRef<CursorPosition>({
    x: 0,
    y: 0,
    velocity: 0,
    direction: 'none'
  });

  const calculateVelocity = useCallback((currentX: number, currentY: number, lastX: number, lastY: number, timeDiff: number) => {
    const distance = Math.sqrt(Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2));
    return distance / timeDiff * sensitivity;
  }, [sensitivity]);

  const calculateDirection = useCallback((currentX: number, currentY: number, lastX: number, lastY: number) => {
    const deltaX = currentX - lastX;
    const deltaY = currentY - lastY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // Optimized mouse move handler
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    if (throttleTimeoutRef.current) {
      return;
    }

    throttleTimeoutRef.current = window.setTimeout(() => {
      throttleTimeoutRef.current = null;
    }, throttleMs);

    const currentTime = performance.now();
    const timeDiff = Math.max(1, currentTime - lastTimeRef.current);
    
    const newPosition = {
      x: event.clientX,
      y: event.clientY
    };

    const velocity = calculateVelocity(newPosition.x, newPosition.y, lastPositionRef.current.x, lastPositionRef.current.y, timeDiff);
    const direction = calculateDirection(newPosition.x, newPosition.y, lastPositionRef.current.x, lastPositionRef.current.y);

    // Update moving state - LOWER THRESHOLD FOR IPHONE
    const shouldBeMoving = velocity > 0.001; // 3x lower threshold for iPhone
    if (shouldBeMoving !== isMovingRef.current) {
      isMovingRef.current = shouldBeMoving;
      setIsMoving(shouldBeMoving);
    }

    // Cancel previous RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    rafRef.current = requestAnimationFrame(() => {
      positionObjectRef.current.x = newPosition.x;
      positionObjectRef.current.y = newPosition.y;
      positionObjectRef.current.velocity = velocity;
      positionObjectRef.current.direction = direction;
      
      setCursorPosition({ ...positionObjectRef.current });
    });

    lastPositionRef.current = newPosition;
    lastTimeRef.current = currentTime;
  }, [enabled, throttleMs, calculateVelocity, calculateDirection]);





  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    if (touch) {
      const newPosition = {
        x: touch.clientX,
        y: touch.clientY
      };
      
      lastPositionRef.current = newPosition;
      lastTimeRef.current = performance.now();
      setIsMoving(true);
      isMovingRef.current = true;
    }
  }, [enabled]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled) return;

    if (throttleTimeoutRef.current) {
      return;
    }

    throttleTimeoutRef.current = window.setTimeout(() => {
      throttleTimeoutRef.current = null;
    }, throttleMs);

    const touch = event.touches[0];
    if (!touch) return;

    const currentTime = performance.now();
    const timeDiff = Math.max(1, currentTime - lastTimeRef.current);
    
    const newPosition = {
      x: touch.clientX,
      y: touch.clientY
    };

    const velocity = calculateVelocity(newPosition.x, newPosition.y, lastPositionRef.current.x, lastPositionRef.current.y, timeDiff);
    const direction = calculateDirection(newPosition.x, newPosition.y, lastPositionRef.current.x, lastPositionRef.current.y);

    // Update moving state - LOWER THRESHOLD FOR IPHONE
    const shouldBeMoving = velocity > 0.001; // 3x lower threshold for iPhone
    if (shouldBeMoving !== isMovingRef.current) {
      isMovingRef.current = shouldBeMoving;
      setIsMoving(shouldBeMoving);
    }

    // Cancel previous RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    rafRef.current = requestAnimationFrame(() => {
      positionObjectRef.current.x = newPosition.x;
      positionObjectRef.current.y = newPosition.y;
      positionObjectRef.current.velocity = velocity;
      positionObjectRef.current.direction = direction;
      
      setCursorPosition({ ...positionObjectRef.current });
    });

    lastPositionRef.current = newPosition;
    lastTimeRef.current = currentTime;
  }, [enabled, calculateVelocity, calculateDirection, throttleMs]);

  const handleTouchEnd = useCallback(() => {
    setIsMoving(false);
    isMovingRef.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMoving(false);
    isMovingRef.current = false;
  }, []);

  // Handle custom cursor update events from touch
  const handleCursorUpdate = useCallback((event: CustomEvent) => {
    if (!enabled) return;

    const { x, y, velocity } = event.detail;
    
    const newPosition = { x, y };
    const direction = calculateDirection(x, y, lastPositionRef.current.x, lastPositionRef.current.y);

    // Update moving state - LOWER THRESHOLD FOR IPHONE
    const shouldBeMoving = velocity > 0.001; // 3x lower threshold for iPhone
    if (shouldBeMoving !== isMovingRef.current) {
      isMovingRef.current = shouldBeMoving;
      setIsMoving(shouldBeMoving);
    }

    // Cancel previous RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    rafRef.current = requestAnimationFrame(() => {
      positionObjectRef.current.x = newPosition.x;
      positionObjectRef.current.y = newPosition.y;
      positionObjectRef.current.velocity = velocity;
      positionObjectRef.current.direction = direction;
      
      setCursorPosition({ ...positionObjectRef.current });
    });

    lastPositionRef.current = newPosition;
    lastTimeRef.current = performance.now();
  }, [enabled, calculateDirection]);

  // Memoized return value
  const returnValue = useMemo(() => ({
    cursorPosition,
    isMoving,
    enabled
  }), [cursorPosition, isMoving, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('cursorUpdate', handleCursorUpdate as EventListener);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('cursorUpdate', handleCursorUpdate as EventListener);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [enabled, handleMouseMove, handleMouseLeave, handleTouchStart, handleTouchMove, handleTouchEnd, handleCursorUpdate]);

  return returnValue;
}; 