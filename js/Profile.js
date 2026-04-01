class ProfileService {
    constructor() {
        this.baseUrl = "http://localhost:8080/api/users";
        this.paymentBaseUrl = "http://localhost:8080/api/payments";
        this.token = localStorage.getItem("jwt_token");

        this.form = document.getElementById("profileForm");
        this.avatarInput = document.getElementById("avatar");
        this.avatarFileInput = document.getElementById("avatarFile");
        this.uploadAvatarBtn = document.getElementById("uploadAvatarBtn");
        this.avatarPreview = document.getElementById("profileAvatarPreview");
        this.avatarUploadStatus = document.getElementById("avatarUploadStatus");

        this.init();
    }

    init() {
        if (!this.token) {
            notify.show("Bạn cần đăng nhập để vào trang hồ sơ", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
            return;
        }

        this.bindEvents();
        this.loadProfile();
        this.loadBookingHistory();
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener("submit", (e) => this.handleUpdateProfile(e));
        }

        if (this.uploadAvatarBtn) {
            this.uploadAvatarBtn.addEventListener("click", () => this.handleUploadAvatar());
        }

        if (this.avatarFileInput) {
            this.avatarFileInput.addEventListener("change", () => this.previewLocalAvatar());
        }
    }

    getAvatarUrl(url) {
        if (!url || !url.trim()) {
            return "asset/default-avatar.png";
        }
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}t=${Date.now()}`;
    }

    previewLocalAvatar() {
        const file = this.avatarFileInput.files[0];

        if (!file) {
            this.avatarUploadStatus.innerText = "Chưa chọn ảnh nào";
            this.avatarUploadStatus.className = "avatar-upload-status";
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        this.avatarPreview.src = previewUrl;
        this.avatarUploadStatus.innerText = `Đã chọn: ${file.name}`;
        this.avatarUploadStatus.className = "avatar-upload-status";
    }

    async handleUploadAvatar() {
        const file = this.avatarFileInput.files[0];

        if (!file) {
            notify.show("Vui lòng chọn ảnh trước khi upload", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            this.uploadAvatarBtn.disabled = true;
            this.uploadAvatarBtn.innerText = "Đang tải...";

            const response = await fetch(`${this.baseUrl}/me/avatar`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.token}`
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                this.avatarUploadStatus.innerText = result.message || "Upload avatar thất bại";
                this.avatarUploadStatus.className = "avatar-upload-status error";
                notify.show(result.message || "Upload avatar thất bại", "error");
                return;
            }

            const avatarUrl = result.avatarUrl || "";

            this.avatarInput.value = avatarUrl;
            this.avatarPreview.src = this.getAvatarUrl(avatarUrl);

            this.avatarUploadStatus.innerText = "Upload avatar thành công";
            this.avatarUploadStatus.className = "avatar-upload-status success";

            localStorage.setItem("current_avatar", avatarUrl);

            this.updateHeaderUI({
                username: localStorage.getItem("current_user") || "User",
                avatar: avatarUrl
            });

            notify.show("Upload avatar thành công!", "success");
            await this.loadProfile();

        } catch (error) {
            console.error(error);
            this.avatarUploadStatus.innerText = "Lỗi kết nối khi upload avatar";
            this.avatarUploadStatus.className = "avatar-upload-status error";
            notify.show("Không thể upload avatar", "error");
        } finally {
            this.uploadAvatarBtn.disabled = false;
            this.uploadAvatarBtn.innerText = "Tải ảnh lên";
        }
    }

    async loadProfile() {
        try {
            const response = await fetch(`${this.baseUrl}/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (!response.ok) {
                notify.show(result.message || "Không tải được hồ sơ cá nhân", "error");
                return;
            }

            this.renderProfile(result);
        } catch (error) {
            console.error(error);
            notify.show("Lỗi kết nối khi tải hồ sơ", "error");
        }
    }

    renderProfile(profile) {
        document.getElementById("username").value = profile.username || "";
        document.getElementById("email").value = profile.email || "";
        document.getElementById("phone").value = profile.phone || "";
        document.getElementById("dateOfBirth").value = profile.dateOfBirth || "";
        document.getElementById("avatar").value = profile.avatar || "";

        document.getElementById("sidebarUsername").innerText = profile.username || "--";
        document.getElementById("sidebarEmail").innerText = profile.email || "--";

        document.getElementById("tierBadge").innerText = profile.membershipTier || "Bronze";
        document.getElementById("profilePoint").innerText = profile.point ?? 0;
        document.getElementById("profileBenefits").innerText = profile.benefits || "Chưa có quyền lợi";

        document.getElementById("membershipTier").innerText = profile.membershipTier || "Bronze";
        document.getElementById("membershipPoint").innerText = profile.point ?? 0;
        document.getElementById("membershipDiscount").innerText = `${Math.round((profile.discountRate || 0) * 100)}%`;
        document.getElementById("membershipBenefitsText").innerText = profile.benefits || "Chưa có quyền lợi";

        const finalAvatar = this.getAvatarUrl(profile.avatar || "");
        this.avatarPreview.src = finalAvatar;

        localStorage.setItem("current_user", profile.username || "");
        localStorage.setItem("current_avatar", profile.avatar || "");

        this.updateHeaderUI({
            username: profile.username || "User",
            avatar: profile.avatar || ""
        });
    }

    updateHeaderUI(profile) {
        const headerName = document.getElementById("display-username");
        const headerAvatar = document.getElementById("header-avatar-img");

        if (headerName) {
            headerName.innerText = profile.username || "User";
        }

        if (headerAvatar) {
            headerAvatar.src = this.getAvatarUrl(profile.avatar || "");
        }

        window.dispatchEvent(new CustomEvent("profile-updated", {
            detail: {
                username: profile.username || "User",
                avatar: profile.avatar || ""
            }
        }));
    }

    async handleUpdateProfile(e) {
        e.preventDefault();

        const payload = {
            username: document.getElementById("username").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            dateOfBirth: document.getElementById("dateOfBirth").value
        };

        try {
            const response = await fetch(`${this.baseUrl}/me`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors && Array.isArray(result.errors)) {
                    const firstError = result.errors[0];
                    notify.show(firstError.defaultMessage || "Dữ liệu không hợp lệ", "error");
                } else {
                    notify.show(result.message || "Cập nhật thất bại", "error");
                }
                return;
            }

            notify.show("Cập nhật hồ sơ thành công!", "success");
            this.renderProfile(result);

            if (typeof initAuth === "function") {
                initAuth();
            }
        } catch (error) {
            console.error(error);
            notify.show("Không thể kết nối để cập nhật hồ sơ", "error");
        }
    }

    async loadBookingHistory() {
        const container = document.getElementById("bookingHistoryList");

        try {
            const response = await fetch(`${this.baseUrl}/me/bookings`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (!response.ok) {
                container.innerHTML = `<div class="empty-booking">Không tải được lịch sử đặt phòng.</div>`;
                return;
            }

            this.renderBookingHistory(result);
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="empty-booking">Lỗi kết nối khi tải lịch sử đặt phòng.</div>`;
        }
    }

    renderBookingHistory(bookings) {
        const container = document.getElementById("bookingHistoryList");
        const targetBookingId = new URLSearchParams(window.location.search).get("bookingId");

        if (!bookings || bookings.length === 0) {
            container.innerHTML = `<div class="empty-booking">Bạn chưa có booking nào.</div>`;
            return;
        }

        container.innerHTML = bookings.map(booking => {
            const roomsHtml = (booking.rooms || []).map(room => `
                <div class="booking-room-item">
                    <div>
                        <strong>Phòng ${room.roomNumber}</strong>
                        <span>${room.roomType}</span>
                    </div>
                    <div>
                        <strong>Giá/đêm</strong>
                        <span>${this.formatMoney(room.pricePerNight)}</span>
                    </div>
                    <div>
                        <strong>Thành tiền</strong>
                        <span>${this.formatMoney(room.subTotal)}</span>
                    </div>
                    <div class="booking-price">${this.formatMoney(room.subTotal)}</div>
                </div>
            `).join("");

            const isTarget = String(booking.bookingID) === String(targetBookingId);

            return `
                <article class="booking-item ${isTarget ? 'booking-item-highlight' : ''}" id="booking-${booking.bookingID}">
                    <div class="booking-top">
                        <div>
                            <h4>Booking #${booking.bookingID}</h4>
                            <div class="booking-meta">
                                <span><b>Ngày đặt:</b> ${this.formatDateTime(booking.bookingDate)}</span>
                                <span><b>Check-in:</b> ${booking.checkin || "--"}</span>
                                <span><b>Check-out:</b> ${booking.checkout || "--"}</span>
                                <span><b>Thanh toán:</b> ${this.formatPaymentStatus(booking.paymentStatus)}</span>
                                <span><b>Giữ phòng đến:</b> ${booking.expiredAt ? this.formatDateTime(booking.expiredAt) : "--"}</span>
                            </div>
                        </div>
                        <div class="booking-status ${this.getStatusClass(booking.status)}">
                            ${this.formatStatus(booking.status)}
                        </div>
                    </div>

                    <div class="booking-body">
                        <div class="booking-room-list">
                            ${roomsHtml}
                        </div>

                        <div class="booking-total">
                            Tổng thanh toán:
                            <strong>${this.formatMoney(booking.totalPrice)}</strong>
                        </div>

                        <div style="margin-top:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                            ${this.renderBookingHint(booking)}
                            ${booking.canRepay ? `
                                <button 
                                    type="button"
                                    class="btn-save-profile"
                                    data-booking-id="${booking.bookingID}"
                                    onclick="profileService.handleRepayBooking(${booking.bookingID})">
                                    Thanh toán lại
                                </button>
                            ` : ""}
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        if (targetBookingId) {
            setTimeout(() => {
                const targetEl = document.getElementById(`booking-${targetBookingId}`);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 250);
        }
    }

    renderBookingHint(booking) {
        if (booking.canRepay) {
            return `
                <div style="padding:10px 14px; border-radius:14px; background:rgba(245,158,11,0.12); color:#b45309; font-weight:600;">
                    Booking đang chờ thanh toán. Bạn vẫn có thể thanh toán lại trước khi hết hạn giữ phòng.
                </div>
            `;
        }

        if (booking.expired && booking.status?.toLowerCase() === "cancelled") {
            return `
                <div style="padding:10px 14px; border-radius:14px; background:rgba(239,68,68,0.10); color:#b91c1c; font-weight:600;">
                    Booking đã hết hạn giữ phòng và đã bị hủy. Muốn đặt tiếp bạn cần tạo booking mới.
                </div>
            `;
        }

        if ((booking.status || "").toLowerCase() === "confirmed") {
            return `
                <div style="padding:10px 14px; border-radius:14px; background:rgba(16,185,129,0.10); color:#047857; font-weight:600;">
                    Booking đã thanh toán thành công.
                </div>
            `;
        }

        return "";
    }

    async handleRepayBooking(bookingId) {
        try {
            const response = await fetch(`${this.paymentBaseUrl}/vnpay/${bookingId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                notify.show(result.message || "Không thể tạo link thanh toán lại", "error");
                await this.loadBookingHistory();
                return;
            }

            window.location.href = result.paymentUrl;
        } catch (error) {
            console.error(error);
            notify.show("Lỗi kết nối khi thanh toán lại", "error");
        }
    }

    getStatusClass(status) {
        const normalized = (status || "").toLowerCase();
        if (normalized === "pending") return "status-pending";
        if (normalized === "confirmed") return "status-confirmed";
        if (normalized === "checked_in") return "status-checked_in";
        if (normalized === "checked_out") return "status-checked_out";
        if (normalized === "cancelled") return "status-cancelled";
        return "status-pending";
    }

    formatStatus(status) {
        const normalized = (status || "").toLowerCase();
        switch (normalized) {
            case "pending":
                return "Đã đặt - chờ thanh toán";
            case "confirmed":
                return "Đã thanh toán";
            case "checked_in":
                return "Đã nhận phòng";
            case "checked_out":
                return "Đã trả phòng";
            case "cancelled":
                return "Đã hủy";
            default:
                return status || "--";
        }
    }

    formatPaymentStatus(status) {
        const normalized = (status || "").toLowerCase();
        switch (normalized) {
            case "pending":
                return "Đang xử lý / chờ thanh toán";
            case "success":
                return "Thanh toán thành công";
            case "failed":
                return "Thanh toán thất bại";
            case "refunded":
                return "Đã hoàn tiền";
            default:
                return status || "--";
        }
    }

    formatMoney(value) {
        return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
    }

    formatDateTime(dateTime) {
        if (!dateTime) return "--";
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) return dateTime;
        return date.toLocaleString("vi-VN");
    }
}

let profileService = null;

document.addEventListener("DOMContentLoaded", () => {
    profileService = new ProfileService();
});