// Analytics Events for MANN MITRA - No Vendor Lock-in
export type AnalyticsEvent = 
  | 'spline_loaded'
  | 'spline_failed'
  | 'hero_cta_click'
  | 'mood_check_completed'
  | 'chat_opened'
  | 'appointment_booked'
  | 'feature_card_clicked'
  | 'signup_started'
  | 'final_cta_click'
  | 'reduced_motion_enabled';

export interface AnalyticsData {
  event: AnalyticsEvent;
  properties?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private queue: AnalyticsData[] = [];
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;
    
    // Initialize after window load to avoid blocking
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.isInitialized = true;
        this.processQueue();
      });
    }
  }

  track(event: AnalyticsEvent, properties?: Record<string, any>) {
    const data: AnalyticsData = {
      event,
      properties,
      timestamp: Date.now()
    };

    if (this.isInitialized) {
      this.sendEvent(data);
    } else {
      this.queue.push(data);
    }
  }

  private processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) this.sendEvent(event);
    }
  }

  private sendEvent(data: AnalyticsData) {
    // Console logging for development
    console.log('[MANN MITRA Analytics]', data);
    
    // Send to your analytics endpoint
    // Replace with your actual analytics service
    if (typeof window !== 'undefined' && window.fetch) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(err => console.warn('Analytics failed:', err));
    }
  }
}

export const analytics = new Analytics();

// Auto-initialize
if (typeof window !== 'undefined') {
  analytics.initialize();
}