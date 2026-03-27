// ==========================================
// 1. MOBILE MENU TOGGLE
// ==========================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');
const navButtons = document.querySelector('.nav-buttons');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Hiển thị cả nút đăng nhập/đăng ký trong menu mobile
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

// ==========================================
// 2. SMOOTH SCROLL CHO NAVIGATION
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '' && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ==========================================
// 3. HEADER SCROLL EFFECT
// ==========================================
let lastScroll = 0;
const header = document.querySelector('.main-header');

if (header) {
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
}

// ==========================================
// 4. ANIMATION ON SCROLL (FADE IN)
// ==========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Thêm hiệu ứng fade cho các phần tử
document.querySelectorAll('.room-card, .service-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==========================================
// 5. PRELOAD IMAGES FALLBACK
// ==========================================
const images = document.querySelectorAll('img');
images.forEach(img => {
    img.addEventListener('error', function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNlZTBlMGUiLz48dGV4dCB4PSI1IiB5PSIyNSIgZmlsbD0iIzk5OSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
        this.style.objectFit = 'cover';
    });
});

// Hiệu ứng hover cho các nút
const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-book, .btn-login, .btn-register-nav');
buttons.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// ==========================================
// 6. TYPEWRITER EFFECT (CHỮ CHẠY)
// ==========================================
const words = ["Sang Trọng", "Đẳng Cấp", "Thư Giãn", "Khác Biệt"];
let wordIndex = 0;
let isDeleting = false;
let text = "";
let typeSpeed = 150;

function typeWriter() {
    const typeWriterElement = document.querySelector('.typewriter-text');
    if (!typeWriterElement) return;

    const currentWord = words[wordIndex];

    if (isDeleting) {
        // Đang xóa chữ
        text = currentWord.substring(0, text.length - 1);
        typeSpeed = 100;
    } else {
        // Đang gõ chữ
        text = currentWord.substring(0, text.length + 1);
        typeSpeed = 150;
    }

    typeWriterElement.textContent = text;

    // Kịch bản gõ và xóa
    if (!isDeleting && text === currentWord) {
        // Gõ xong 1 từ -> Dừng lại 2 giây cho khách đọc
        typeSpeed = 2000; 
        isDeleting = true;
    } else if (isDeleting && text === "") {
        // Xóa xong -> Chuyển sang từ tiếp theo
        isDeleting = false;
        wordIndex++;
        if (wordIndex >= words.length) {
            wordIndex = 0; // Quay vòng lại từ đầu
        }
        typeSpeed = 500; // Nghỉ 0.5s trước khi gõ từ mới
    }

    setTimeout(typeWriter, typeSpeed);
}

// Khởi chạy Typewriter khi trang đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.typewriter-text')) {
        setTimeout(typeWriter, 1000); // Chờ 1 giây tạo cảm giác tự nhiên
    }
});

console.log('Trang chủ đã sẵn sàng với hiệu ứng chữ chạy!');