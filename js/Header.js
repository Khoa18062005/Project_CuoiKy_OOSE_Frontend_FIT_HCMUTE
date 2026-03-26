function initHeader() {
    const allLinks = document.querySelectorAll('.nav-links a');
    if (!allLinks.length) return;

    // 1. Lấy tên trang hiện tại và xóa đuôi .html nếu có
    let path = window.location.pathname.toLowerCase();
    let currentPath = path.split('/').pop().replace(".html", "");

    // Nếu trang chủ (/) thì coi như là "index"
    if (currentPath === "" || currentPath === "/") {
        currentPath = "index";
    }

    allLinks.forEach(link => {
        // 2. Lấy href và cũng xóa đuôi .html để so sánh
        let href = link.getAttribute('href').toLowerCase().replace(".html", "");
        
        // Xử lý trường hợp href là "index.html" hoặc chỉ là "index"
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}