import { useState, useEffect, useCallback } from 'react';

interface CursorPosition {
  x: number;
  y: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'none';
}

interface CursorTrackingOptions {
  enabled?: boolean;
  sensitivity?: number;
}

export const useCursorTracking = (options: CursorTrackingOptions = {}) => {
  const { enabled = true, sensitivity = 1 } = options;
  
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    x: 0,
    y: 0,
    velocity: 0,
    direction: 'none'
  });

  const [isMoving, setIsMoving] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [lastTime, setLastTime] = useState(performance.now());

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

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    const currentTime = performance.now(); // Use performance.now() for more precise timing
    const timeDiff = Math.max(1, currentTime - lastTime); // Prevent division by zero
    
    const newPosition = {
      x: event.clientX,
      y: event.clientY
    };

    const velocity = calculateVelocity(newPosition.x, newPosition.y, lastPosition.x, lastPosition.y, timeDiff);
    const direction = calculateDirection(newPosition.x, newPosition.y, lastPosition.x, lastPosition.y);

    // Update position immediately for smoother tracking
    setCursorPosition({
      x: newPosition.x,
      y: newPosition.y,
      velocity,
      direction
    });

    setIsMoving(velocity > 0.05); // Lower threshold for more responsive movement
    setLastPosition(newPosition);
    setLastTime(currentTime);
  }, [enabled, lastPosition, lastTime, calculateVelocity, calculateDirection]);

  const handleMouseLeave = useCallback(() => {
    setIsMoving(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, handleMouseMove, handleMouseLeave]);

  return {
    cursorPosition,
    isMoving,
    enabled
  };
}; 