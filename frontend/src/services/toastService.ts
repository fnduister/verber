type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastEvent {
    message: string;
    type: ToastType;
    duration?: number;
}

class ToastService {
    private listeners: Set<(event: ToastEvent) => void> = new Set();

    subscribe(listener: (event: ToastEvent) => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    show(message: string, type: ToastType = 'info', duration?: number) {
        this.listeners.forEach(listener => {
            listener({ message, type, duration });
        });
    }

    success(message: string, duration?: number) {
        this.show(message, 'success', duration);
    }

    error(message: string, duration?: number) {
        this.show(message, 'error', duration);
    }

    info(message: string, duration?: number) {
        this.show(message, 'info', duration);
    }

    warning(message: string, duration?: number) {
        this.show(message, 'warning', duration);
    }
}

export const toastService = new ToastService();
