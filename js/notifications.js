class Notifications {
    // Tạo container chứa thông báo
    constructor() {
        // Tạo container chứa thông báo nếu chưa có
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        this.container = document.getElementById('toast-container');
    }

    show(message, type = 'success') {
        const toast = document.createElement('div')
        toast.className = 'toast-custom toast-${type}'

        const icon = type === 'success' ? '✅' : '❌';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        // Đưa phần div của toast xuất hiện trên màn hình
        this.container.appendChild(toast);

        // Hiệu ứng hiện ra (trễ 100ms để CSS nhận diện)
        setTimeout(() => toast.classList.add('show'), 100);

        // Tự động biến mất sau 3 giây
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
}
const notify = new Notifications()