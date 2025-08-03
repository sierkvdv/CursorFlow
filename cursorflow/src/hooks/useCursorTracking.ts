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
  const { enabled = true, sensitivity = 1, throttleMs = 16 } = options;
  
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
  
  // Performance optimization: reuse objects to reduce garbage collection
  const positionObjectRef = useRef<CursorPosition>({
    x: 0,
    y: 0,
    velocity: 0,
    direction: 'none'
  });

  // Memoized calculation functions
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

  // Optimized mouse move handler with throttling
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    // Throttle mouse events for better performance
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

    // Update moving state immediately for more responsive feedback
    const shouldBeMoving = velocity > 0.003; // Even lower threshold for smoother response
    if (shouldBeMoving !== isMovingRef.current) {
      isMovingRef.current = shouldBeMoving;
      setIsMoving(shouldBeMoving);
    }

    // Cancel previous RAF to prevent multiple updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame for smoother updates and reuse object
    rafRef.current = requestAnimationFrame(() => {
      // Reuse the same object to reduce garbage collection
      positionObjectRef.current.x = newPosition.x;
      positionObjectRef.current.y = newPosition.y;
      positionObjectRef.current.velocity = velocity;
      positionObjectRef.current.direction = direction;
      
      setCursorPosition({ ...positionObjectRef.current });
    });

    lastPositionRef.current = newPosition;
    lastTimeRef.current = currentTime;
  }, [enabled, calculateVelocity, calculateDirection, throttleMs]);

  const handleMouseLeave = useCallback(() => {
    setIsMoving(false);
    isMovingRef.current = false;
  }, []);

  // Memoized return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    cursorPosition,
    isMoving,
    enabled
  }), [cursorPosition, isMoving, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [enabled, handleMouseMove, handleMouseLeave]);

  return returnValue;
}; 