import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Function to send metrics to analytics
function sendToAnalytics(metric) {
    // You can replace this with your preferred analytics service
    // Examples: Google Analytics, DataDog, New Relic, etc.
    
    // For now, log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', metric);
    }
    
    // Send to your analytics endpoint
    // fetch('/api/analytics', {
    //     method: 'POST',
    //     body: JSON.stringify(metric),
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    // });
}

// Function to report all web vitals
export function reportWebVitals(onPerfEntry) {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
    }
}

// Initialize web vitals monitoring
export function initializeWebVitals() {
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
}

// Performance observer for monitoring specific metrics
export function observePerformanceMetrics() {
    if ('PerformanceObserver' in window) {
        // Monitor resource loading times
        const resourceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.name.includes('monaco') || entry.name.includes('editor')) {
                    console.log('Monaco Editor Load Time:', entry.loadEnd - entry.loadStart);
                }
            });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Monitor navigation timing
        const navigationObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log('Navigation Timing:', {
                    domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                    loadComplete: entry.loadEventEnd - entry.loadEventStart,
                });
            });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
    }
}