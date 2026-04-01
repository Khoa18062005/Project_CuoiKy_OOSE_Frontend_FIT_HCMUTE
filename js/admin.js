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

    // API: Lấy danh sách Booking (Có Lọc & Tìm kiếm)
    async getBookings(status = 'all', keyword = '') {
        try {
            // Encode keyword để tránh lỗi URL khi gõ dấu cách hoặc ký tự đặc biệt
            let url = `${this.baseUrl}/manager/bookings?status=${status}`;
            if (keyword) {
                url += `&keyword=${encodeURIComponent(keyword)}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Lỗi khi tải danh sách booking:", error);
            return [];
        }
    }

    // API: Lấy danh sách tất cả phòng (CÓ HỖ TRỢ LỌC THEO NGÀY)
    async getAllRooms(dateString = '') {
        try {
            let url = `${this.baseUrl}/rooms`;
            if (dateString) {
                url += `?date=${dateString}`;
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Lỗi khi tải danh sách phòng:", error);
            return [];
        }
    }

    // API: Cập nhật thông tin phòng
    async updateRoom(roomId, roomData) {
        try {
            const response = await fetch(`${this.baseUrl}/rooms/${roomId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(roomData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Lỗi khi cập nhật phòng:", error);
            throw error;
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
        this.roomsData = []; // Lưu trữ dữ liệu phòng tại local
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupClock();
        this.setupEventListeners();

        // Tải dữ liệu mặc định khi vừa vào trang (Tab Doanh thu - period: week)
        this.loadRevenueData('week');

        // Set ngày mặc định cho bộ lọc phòng là hôm nay
        const roomViewDate = document.getElementById('roomViewDate');
        if (roomViewDate) {
            const today = new Date();
            const offset = today.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(today - offset)).toISOString().slice(0, -1);
            roomViewDate.value = localISOTime.split('T')[0];
        }
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
                if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?")) {
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
                revenueFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

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

        // Sự kiện lọc Booking
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.loadBookings();
            });
        }

        const searchBooking = document.getElementById('searchBooking');
        if (searchBooking) {
            // Dùng setTimeout (Debounce) để người dùng gõ xong mới gọi API
            let timeout = null;
            searchBooking.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.loadBookings();
                }, 500);
            });
        }

        // SỰ KIỆN MỚI: Bắt sự kiện đổi ngày xem phòng
        const roomViewDate = document.getElementById('roomViewDate');
        if (roomViewDate) {
            roomViewDate.addEventListener('change', (e) => {
                this.loadRooms(e.target.value);
            });
        }

        // Sự kiện Submit Form cập nhật phòng
        const roomForm = document.getElementById('roomForm');
        if (roomForm) {
            roomForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRoomUpdate();
            });
        }

        // Các sự kiện cho Modal (Tắt modal khi bấm X)
        const closeBtns = document.querySelectorAll('.close');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            });
        });

        // Tắt modal khi click ra ngoài vùng modal
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // 4. Hàm chuyển đổi Tabs
    switchTab(activeNavItem, tabId) {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        activeNavItem.classList.add('active');

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
        } else if (tabId === 'booking-list') {
            this.loadBookings();
        } else if (tabId === 'room-management') {
            // Lấy ngày hiện tại trên input để tải
            const dateStr = document.getElementById('roomViewDate')?.value || '';
            this.loadRooms(dateStr);
        }
    }

    // 5. Xử lý logic nghiệp vụ: Doanh Thu
    async loadRevenueData(period) {
        const data = await this.api.getRevenue(period);
        if (!data) return;

        document.getElementById('totalRevenue').innerText = this.formatCurrency(data.totalRevenue || 0);
        document.getElementById('totalBookings').innerText = data.totalBookings || 0;
        document.getElementById('bookedRoomsCount').innerText = data.bookedRoomsCount || 0;
        document.getElementById('avgDailyRevenue').innerText = this.formatCurrency(data.avgDailyRevenue || 0);

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

        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Đang tải dữ liệu... <i class="fas fa-spinner fa-spin"></i></td></tr>';

        const customers = await this.api.getPotentialCustomers();

        if (!customers || customers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Không có dữ liệu khách hàng tiềm năng.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';

        customers.forEach(customer => {
            let points = Math.floor((customer.totalSpent || 0) / 100000);

            let tier = 'Bronze';
            let tierBg = '#cd7f32';
            let tierColor = '#fff';

            if (points >= 6000) {
                tier = 'Platinum';
                tierBg = '#e5e4e2';
                tierColor = '#333';
            } else if (points >= 2500) {
                tier = 'Gold';
                tierBg = '#ffd700';
                tierColor = '#333';
            } else if (points >= 800) {
                tier = 'Silver';
                tierBg = '#c0c0c0';
                tierColor = '#333';
            }

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

    // 7. Xử lý logic nghiệp vụ: Danh sách Booking
    async loadBookings() {
        const tableBody = document.getElementById('bookingTableBody');
        if (!tableBody) return;

        // Bật loading
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">Đang tải dữ liệu... <i class="fas fa-spinner fa-spin"></i></td></tr>';

        const status = document.getElementById('statusFilter').value;
        const keyword = document.getElementById('searchBooking').value;

        // Lấy dữ liệu từ API
        const bookings = await this.api.getBookings(status, keyword);

        if (!bookings || bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">Không tìm thấy kết quả nào phù hợp.</td></tr>';
            return;
        }

        tableBody.innerHTML = ''; // Xóa loading

        bookings.forEach(booking => {
            const tr = document.createElement('tr');

            let roomDisplay = "N/A";
            let checkinDisplay = "N/A";
            let checkoutDisplay = "N/A";

            if (booking.details && booking.details.length > 0) {
                // Lấy tất cả các tên phòng và nối chúng lại bằng dấu phẩy
                roomDisplay = booking.details.map(d => d.roomNumber).join(', ');

                // Lấy thông tin ngày tháng của phòng đầu tiên làm đại diện cho cả booking
                const firstDetail = booking.details[0];
                checkinDisplay = this.formatDate(firstDetail.checkinDate);
                checkoutDisplay = this.formatDate(firstDetail.checkoutDate);
            }

            // Xử lý huy hiệu trạng thái (Badge)
            let statusBadge = '';
            switch (booking.status?.toLowerCase()) {
                case 'confirmed':
                    statusBadge = '<span style="color: #155724; background: #d4edda; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Đã xác nhận</span>';
                    break;
                case 'pending':
                    statusBadge = '<span style="color: #856404; background: #fff3cd; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Chờ xử lý</span>';
                    break;
                case 'cancelled':
                    statusBadge = '<span style="color: #721c24; background: #f8d7da; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Đã hủy</span>';
                    break;
                default:
                    statusBadge = `<span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e2e3e5;">${booking.status || 'N/A'}</span>`;
            }

            tr.innerHTML = `
                <td><strong>#${booking.bookingID}</strong></td>
                <td>${booking.username || 'N/A'}</td>
                <td>${booking.phone || 'N/A'}</td>
                <td>${booking.email || 'N/A'}</td>
                <td style="max-width: 150px; line-height: 1.4;"><strong>${roomDisplay}</strong></td>
                <td>${checkinDisplay}</td>
                <td>${checkoutDisplay}</td>
                <td style="color: #c53030; font-weight: bold;">${this.formatCurrency(booking.totalPrice || 0)}</td>
                <td>${statusBadge}</td>
                <td style="text-align: center;">
                    <button class="btn-small btn-view-detail" style="background: #e9ecef; color: #333; border: 1px solid #ced4da; padding: 6px 10px; border-radius: 4px; cursor: pointer; transition: 0.2s;"><i class="fas fa-eye"></i></button>
                </td>
            `;

            // Bắt sự kiện click vào nút xem chi tiết
            const viewBtn = tr.querySelector('.btn-view-detail');
            viewBtn.addEventListener('click', () => this.showBookingDetailModal(booking, statusBadge));

            // Thêm hiệu ứng hover cho nút
            viewBtn.addEventListener('mouseover', () => viewBtn.style.background = '#d3d9df');
            viewBtn.addEventListener('mouseout', () => viewBtn.style.background = '#e9ecef');

            tableBody.appendChild(tr);
        });
    }

    // 8. Hàm mở Modal Chi Tiết Booking
    showBookingDetailModal(booking, statusBadgeHtml) {
        const modal = document.getElementById('bookingDetailModal');
        const content = document.getElementById('bookingDetailContent');
        if (!modal || !content) return;

        // Render danh sách các phòng trong booking này
        let detailsHtml = '';
        if (booking.details && booking.details.length > 0) {
            detailsHtml = booking.details.map((d, index) => `
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef; margin-bottom: 10px;">
                    <h5 style="margin-top:0; margin-bottom: 8px; color: #495057;">Phòng ${index + 1}: <strong style="color:#c53030;">${d.roomNumber}</strong> - ${d.roomTypeName}</h5>
                    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
                        <span><i class="fas fa-calendar-alt" style="color:#6c757d;"></i> Từ: <strong>${this.formatDate(d.checkinDate)}</strong></span>
                        <span>Đến: <strong>${this.formatDate(d.checkoutDate)}</strong></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 14px;">
                        <span>Thành tiền: <strong style="color: #c53030;">${this.formatCurrency(d.subTotal || 0)}</strong></span>
                    </div>
                </div>
            `).join('');
        } else {
            detailsHtml = '<p style="color: #dc3545;">Không có dữ liệu chi tiết phòng.</p>';
        }

        // Đổ toàn bộ dữ liệu vào body của Modal
        content.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                    <h4 style="margin-top: 0; color: #343a40; border-bottom: 1px solid #dee2e6; padding-bottom: 8px;"><i class="fas fa-user"></i> Thông tin khách</h4>
                    <p style="margin: 8px 0;"><strong>Họ tên:</strong> ${booking.username || 'N/A'}</p>
                    <p style="margin: 8px 0;"><strong>SĐT:</strong> ${booking.phone || 'N/A'}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${booking.email || 'N/A'}</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                    <h4 style="margin-top: 0; color: #343a40; border-bottom: 1px solid #dee2e6; padding-bottom: 8px;"><i class="fas fa-file-invoice"></i> Đơn đặt #${booking.bookingID}</h4>
                    <p style="margin: 8px 0;"><strong>Ngày đặt:</strong> ${this.formatDate(booking.bookingDate)}</p>
                    <p style="margin: 8px 0;"><strong>Trạng thái:</strong> ${statusBadgeHtml}</p>
                    <p style="margin: 8px 0; font-size: 1.1em;"><strong>Tổng thanh toán:</strong> <span style="color: #c53030; font-weight: bold;">${this.formatCurrency(booking.totalPrice || 0)}</span></p>
                </div>
            </div>
            <h4 style="color: #343a40; margin-bottom: 10px;"><i class="fas fa-bed"></i> Danh sách phòng đã chọn</h4>
            <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                ${detailsHtml}
            </div>
        `;

        modal.style.display = 'flex';
    }

    // 9. Xử lý logic nghiệp vụ: Quản lý Phòng
    async loadRooms(dateString = '') {
        const roomsGrid = document.getElementById('roomsGrid');
        if (!roomsGrid) return;

        roomsGrid.innerHTML = '<div style="text-align:center; width: 100%; padding: 20px;">Đang tải dữ liệu phòng... <i class="fas fa-spinner fa-spin"></i></div>';

        const rooms = await this.api.getAllRooms(dateString);
        this.roomsData = rooms;

        if (!rooms || rooms.length === 0) {
            roomsGrid.innerHTML = '<div style="text-align:center; width: 100%; padding: 20px;">Không có dữ liệu phòng.</div>';
            return;
        }

        this.renderRoomsList(rooms);
    }

    renderRoomsList(rooms) {
        const roomsGrid = document.getElementById('roomsGrid');
        let total = rooms.length;
        let available = 0;
        let booked = 0;
        let maintenance = 0;

        roomsGrid.innerHTML = '';

        rooms.forEach(room => {
            const status = room.status?.toLowerCase() || 'available';

            // Đếm thống kê
            if (status === 'available') available++;
            else if (status === 'booked') booked++;
            else if (status === 'maintenance') maintenance++;

            // Set màu sắc và icon 
            let statusText = '';
            let statusIcon = '';
            let statusBgColor = '';
            let statusTextColor = '';

            switch (status) {
                case 'available':
                    statusText = 'Còn trống';
                    statusIcon = 'fa-check-circle';
                    statusBgColor = '#d4edda';
                    statusTextColor = '#155724';
                    break;
                case 'booked':
                    statusText = 'Đã đặt';
                    statusIcon = 'fa-lock';
                    statusBgColor = '#f8d7da';
                    statusTextColor = '#721c24';
                    break;
                case 'maintenance':
                    statusText = 'Bảo trì';
                    statusIcon = 'fa-tools';
                    statusBgColor = '#fff3cd';
                    statusTextColor = '#856404';
                    break;
                case 'inactive':
                    statusText = 'Ngừng kinh doanh';
                    statusIcon = 'fa-ban';
                    statusBgColor = '#e2e3e5';
                    statusTextColor = '#383d41';
                    break;
                default:
                    statusText = status;
                    statusBgColor = '#e2e3e5';
                    statusTextColor = '#383d41';
            }

            const roomCard = document.createElement('div');
            roomCard.style.border = '1px solid #e0e0e0';
            roomCard.style.borderRadius = '8px';
            roomCard.style.padding = '15px';
            roomCard.style.backgroundColor = '#fff';
            roomCard.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
            roomCard.style.cursor = 'pointer';
            roomCard.style.transition = '0.3s';

            const badgeStyle = `background-color: ${statusBgColor}; color: ${statusTextColor}; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;`;

            roomCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #2c3e50;">P. ${room.roomNumber}</h3>
                    <span style="${badgeStyle}"><i class="fas ${statusIcon}"></i> ${statusText}</span>
                </div>
                <div style="font-size: 14px; color: #555;">
                    <p style="margin: 5px 0;"><strong>Loại:</strong> <span style="font-weight: 600;">${room.typeName}</span></p>
                    <p style="margin: 5px 0;"><strong>Giá:</strong> <span style="color: #c53030; font-weight:bold;">${this.formatCurrency(room.priceRoom)}</span></p>
                    <p style="margin: 5px 0;"><strong>Sức chứa:</strong> <i class="fas fa-user"></i> ${room.occupancy}</p>
                </div>
            `;

            roomCard.addEventListener('mouseover', () => roomCard.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)');
            roomCard.addEventListener('mouseout', () => roomCard.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)');
            roomCard.addEventListener('click', () => this.showRoomModal(room));

            roomsGrid.appendChild(roomCard);
        });

        // Cập nhật thống kê header của tab
        document.getElementById('totalRooms').innerText = total;
        document.getElementById('availableRooms').innerText = available;
        document.getElementById('bookedRoomsStat').innerText = booked;
        document.getElementById('maintenanceRooms').innerText = maintenance;

        roomsGrid.style.display = 'grid';
        roomsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(240px, 1fr))';
        roomsGrid.style.gap = '20px';
    }

    showRoomModal(room) {
        const modal = document.getElementById('roomModal');
        if (!modal) return;

        document.getElementById('roomId').value = room.roomID;
        document.getElementById('roomName').value = room.roomNumber;
        document.getElementById('roomName').disabled = true;

        // Select Loại phòng
        const typeSelect = document.getElementById('roomType');
        for (let i = 0; i < typeSelect.options.length; i++) {
            if (typeSelect.options[i].text.trim() === room.typeName?.trim()) {
                typeSelect.selectedIndex = i;
                break;
            }
        }

        document.getElementById('roomPrice').value = room.priceRoom;
        document.getElementById('roomPrice').disabled = true;
        document.getElementById('roomCapacity').value = room.occupancy;
        document.getElementById('roomCapacity').disabled = true;

        // Nếu phòng hiện tại đang được Booked trên UI, trong Modal chỉ hiển thị nó ở trạng thái vật lý là Available
        let physicalStatus = room.status?.toLowerCase() || 'available';
        if (physicalStatus === 'booked') {
            physicalStatus = 'available';
        }
        document.getElementById('roomStatus').value = physicalStatus;

        modal.style.display = 'flex';
    }

    async submitRoomUpdate() {
        const roomId = document.getElementById('roomId').value;
        const status = document.getElementById('roomStatus').value;

        const typeSelect = document.getElementById('roomType');
        let typeId = 0;

        // Map Type ID dựa theo CSDL
        const typeName = typeSelect.options[typeSelect.selectedIndex].text.trim();
        if (typeName === 'Basic') typeId = 1;
        if (typeName === 'Superior') typeId = 2;
        if (typeName === 'Deluxe') typeId = 3;
        if (typeName === 'Royal') typeId = 4;
        if (typeName === 'Junior Suite') typeId = 5;
        if (typeName === 'Family Suite') typeId = 6;

        const updateData = {
            typeID: typeId,
            status: status
        };

        const btnSave = document.querySelector('.btn-save');
        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        btnSave.disabled = true;

        try {
            await this.api.updateRoom(roomId, updateData);
            alert("Cập nhật thông tin phòng thành công!");
            document.getElementById('roomModal').style.display = 'none';
            // Lấy lại ngày đang chọn để refresh đúng dữ liệu
            const dateStr = document.getElementById('roomViewDate')?.value || '';
            this.loadRooms(dateStr);
        } catch (error) {
            alert("Cập nhật thất bại. Vui lòng thử lại!");
        } finally {
            btnSave.innerHTML = originalText;
            btnSave.disabled = false;
        }
    }

    // 10. Cấu hình Chart.js
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
        if (period === 'week') titleText += ' (Tuần này)';
        if (period === 'month') titleText += ' (Tháng này)';
        if (period === 'year') titleText += ' (Năm nay)';

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

    // --- CÁC HÀM TIỆN ÍCH (UTILITIES) ---
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }
}

// Khởi chạy ứng dụng khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});