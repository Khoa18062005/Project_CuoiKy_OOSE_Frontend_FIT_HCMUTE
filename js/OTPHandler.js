// OTPHandler.js - Xử lý logic OTP và timer

class OTPHandler {
    constructor(otpInputsSelector, timerElementId, resendBtnId, emailInputId = null) {
        this.otpInputs = document.querySelectorAll(otpInputsSelector);
        this.timerElement = document.getElementById(timerElementId);
        this.resendBtn = document.getElementById(resendBtnId);
        this.emailInput = emailInputId ? document.getElementById(emailInputId) : null;

        this.generatedOTP = '';
        this.userEmail = '';
        this.timerInterval = null;
        this.timeLeft = 180; // 3 phút

        this.init();
    }

    init() {
        // Thiết lập auto focus cho OTP inputs
        if (this.otpInputs.length > 0) {
            this.otpInputs.forEach((input, index) => {
                input.addEventListener('input', (e) => this.handleOTPInput(e, index));
                input.addEventListener('keydown', (e) => this.handleOTPKeydown(e, index));
            });
        }

        // Thiết lập sự kiện cho nút gửi lại
        if (this.resendBtn) {
            this.resendBtn.addEventListener('click', () => this.resendOTP());
        }
    }

    handleOTPInput(e, index) {
        const input = e.target;

        // Chỉ cho phép nhập số
        input.value = input.value.replace(/[^0-9]/g, '');

        // Tự động focus sang ô tiếp theo
        if (input.value.length === 1 && index < this.otpInputs.length - 1) {
            this.otpInputs[index + 1].focus();
        }
    }

    handleOTPKeydown(e, index) {
        const input = e.target;

        // Xử lý phím backspace
        if (e.key === 'Backspace' && index > 0 && !input.value) {
            this.otpInputs[index - 1].focus();
        }
    }

    async sendOTP(email) {
        this.userEmail = email;

        try {
            // Gọi đến API chúng ta đã viết ở AuthController
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            if (response.ok) {
                // Chỉ bắt đầu đếm ngược khi Backend báo đã gửi mail thành công
                this.startTimer();
                if (this.resendBtn) this.resendBtn.disabled = true;
                this.resetOTPInputs();
                if (this.otpInputs.length > 0) this.otpInputs[0].focus();

                console.log("✅ OTP đã được Java gửi đi!");
            } else {
                const errorData = await response.text();
                alert("Lỗi: " + errorData);
            }
        } catch (error) {
            alert("Không thể kết nối đến server. Hãy kiểm tra Backend đã chạy chưa nhé!");
        }
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timeLeft = 180;

        this.timerInterval = setInterval(() => {
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                if (this.timerElement) this.timerElement.textContent = '00:00';
                if (this.resendBtn) this.resendBtn.disabled = false;
            } else {
                this.timeLeft--;
                const minutes = Math.floor(this.timeLeft / 60);
                const seconds = this.timeLeft % 60;
                if (this.timerElement) {
                    this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        }, 1000);
    }

    resetOTPInputs() {
        this.otpInputs.forEach(input => {
            input.value = '';
            input.disabled = false;
        });
    }

    getOTP() {
        let otp = '';
        this.otpInputs.forEach(input => {
            otp += input.value;
        });
        return otp;
    }

    async verifyOTP(enteredOTP) {
        try {
            const response = await fetch('http://localhost:8080/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.userEmail,
                    otpCode: enteredOTP
                })
            });

            // Trả về true nếu Backend trả về status 200 (OK)
            return response.ok;
        } catch (error) {
            console.error("Lỗi xác thực:", error);
            return false;
        }
    }

    resendOTP() {
        if (this.userEmail) {
            this.sendOTP(this.userEmail);
        } else if (this.emailInput) {
            const email = this.emailInput.value;
            if (email && this.validateEmail(email)) {
                this.sendOTP(email);
            } else {
                alert('Vui lòng nhập email hợp lệ trước khi gửi lại mã!');
            }
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return emailRegex.test(email);
    }

    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}

// Hàm tiện ích để khởi tạo OTP handler
function initOTPHandler(otpSelector, timerId, resendBtnId, emailId = null) {
    return new OTPHandler(otpSelector, timerId, resendBtnId, emailId);
}