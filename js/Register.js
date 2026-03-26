class RegisterService {
    constructor() {
        // Địa chỉ Backend Railway hoặc Localhost của bạn
        this.apiUrl = "http://localhost:8080/api/auth/register"; 
    }

    async registerUser(userData) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData) // Chuyển object JS sang JSON
            });

            const result = await response.json();

            if (response.ok) {
                alert("🎉 Đăng ký thành công! Chào mừng bạn.");
                window.location.href = 'login.html'; // Chuyển hướng sang đăng nhập
            } else {
                // Xử lý lỗi từ Backend (ví dụ: email đã tồn tại)
                alert("Lỗi đăng ký: " + (result.message || "Thông tin không hợp lệ"));
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            alert("Không thể kết nối tới máy chủ Backend.");
        }
    }
}

const registerService = new RegisterService();
const registerForm = document.getElementById('registerForm');
let passwordChecker = null;

// Khởi tạo checker mật khẩu
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initPasswordChecker === 'function') {
        passwordChecker = initPasswordChecker(
            'regPassword', 'regStrengthBar', 'regStrengthText', 
            'regConfirmPassword', 'regMatchMessage', 'passwordHint'
        );
    }
});

// Xử lý sự kiện Submit
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (passwordChecker && passwordChecker.validate()) {
            // Gom dữ liệu chuẩn xác theo RegisterRequest.java
            const userData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                dateOfBirth: document.getElementById('birthday').value, 
                password: document.getElementById('regPassword').value,
                confirmPassword: document.getElementById('regConfirmPassword').value
            };

            console.log("Đang gửi dữ liệu:", userData);
            await registerService.registerUser(userData);
        }
    });
}