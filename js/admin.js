/**
 * Lớp xử lý gọi API (Tách biệt logic mạng)
 */
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

    // API: Lấy danh sách khách hàng tiềm năng
    async getPotentialCustomers() {
        try {
            const response = await fetch(`${this.baseUrl}/manager/potential-customers`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khách hàng tiềm năng:", error);
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

        // Sự kiện làm mới danh sách khách hàng tiềm năng
        const refreshPotentialBtn = document.getElementById('refreshPotentialBtn');
        if (refreshPotentialBtn) {
            refreshPotentialBtn.addEventListener('click', () => {
                this.loadPotentialCustomers();
            });
        }

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

        // Gọi API tương ứng khi chuyển tab
        if (tabId === 'revenue') {
            this.loadRevenueData('week');
        } else if (tabId === 'potential-customers') {
            this.loadPotentialCustomers();
        }
        // else if (tabId === 'room-management') this.loadRooms();
        // else if (tabId === 'booking-list') this.loadBookings();
    }

    // 5. Xử lý logic nghiệp vụ: Doanh Thu
    async loadRevenueData(period) {
        const data = await this.api.getRevenue(period);
        if (!data) return; 

        // Cập nhật các thẻ Stats
        document.getElementById('totalRevenue').innerText = this.formatCurrency(data.totalRevenue || 0);
        document.getElementById('totalBookings').innerText = data.totalBookings || 0;
        document.getElementById('bookedRoomsCount').innerText = data.bookedRoomsCount || 0;
        document.getElementById('avgDailyRevenue').innerText = this.formatCurrency(data.avgDailyRevenue || 0);

        // Xử lý dữ liệu đổ vào biểu đồ
        let labels = [];
        let values = [];

        if (data.chartData && data.chartData.length > 0) {
            labels = data.chartData.map(item => item.date || item.key || '');
            values = data.chartData.map(item => item.revenue || item.value || 0);
        } else {
            labels = ['Chưa có dữ liệu'];
            values = [0];
        }
        
        this.renderChart(labels, values, period);
    }

    // 6. Xử lý logic nghiệp vụ: Khách hàng tiềm năng
    async loadPotentialCustomers() {
        const tableBody = document.getElementById('potentialTableBody');
        if (!tableBody) return;

        // Đã đổi colspan="7" vì bỏ bớt 1 cột đánh giá
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Đang tải dữ liệu... <i class="fas fa-spinner fa-spin"></i></td></tr>';

        const customers = await this.api.getPotentialCustomers();

        if (!customers || customers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Không có dữ liệu khách hàng tiềm năng.</td></tr>';
            return;
        }

        tableBody.innerHTML = ''; // Xóa loading

        customers.forEach(customer => {
            // Giả sử 100,000 VNĐ = 1 điểm tích lũy
            let points = Math.floor((customer.totalSpent || 0) / 100000); 
            
            // Cập nhật logic phân hạng thành viên
            let tier = 'Bronze';
            let tierBg = '#cd7f32'; // Màu Đồng
            let tierColor = '#fff';

            if (points >= 6000) {
                tier = 'Platinum';
                tierBg = '#e5e4e2'; // Màu Bạch Kim
                tierColor = '#333';
            } else if (points >= 2500) {
                tier = 'Gold';
                tierBg = '#ffd700'; // Màu Vàng
                tierColor = '#333';
            } else if (points >= 800) {
                tier = 'Silver';
                tierBg = '#c0c0c0'; // Màu Bạc
                tierColor = '#333';
            }

            // Tạo thẻ tr cho mỗi khách hàng (đã bỏ cột Đánh giá)
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${customer.username || 'Khách vãng lai'}</strong></td>
                <td>${customer.email || 'Chưa cập nhật'}</td>
                <td>${customer.phone || 'Chưa cập nhật'}</td>
                <td style="text-align: center;"><strong>${customer.totalBookings || 0}</strong></td>
                <td style="color: #c53030; font-weight: bold;">${this.formatCurrency(customer.totalSpent || 0)}</td>
                <td><span style="padding: 4px 8px; border-radius: 4px; background: ${tierBg}; font-weight: bold; font-size: 12px; color: ${tierColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${tier}</span></td>
                <td style="text-align: center;">${points}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // 7. Cấu hình Chart.js với Tone Cam Vàng
    renderChart(labels, data, period) {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;

        if (this.revenueChartInstance) {
            this.revenueChartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(255, 140, 0, 0.8)'); 
        gradient.addColorStop(1, 'rgba(212, 160, 23, 0.2)');

        let titleText = 'Biểu đồ doanh thu';
        if(period === 'week') titleText += ' (Tuần này)';
        if(period === 'month') titleText += ' (Tháng này)';
        if(period === 'year') titleText += ' (Năm nay)';

        this.revenueChartInstance = new Chart(ctx, {
            type: 'bar', 
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VND)',
                    data: data,
                    backgroundColor: gradient,
                    borderColor: '#FF8C00',
                    borderWidth: 2,
                    borderRadius: 6,
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