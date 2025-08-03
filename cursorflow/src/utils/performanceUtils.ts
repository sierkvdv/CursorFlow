// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    // Monitor frame rate
    if ('PerformanceObserver' in window) {
      try {
        const frameObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'measure') {
              this.recordMetric('frameTime', entry.duration);
            }
          });
        });
        frameObserver.observe({ entryTypes: ['measure'] });
        this.observers.set('frame', frameObserver);
      } catch (error) {
        console.warn('Frame rate monitoring not supported:', error);
      }
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 100 values to prevent memory leaks
    if (this.metrics.get(name)!.length > 100) {
      this.metrics.get(name)!.shift();
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((values, name) => {
      result[name] = this.getAverageMetric(name);
    });
    return result;
  }

  startMeasure(name: string) {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  measureFrameRate(callback: () => void) {
    this.startMeasure('frame');
    callback();
    this.endMeasure('frame');
  }

  getMemoryUsage(): Record<string, number> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return {};
  }

  logPerformanceReport() {
    const metrics = this.getMetrics();
    const memory = this.getMemoryUsage();
    
    console.group('🚀 Performance Report');
    console.table(metrics);
    if (Object.keys(memory).length > 0) {
      console.table(memory);
    }
    console.groupEnd();
  }

  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.metrics.clear();
  }
}

// Utility functions for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memory management utilities
export const createObjectPool = <T>(
  createFn: () => T,
  resetFn: (obj: T) => void,
  maxSize: number = 10
) => {
  const pool: T[] = [];

  return {
    get(): T {
      return pool.pop() || createFn();
    },
    release(obj: T) {
      if (pool.length < maxSize) {
        resetFn(obj);
        pool.push(obj);
      }
    },
    clear() {
      pool.length = 0;
    },
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();

  return {
    recordMetric: monitor.recordMetric.bind(monitor),
    startMeasure: monitor.startMeasure.bind(monitor),
    endMeasure: monitor.endMeasure.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    logReport: monitor.logPerformanceReport.bind(monitor),
  };
}; 