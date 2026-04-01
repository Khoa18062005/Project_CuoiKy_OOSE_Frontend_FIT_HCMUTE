class RoomSearchService {
    constructor() {
        this.baseUrl = "http://localhost:8080";
        this.selectedRooms = [];
        this.lastSearchPayload = null;
        this.bindEvents();
        this.setMinDate();
    }

    bindEvents() {
        const form = document.getElementById("roomSearchForm");
        const createBookingBtn = document.getElementById("btn-create-booking");

        if (form) {
            form.addEventListener("submit", (e) => this.handleSearch(e));
        }

        if (createBookingBtn) {
            createBookingBtn.addEventListener("click", () => this.handleCreateBooking());
        }
    }

    setMinDate() {
        const today = new Date().toISOString().split("T")[0];
        const checkin = document.querySelector('input[name="checkin"]');
        const checkout = document.querySelector('input[name="checkout"]');
        if (checkin) checkin.min = today;
        if (checkout) checkout.min = today;
    }

    async handleSearch(e) {
        e.preventDefault();

        const form = e.target;
        const checkin = form.checkin.value;
        const checkout = form.checkout.value;
        const numberOfRooms = form.rooms.value;
        const guests = form.guests.value;
        const roomType = form.roomType.value;

        this.lastSearchPayload = { 
            checkin, 
            checkout, 
            numberOfRooms, 
            guests, 
            roomType 
        };

        const query = new URLSearchParams({
            checkin,
            checkout,
            numberOfRooms,
            guests,
            roomType
        });

        try {
            const response = await fetch(`${this.baseUrl}/api/rooms/search?${query.toString()}`);
            const result = await response.json();

            if (!response.ok) {
                notify.show(result.message || "Không thể tìm phòng", "error");
                return;
            }

            this.renderRooms(result);
        } catch (error) {
            console.error(error);
            notify.show("Không thể kết nối đến backend", "error");
        }
    }

    renderRooms(result) {
        const container = document.getElementById("room-result-list");
        const summary = document.getElementById("result-summary");
        const bookingAction = document.getElementById("booking-action");

        container.innerHTML = "";
        this.selectedRooms = [];

        summary.innerText = result.enough
            ? `Tìm thấy ${result.totalFound} phòng phù hợp. Bạn đang yêu cầu ${result.requested} phòng.`
            : (result.warning || "Không đủ phòng phù hợp.");

        if (!result.rooms || result.rooms.length === 0) {
            container.innerHTML = `<div class="empty-room-state">Không có phòng trống phù hợp trong thời gian bạn chọn.</div>`;
            bookingAction.style.display = "none";
            return;
        }

        result.rooms.forEach(room => {
            const card = document.createElement("div");
            card.className = "room-card-beauty";
            card.innerHTML = `
                <div class="room-card-top">
                    <div>
                        <span class="room-badge">${room.roomType.typeName}</span>
                        <h3>${room.roomNumber}</h3>
                        <p>${room.description || "Không gian sang trọng, đầy đủ tiện nghi."}</p>
                    </div>
                    <div class="room-price">
                        <strong>${this.formatMoney(room.roomType.priceRoom)}</strong>
                        <span>/ đêm</span>
                    </div>
                </div>

                <div class="room-meta">
                    <div><i class="fas fa-users"></i> ${room.roomType.occupancy} khách</div>
                    <div><i class="fas fa-circle-check"></i> ${room.status}</div>
                </div>

                <label class="room-select-box">
                    <input type="checkbox" 
                           value="${room.roomID}" 
                           data-price="${room.roomType.priceRoom}" 
                           data-room="${room.roomNumber}">
                    <span>Chọn phòng này</span>
                </label>
            `;

            container.appendChild(card);
        });

        // Gắn sự kiện cho checkbox
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener("change", () => this.handleSelectRoom());
        });

        bookingAction.style.display = "block";
    }

    handleSelectRoom() {
        const checked = document.querySelectorAll('#room-result-list input[type="checkbox"]:checked');
        this.selectedRooms = Array.from(checked).map(item => Number(item.value));
    }

    async handleCreateBooking() {
        const token = localStorage.getItem("jwt_token");
        if (!token) {
            notify.show("Bạn cần đăng nhập để đặt phòng", "error");
            setTimeout(() => window.location.href = "login.html", 1000);
            return;
        }

        if (!this.lastSearchPayload) {
            notify.show("Bạn cần tìm phòng trước", "error");
            return;
        }

        if (this.selectedRooms.length === 0) {
            notify.show("Vui lòng chọn ít nhất 1 phòng", "error");
            return;
        }

        const payload = {
            checkin: this.lastSearchPayload.checkin,
            checkout: this.lastSearchPayload.checkout,
            roomIds: this.selectedRooms,
            guests: Number(this.lastSearchPayload.guests),
            numberOfRooms: Number(this.lastSearchPayload.numberOfRooms)
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                notify.show(result.message || "Tạo booking thất bại", "error");
                return;
            }

            // Hiển thị thông báo từ backend (đã có thông tin giảm giá)
            notify.show(result.message || "Tạo booking thành công", "success");

            // Nếu backend trả về discountRate (tùy chọn nâng cao)
            if (result.discountRate && result.discountRate > 0) {
                notify.show(`Đã áp dụng giảm giá ${Math.round(result.discountRate * 100)}% theo hạng thành viên!`, "success");
            }

            // Chuyển sang thanh toán VNPay
            await this.redirectToVnpay(result.bookingID, token);

        } catch (error) {
            console.error(error);
            notify.show("Lỗi tạo booking", "error");
        }
    }

    async redirectToVnpay(bookingId, token) {
        try {
            const response = await fetch(`${this.baseUrl}/api/payments/vnpay/${bookingId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                notify.show(result.message || "Không tạo được link thanh toán", "error");
                return;
            }

            // Chuyển hướng đến trang thanh toán VNPay
            window.location.href = result.paymentUrl;
        } catch (error) {
            console.error(error);
            notify.show("Không thể kết nối thanh toán", "error");
        }
    }

    formatMoney(value) {
        return Number(value).toLocaleString("vi-VN") + " VNĐ";
    }
}

// Khởi tạo khi trang load xong
document.addEventListener("DOMContentLoaded", () => {
    new RoomSearchService();
});