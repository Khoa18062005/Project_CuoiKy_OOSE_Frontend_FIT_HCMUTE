class ApiService {
    constructor() {
        this.baseUrl = "http://localhost:8080/api";
    }

    // Lấy token từ LocalStorage
    getHeaders() {
        const token = localStorage.getItem('jwt_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Xử lý các lỗi chung (401, 403, 500)
    async handleResponse(response) {
        if (response.status === 401 || response.status === 403) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('current_user');
            window.location.href = 'login.html';
            throw new Error("Unauthorized");
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    // API: Lấy dữ liệu doanh thu
    async getRevenue(period = 'week') {
        try {
            const response = await fetch(`${this.baseUrl}/manager/revenue?period=${period}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Lỗi khi tải doanh thu:", error);
            return null;
        }
    }
}

/**
 * Lớp điều khiển giao diện Admin (UI Controller)
 */
class AdminDashboard {
    constructor() {
        this.api = new ApiService();
        this.revenueChartInstance = null; // Lưu trữ instance của Chart.js
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupClock();
        this.setupEventListeners();
        
        // Tải dữ liệu mặc định khi vừa vào trang (Tab Doanh thu - period: week)
        this.loadRevenueData('week');
    }

    // 1. Kiểm tra đăng nhập
    checkAuth() {
        const token = localStorage.getItem('jwt_token');
        const user = localStorage.getItem('current_user');
        
        if (!token) {
            window.location.href = 'login.html';
        }

        // Cập nhật tên Admin trên UI nếu có
        const adminNameEl = document.querySelector('.admin-info strong');
        if (adminNameEl && user) {
            adminNameEl.innerText = user;
        }
    }

    // 2. Cài đặt đồng hồ thời gian thực
    setupClock() {
        const timeEl = document.getElementById('currentDateTime');
        if (!timeEl) return;

        const updateTime = () => {
            const now = new Date();
            timeEl.innerText = now.toLocaleString('vi-VN', { 
                weekday: 'long', year: 'numeric', month: 'long', 
                day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    // 3. Đăng ký các sự kiện (Click, Change)
    setupEventListeners() {
        // Sự kiện chuyển Tab Sidebar
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = item.getAttribute('data-tab');
                this.switchTab(item, tabId);
            });
        });

        // Sự kiện Đăng xuất
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if(confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?")) {
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('current_user');
                    window.location.href = 'login.html';
                }
            });
        }

        // Sự kiện lọc Doanh thu (Tuần, Tháng, Năm)
        const revenueFilters = document.querySelectorAll('.revenue-filter .filter-btn');
        revenueFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Đổi active button
                revenueFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Tải lại dữ liệu
                const period = btn.getAttribute('data-period');
                this.loadRevenueData(period);
            });
        });

        // Các sự kiện cho Modal (Tắt modal khi bấm X)
        const closeBtns = document.querySelectorAll('.close');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            });
        });
    }

    // 4. Hàm chuyển đổi Tabs
    switchTab(activeNavItem, tabId) {
        // Đổi màu Sidebar
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        activeNavItem.classList.add('active');

        // Hiện nội dung Tab tương ứng
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        const targetTab = document.getElementById(`${tabId}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Gọi API tương ứng khi chuyển tab (Mở rộng sau này)
        if (tabId === 'revenue') this.loadRevenueData('week');
        // else if (tabId === 'room-management') this.loadRooms();
        // else if (tabId === 'booking-list') this.loadBookings();
    }

    // 5. Xử lý logic nghiệp vụ: Doanh Thu
    async loadRevenueData(period) {
        const data = await this.api.getRevenue(period);
        if (!data) return; // Nếu lỗi API thì dừng

        // Cập nhật các thẻ Stats
        document.getElementById('totalRevenue').innerText = this.formatCurrency(data.totalRevenue || 0);
        document.getElementById('totalBookings').innerText = data.totalBookings || 0;
        document.getElementById('bookedRoomsCount').innerText = data.bookedRoomsCount || 0;
        document.getElementById('avgDailyRevenue').innerText = this.formatCurrency(data.avgDailyRevenue || 0);

        // --- XỬ LÝ DỮ LIỆU ĐỔ VÀO BIỂU ĐỒ ---
        let labels = [];
        let values = [];

        // Kiểm tra xem mảng chartData từ Backend có dữ liệu không
        if (data.chartData && data.chartData.length > 0) {
            
            // Dùng map() để tách Array Object thành 2 Array riêng biệt
            // Lưu ý: Mình đang giả sử thuộc tính trong file Java của bạn là 'date' và 'revenue'. 
            // Nếu Java của bạn đặt tên khác (ví dụ: 'key', 'value'), hãy đổi lại cho khớp nhé!
            labels = data.chartData.map(item => item.date || item.key || '');
            values = data.chartData.map(item => item.revenue || item.value || 0);
            
        } else {
            // Hiển thị mặc định nếu không có booking nào trong khoảng thời gian này
            labels = ['Chưa có dữ liệu'];
            values = [0];
        }
        
        // Gọi hàm render biểu đồ
        this.renderChart(labels, values, period);
    }

    // 6. Cấu hình Chart.js với Tone Cam Vàng (Orange & Gold)
    renderChart(labels, data, period) {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;

        // Xóa biểu đồ cũ nếu có để vẽ lại biểu đồ mới
        if (this.revenueChartInstance) {
            this.revenueChartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        // Tạo Gradient màu Cam Vàng cực đẹp cho cột
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(255, 140, 0, 0.8)'); // #FF8C00
        gradient.addColorStop(1, 'rgba(212, 160, 23, 0.2)'); // #D4A017

        let titleText = 'Biểu đồ doanh thu';
        if(period === 'week') titleText += ' (Tuần này)';
        if(period === 'month') titleText += ' (Tháng này)';
        if(period === 'year') titleText += ' (Năm nay)';

        this.revenueChartInstance = new Chart(ctx, {
            type: 'bar', // Có thể đổi thành 'line' nếu thích
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VND)',
                    data: data,
                    backgroundColor: gradient,
                    borderColor: '#FF8C00',
                    borderWidth: 2,
                    borderRadius: 6, // Bo góc cột
                    hoverBackgroundColor: '#D4A017'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: titleText,
                        font: { size: 16, family: "'Segoe UI', Roboto, sans-serif" },
                        color: '#4a3f35'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [5, 5], color: '#f1e5d1' },
                        ticks: {
                            callback: (value) => {
                                return value.toLocaleString('vi-VN') + ' ₫';
                            }
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Utility: Hàm định dạng tiền tệ VNĐ
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}

// Khởi chạy ứng dụng khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});