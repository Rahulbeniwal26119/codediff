// Performance monitoring utilities for CodeDiff app

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
        this.init();
    }

    init() {
        if ('PerformanceObserver' in window) {
            this.setupObservers();
        }
        this.monitorBundleSize();
        this.monitorMemoryUsage();
        this.trackLayoutShifts();
    }

    trackLayoutShifts() {
        // Monitor Cumulative Layout Shift specifically
        if ('PerformanceObserver' in window) {
            const clsObserver = new PerformanceObserver((list) => {
                let cls = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                }
                this.metrics.set('cls', cls);
                console.log('CLS Score:', cls);
            });
            
            clsObserver.observe({ type: 'layout-shift', buffered: true });
            this.observers.push(clsObserver);
        }
    }

    setupObservers() {
        // Monitor Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.recordMetric('LCP', entry.startTime);
            });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Monitor First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.recordMetric('FID', entry.processingStart - entry.startTime);
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Monitor resource loading times
        const resourceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.name.includes('monaco') || entry.name.includes('diff')) {
                    this.recordMetric('Monaco_Load_Time', entry.duration);
                }
            });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);

        // Monitor long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.duration > 50) {
                    this.recordMetric('Long_Task', entry.duration);
                    console.warn(`Long task detected: ${entry.duration}ms`);
                }
            });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
    }

    recordMetric(name, value) {
        const timestamp = Date.now();
        
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        
        this.metrics.get(name).push({ value, timestamp });
        
        // Keep only last 100 entries per metric
        if (this.metrics.get(name).length > 100) {
            this.metrics.get(name).shift();
        }

        // Log critical metrics
        if (name === 'LCP' && value > 2500) {
            console.warn(`Poor LCP detected: ${value}ms`);
        }
        if (name === 'FID' && value > 100) {
            console.warn(`Poor FID detected: ${value}ms`);
        }
    }

    monitorBundleSize() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const resources = performance.getEntriesByType('resource');
            let totalSize = 0;
            
            resources.forEach((resource) => {
                if (resource.transferSize) {
                    totalSize += resource.transferSize;
                }
            });
            
            this.recordMetric('Bundle_Size', totalSize);
            console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
        }
    }

    monitorMemoryUsage() {
        if ('memory' in performance) {
            const memoryInfo = performance.memory;
            this.recordMetric('Memory_Used', memoryInfo.usedJSHeapSize);
            this.recordMetric('Memory_Total', memoryInfo.totalJSHeapSize);
            this.recordMetric('Memory_Limit', memoryInfo.jsHeapSizeLimit);
        }

        // Monitor memory usage every 30 seconds
        setInterval(() => {
            if ('memory' in performance) {
                const memoryInfo = performance.memory;
                const usedMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
                
                if (usedMB > 100) {
                    console.warn(`High memory usage: ${usedMB.toFixed(2)} MB`);
                }
                
                this.recordMetric('Memory_Used', memoryInfo.usedJSHeapSize);
            }
        }, 30000);
    }

    measureComponentRender(componentName, renderFunction) {
        const startTime = performance.now();
        const result = renderFunction();
        const endTime = performance.now();
        
        this.recordMetric(`${componentName}_Render`, endTime - startTime);
        return result;
    }

    measureAsyncOperation(operationName, asyncFunction) {
        const startTime = performance.now();
        
        return asyncFunction().finally(() => {
            const endTime = performance.now();
            this.recordMetric(`${operationName}_Duration`, endTime - startTime);
        });
    }

    getMetrics() {
        const result = {};
        this.metrics.forEach((values, name) => {
            const latestValues = values.slice(-10); // Last 10 values
            const average = latestValues.reduce((sum, item) => sum + item.value, 0) / latestValues.length;
            
            result[name] = {
                latest: values[values.length - 1]?.value || 0,
                average: Math.round(average * 100) / 100,
                count: values.length
            };
        });
        
        return result;
    }

    exportMetrics() {
        const metrics = this.getMetrics();
        const timestamp = new Date().toISOString();
        
        const report = {
            timestamp,
            url: window.location.href,
            userAgent: navigator.userAgent,
            metrics
        };
        
        console.log('Performance Report:', report);
        
        // You can send this to your analytics service
        // fetch('/api/performance-metrics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(report)
        // });
        
        return report;
    }

    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.metrics.clear();
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Utility functions for components
export const measureRender = (componentName, renderFn) => 
    performanceMonitor.measureComponentRender(componentName, renderFn);

export const measureAsync = (operationName, asyncFn) => 
    performanceMonitor.measureAsyncOperation(operationName, asyncFn);

export const getPerformanceMetrics = () => 
    performanceMonitor.getMetrics();

export const exportPerformanceReport = () => 
    performanceMonitor.exportMetrics();

export default performanceMonitor;