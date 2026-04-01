class Notifications {
    constructor() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        this.container = document.getElementById('toast-container');
    }

    show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-custom toast-${type}`;

        const icon = type === 'success' ? '✅' : '❌';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        this.container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2800);
    }
}

const notify = new Notifications();