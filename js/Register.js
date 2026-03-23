// Register.js - Xử lý logic cho trang đăng ký (Phiên bản cập nhật)

// DOM elements
const registerForm = document.getElementById('registerForm');
let passwordChecker = null;

// Khởi tạo password checker khi trang load
document.addEventListener('DOMContentLoaded', () => {
    passwordChecker = initPasswordChecker(
        'regPassword', 
        'regStrengthBar', 
        'regStrengthText', 
        'regConfirmPassword', 
        'regMatchMessage',
        'passwordHint'
    );
});

// Xử lý form đăng ký
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (passwordChecker && passwordChecker.validate()) {
            // Lấy các giá trị từ form
            const username = document.getElementById('username')?.value;
            const email = document.getElementById('email')?.value;
            const phone = document.getElementById('phone')?.value;
            const birthday = document.getElementById('birthday')?.value;
            const password = document.getElementById('regPassword')?.value;
            
            // Kiểm tra độ mạnh mật khẩu
            const strength = passwordChecker.checkStrength();
            
            // Thông báo kết quả
            let message = `🎉 Đăng ký thành công!\n\n`;
            message += `Chào mừng ${username} đã đến với chúng tôi!\n`;
            message += `📧 Email: ${email}\n`;
            message += `📱 SĐT: ${phone}\n`;
            message += `🔐 Độ mạnh mật khẩu: ${strength.feedback}`;
            
            alert(message);
            
            // Có thể reset form hoặc chuyển hướng
            // registerForm.reset();
            // window.location.href = 'login.html';
        }
    });
}