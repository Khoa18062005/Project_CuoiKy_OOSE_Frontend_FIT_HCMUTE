// ==========================================
// 1. Hàm xử lý menu active (Code cũ của bạn)
// ==========================================
function initHeader() {
    const allLinks = document.querySelectorAll('.nav-links a');
    if (!allLinks.length) return;

    let path = window.location.pathname.toLowerCase();
    let currentPath = path.split('/').pop().replace(".html", "");

    if (currentPath === "" || currentPath === "/") {
        currentPath = "index";
    }

    allLinks.forEach(link => {
        let href = link.getAttribute('href').toLowerCase().replace(".html", "");
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ==========================================
// 2. Hàm xử lý hiển thị Tên người dùng / Nút đăng nhập
// ==========================================
function initAuth() {
    // Tìm các phần tử HTML trong Header
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const displayUsername = document.getElementById('display-username');
    const logoutBtn = document.getElementById('logout-btn');

    // Kiểm tra xem có ai đang đăng nhập không (lấy từ bộ nhớ trình duyệt)
    const currentUser = localStorage.getItem('current_user');

    if (currentUser) {
        // NẾU CÓ: Ẩn nút Đăng nhập, Hiện menu Tên User
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex'; 
        if (displayUsername) displayUsername.innerText = currentUser;
    } else {
        // NẾU KHÔNG: Hiện nút Đăng nhập, Ẩn menu User
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }

    // Bắt sự kiện khi bấm nút Đăng xuất
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                // Xóa dữ liệu user khỏi bộ nhớ
                localStorage.removeItem('current_user');
                localStorage.removeItem('jwt_token');

                // Tải lại trang (Lúc này initAuth chạy lại sẽ không thấy user -> Hiện lại nút Đăng nhập)
                window.location.reload(); 
            }
        });
    }
}

// ==========================================
// 3. Khởi chạy tất cả khi trang web vừa tải xong
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initHeader(); 
        initAuth();   
    }, 500); // Đợi 500 mili-giây cho HTML kịp load xong
});