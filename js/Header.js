function initHeader() {
    const header = document.querySelector('.main-header');
    const allLinks = document.querySelectorAll('.nav-links a');

    if (!allLinks.length) return; // Nếu chưa thấy link nào thì thoát để tránh lỗi

    // Lấy tên trang hiện tại
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';

    allLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        // Kiểm tra khớp trang hoặc nếu ở trang chủ (/) thì highlight 'index.html'
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- Giữ nguyên các phần Mobile Menu và Scroll Effect ở đây ---
    console.log("Header đã được khởi tạo cho trang:", currentPage);
}

// Tự động chạy hàm khi trang web tải xong
document.addEventListener('DOMContentLoaded', initHeader);