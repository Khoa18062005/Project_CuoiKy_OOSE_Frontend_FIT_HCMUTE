// 1. Lớp dịch vụ để giao tiếp với Backend
class RegisterService {
    constructor() {
        // Địa chỉ Backend (Localhost khi chạy máy, link Railway khi deploy)
        this.apiUrl = "http://localhost:8080/api/auth/register"; 
    }

    async registerUser(userData) {
    // 1. Xóa sạch các chữ báo lỗi màu đỏ cũ trước khi gửi yêu cầu mới
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');

    try {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            notify.show("🎉 Đăng ký thành công!", "success");
            setTimeout(() => window.location.href = 'login.html', 2000);
        } 
        else if (response.status === 400) {
            // TRƯỜNG HỢP 400: Dữ liệu bị Validation của Spring Boot từ chối
            
            // Kiểm tra xem Spring Boot có trả về mảng "errors" mặc định không
            if (result.errors && Array.isArray(result.errors)) {
                
                // Duyệt qua từng lỗi mà Java gửi về
                result.errors.forEach(err => {
                    // err.field sẽ là "phone", "email"...
                    const errorElement = document.getElementById(`error-${err.field}`);
                    
                    if (errorElement) {
                        // err.defaultMessage chính là câu "Số điện thoại không hợp lệ" từ Java
                        errorElement.innerText = err.defaultMessage;
                        errorElement.style.color = "#ef4444"; // Đổi thành màu đỏ
                        errorElement.style.fontSize = "13px";
                        errorElement.style.marginTop = "5px";
                        errorElement.style.display = "block";
                    }
                });
                
                notify.show("Vui lòng kiểm tra lại các trường màu đỏ!", "error");
            } else {
                // Nếu lỗi 400 nhưng không phải lỗi Validation (ví dụ: Email đã tồn tại)
                notify.show(result.message || "Dữ liệu không hợp lệ", "error");
            }
        } 
        else if (response.status === 403) {
            notify.show("Lỗi 403: Không có quyền truy cập.", "error");
        } 
        else {
            notify.show("Lỗi máy chủ (Code " + response.status + ")", "error");
        }

    } catch (error) {
        console.error("Lỗi:", error);
        notify.show("Không thể kết nối tới máy chủ Backend.", "error");
    }
}
}

// 2. Khởi tạo các đối tượng
const registerService = new RegisterService();
const registerForm = document.getElementById('registerForm');
let passwordChecker = null;

// 3. Khởi tạo checker mật khẩu khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initPasswordChecker === 'function') {
        passwordChecker = initPasswordChecker(
            'regPassword', 'regStrengthBar', 'regStrengthText', 
            'regConfirmPassword', 'regMatchMessage', 'passwordHint'
        );
    }
});

// 4. Xử lý sự kiện khi nhấn nút "Đăng ký"
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Ngăn trang web bị load lại khi nhấn nút
        
        // Kiểm tra xem PasswordChecker (CheckPW.js) có báo OK không
        if (passwordChecker && passwordChecker.validate()) {
            
            // "Gói" dữ liệu từ các ô Input vào một Object
            const userData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                dateOfBirth: document.getElementById('birthday').value, 
                password: document.getElementById('regPassword').value,
                confirmPassword: document.getElementById('regConfirmPassword').value
            };

            console.log("Đang gửi đơn hàng tới Backend:", userData);
            
            // Gọi hàm gửi đi và đợi kết quả
            await registerService.registerUser(userData);
        }
    });
}