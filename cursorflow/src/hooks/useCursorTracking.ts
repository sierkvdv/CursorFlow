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
  const { enabled = true, sensitivity = 2, throttleMs = 0 } = options; // No throttling for smooth animation
  
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
    return Math.min(distance / timeDiff * sensitivity, 10); // Cap velocity to prevent extreme values
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

  // Optimized mouse move handler with reduced throttling
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    // No throttling for completely smooth animation
    const currentTime = performance.now();
    const timeDiff = Math.max(1, currentTime - lastTimeRef.current);
    
    // Use viewport coordinates since canvas covers entire screen
    const newPosition = {
      x: event.clientX,
      y: event.clientY
    };

    const velocity = calculateVelocity(newPosition.x, newPosition.y, lastPositionRef.current.x, lastPositionRef.current.y, timeDiff);
    const direction = calculateDirection(newPosition.x, newPosition.y, lastPositionRef.current.x, lastPositionRef.current.y);

    // Lower threshold for smoother movement detection
    const shouldBeMoving = velocity > 0.0005;
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
  }, [enabled, calculateVelocity, calculateDirection]);

  // Improved touch event handlers for iPhone Safari
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled) return;
    
    // Prevent default to avoid scrolling conflicts
    event.preventDefault();
    
    const touch = event.touches[0];
    if (touch) {
          // Use viewport coordinates since canvas covers entire screen
    const newPosition = {
      x: touch.clientX,
      y: touch.clientY
    };
      
      lastPositionRef.current = newPosition;
      lastTimeRef.current = performance.now();
      setIsMoving(true);
      isMovingRef.current = true;
      
      // Immediate position update for touch start
      positionObjectRef.current.x = newPosition.x;
      positionObjectRef.current.y = newPosition.y;
      positionObjectRef.current.velocity = 0;
      positionObjectRef.current.direction = 'none';
      setCursorPosition({ ...positionObjectRef.current });
    }
  }, [enabled]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled) return;

    // Prevent default to avoid scrolling conflicts
    event.preventDefault();

    const touch = event.touches[0];
    if (!touch) return;

    const currentTime = performance.now();
    const timeDiff = Math.max(1, currentTime - lastTimeRef.current);
    
    // Use viewport coordinates since canvas covers entire screen
    const newPosition = {
      x: touch.clientX,
      y: touch.clientY
    };

    // Enhanced velocity calculation for iPhone touch reactivity
    let velocity = calculateVelocity(newPosition.x, newPosition.y, lastPositionRef.current.x, lastPositionRef.current.y, timeDiff);
    velocity = Math.min(velocity * 2.0, 8); // Increased boost for better reactivity
    const direction = calculateDirection(newPosition.x, newPosition.y, lastPositionRef.current.x, lastPositionRef.current.y);

    // Lower threshold for better touch detection
    const shouldBeMoving = velocity > 0.0001;
    if (shouldBeMoving !== isMovingRef.current) {
      isMovingRef.current = shouldBeMoving;
      setIsMoving(shouldBeMoving);
    }

    // Minimal throttling for iPhone touch reactivity
    if (throttleTimeoutRef.current) {
      return; // Skip this update if throttled
    }

    throttleTimeoutRef.current = setTimeout(() => {
      throttleTimeoutRef.current = null;
    }, 8); // ~120fps for better touch reactivity

    // Cancel previous RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Immediate update for touch events
    rafRef.current = requestAnimationFrame(() => {
      positionObjectRef.current.x = newPosition.x;
      positionObjectRef.current.y = newPosition.y;
      positionObjectRef.current.velocity = velocity;
      positionObjectRef.current.direction = direction;
      
      setCursorPosition({ ...positionObjectRef.current });
    });

    lastPositionRef.current = newPosition;
    lastTimeRef.current = currentTime;
  }, [enabled, calculateVelocity, calculateDirection]);

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

    // Very low threshold for iPhone
    const shouldBeMoving = velocity > 0.0001;
    if (shouldBeMoving !== isMovingRef.current) {
      isMovingRef.current = shouldBeMoving;
      setIsMoving(shouldBeMoving);
    }

    // Cancel previous RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Immediate update for custom events
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

    // Add listeners with proper options for iPhone stability
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
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