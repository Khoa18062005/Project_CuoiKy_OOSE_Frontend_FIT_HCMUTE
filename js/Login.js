// Login.js - Xử lý logic cho trang đăng nhập

// DOM elements
const loginForm = document.getElementById('loginForm');
const rememberCheckbox = document.querySelector('.remember-checkbox');

// Hàm kiểm tra đăng nhập
function validateLogin(username, password) {
    if (!username) {
        alert('Vui lòng nhập tên đăng nhập hoặc email!');
        return false;
    }
    
    if (!password) {
        alert('Vui lòng nhập mật khẩu!');
        return false;
    }
    
    return true;
}

// Xử lý form đăng nhập
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername')?.value;
        const password = document.getElementById('loginPassword')?.value;
        
        if (validateLogin(username, password)) {
            // Giả lập đăng nhập thành công
            alert('🔐 Đăng nhập thành công! Chào mừng bạn trở lại.');
            
            // Lưu thông tin nếu chọn "Ghi nhớ đăng nhập"
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('rememberedUser', username);
                console.log('Đã lưu thông tin đăng nhập');
            }
            
            // Chuyển hướng sau khi đăng nhập
            // window.location.href = 'dashboard.html';
        }
    });
}

// Kiểm tra nếu có thông tin đăng nhập đã lưu
document.addEventListener('DOMContentLoaded', () => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser && document.getElementById('loginUsername')) {
        document.getElementById('loginUsername').value = rememberedUser;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
});