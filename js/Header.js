function initHeader() {
    const allLinks = document.querySelectorAll('.nav-links a');
    if (!allLinks.length) return;

    // 1. Lấy đường dẫn hiện tại và chuẩn hóa nó
    let currentPath = window.location.pathname.toLowerCase();
    
    // Nếu đường dẫn là "/" hoặc trống, mặc định là index.html
    if (currentPath === '/' || currentPath === '') {
        currentPath = '/index.html';
    }

    allLinks.forEach(link => {
        // 2. Lấy href và chuẩn hóa để so sánh
        let linkHref = link.getAttribute('href').toLowerCase();
        
        // Đảm bảo linkHref có dấu / ở đầu để khớp với pathname
        if (!linkHref.startsWith('/')) {
            linkHref = '/' + linkHref;
        }

        // 3. So sánh: Nếu pathname kết thúc bằng linkHref thì highlight
        if (currentPath.endsWith(linkHref)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    console.log("Highlight thành công cho:", currentPath);
    
    // Khởi tạo lại Mobile Menu (nếu bạn có đoạn code đó ở dưới)
    // setupMobileMenu(); 
}