// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');
const navButtons = document.querySelector('.nav-buttons');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Thêm nút đăng nhập/đăng ký vào menu mobile nếu chưa có
        if (navLinks.classList.contains('active')) {
            if (!document.querySelector('.mobile-nav-buttons')) {
                const mobileNavBtns = navButtons.cloneNode(true);
                mobileNavBtns.classList.add('mobile-nav-buttons');
                mobileNavBtns.style.marginTop = '20px';
                mobileNavBtns.style.justifyContent = 'center';
                navLinks.appendChild(mobileNavBtns);
            }
        } else {
            const mobileBtns = document.querySelector('.mobile-nav-buttons');
            if (mobileBtns) mobileBtns.remove();
        }
    });
}

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.main-header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.96)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    }
    
    lastScroll = currentScroll;
});

// Active link highlight based on current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinksList = document.querySelectorAll('.nav-links a');

navLinksList.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});