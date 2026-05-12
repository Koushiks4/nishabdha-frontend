// Simple toast notification system
type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  show(message: string, options: ToastOptions = {}) {
    const { type = 'info', duration = 4000 } = options;
    const container = this.ensureContainer();

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${type === 'error' ? '#1a1a1a' : type === 'success' ? '#1a1a1a' : '#1a1a1a'};
      color: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : '#ffffff'};
      border: 1px solid ${type === 'error' ? '#ff6b6b33' : type === 'success' ? '#51cf6633' : '#ffffff22'};
      padding: 14px 20px;
      border-radius: 0;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      pointer-events: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
      word-wrap: break-word;
    `;
    toast.textContent = message;

    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    if (!document.getElementById('toast-styles')) {
      style.id = 'toast-styles';
      document.head.appendChild(style);
    }

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show(message, { type: 'success', duration });
  }

  error(message: string, duration?: number) {
    this.show(message, { type: 'error', duration });
  }

  info(message: string, duration?: number) {
    this.show(message, { type: 'info', duration });
  }
}

export const toast = new ToastManager();
