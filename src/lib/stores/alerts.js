import { writable } from 'svelte/store';

function createAlertStore() {
    const { subscribe, set, update } = writable([]);

    let alertId = 0;

    return {
        subscribe,
        
        // Show a success alert
        success: (message, options = {}) => {
            const alert = {
                id: ++alertId,
                type: 'success',
                message,
                duration: options.duration !== undefined ? options.duration : 5000,
                dismissible: options.dismissible !== false,
                timestamp: Date.now()
            };
            
            update(alerts => [...alerts, alert]);
            
            // Auto-remove after duration (only if duration > 0)
            if (alert.duration > 0) {
                setTimeout(() => {
                    update(alerts => alerts.filter(a => a.id !== alert.id));
                }, alert.duration);
            }
            
            return alert.id;
        },
        
        // Show an error alert
        error: (message, options = {}) => {
            const alert = {
                id: ++alertId,
                type: 'error',
                message,
                duration: options.duration !== undefined ? options.duration : 7000, // Error alerts stay longer
                dismissible: options.dismissible !== false,
                timestamp: Date.now()
            };
            
            update(alerts => [...alerts, alert]);
            
            if (alert.duration > 0) {
                setTimeout(() => {
                    update(alerts => alerts.filter(a => a.id !== alert.id));
                }, alert.duration);
            }
            
            return alert.id;
        },
        
        // Show a warning alert
        warning: (message, options = {}) => {
            const alert = {
                id: ++alertId,
                type: 'warning',
                message,
                duration: options.duration !== undefined ? options.duration : 6000,
                dismissible: options.dismissible !== false,
                timestamp: Date.now()
            };
            
            update(alerts => [...alerts, alert]);
            
            if (alert.duration > 0) {
                setTimeout(() => {
                    update(alerts => alerts.filter(a => a.id !== alert.id));
                }, alert.duration);
            }
            
            return alert.id;
        },
        
        // Show an info alert
        info: (message, options = {}) => {
            const alert = {
                id: ++alertId,
                type: 'info',
                message,
                duration: options.duration !== undefined ? options.duration : 5000,
                dismissible: options.dismissible !== false,
                timestamp: Date.now()
            };
            
            update(alerts => [...alerts, alert]);
            
            if (alert.duration > 0) {
                setTimeout(() => {
                    update(alerts => alerts.filter(a => a.id !== alert.id));
                }, alert.duration);
            }
            
            return alert.id;
        },
        
        // Dismiss a specific alert
        dismiss: (alertId) => {
            update(alerts => alerts.filter(a => a.id !== alertId));
        },
        
        // Clear all alerts
        clear: () => {
            set([]);
        },
        
        // Convenience method to replace standard alert()
        alert: (message, type = 'info') => {
            switch (type) {
                case 'success':
                    return alertStore.success(message);
                case 'error':
                    return alertStore.error(message);
                case 'warning':
                    return alertStore.warning(message);
                default:
                    return alertStore.info(message);
            }
        }
    };
}

export const alertStore = createAlertStore();

// Helper function to show confirmation dialog
export function showConfirmation(message, onConfirm, onCancel = null) {
    return new Promise((resolve) => {
        const confirmed = confirm(message);
        if (confirmed) {
            if (onConfirm) onConfirm();
            resolve(true);
        } else {
            if (onCancel) onCancel();
            resolve(false);
        }
    });
}

// Eventually we can replace this with a custom modal
export { showConfirmation as confirmDialog };