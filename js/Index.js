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

// ==========================================
// 7. LOAD PUBLIC REVIEWS
// ==========================================
function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

async function loadReviews(isMyReviews = false) {
    const container = document.getElementById("reviewsContainer");
    if (!container) return;

    container.innerHTML = `<div style="text-align: center; width: 100%; color: #64748b;">Đang tải đánh giá...</div>`;

    try {
        const token = localStorage.getItem("jwt_token");
        let url = "http://localhost:8080/api/reviews/public";
        let headers = {};

        if (isMyReviews && token) {
            url = "http://localhost:8080/api/reviews/me";
            headers = { "Authorization": `Bearer ${token}` };
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
            container.innerHTML = `<div style="text-align: center; width: 100%; color: #64748b;">Không thể tải đánh giá.</div>`;
            return;
        }

        const reviews = await response.json();
        if (!reviews || reviews.length === 0) {
            container.innerHTML = `<div style="text-align: center; width: 100%; color: #64748b; font-style: italic;">Chưa có đánh giá nào.</div>`;
            return;
        }

        const generateStarsHtml = (rating, fontSize = '1rem') => {
            return Array.from({length: 5}, (_, i) => {
                const starIndex = i + 1;
                let fillPercent = 0;
                if (rating >= starIndex) fillPercent = 100;
                else if (rating > starIndex - 1) fillPercent = (rating - (starIndex - 1)) * 100;
                return `<i class="fas fa-star" style="font-size: ${fontSize}; margin: 0 2px; background: linear-gradient(90deg, #fbbf24 ${fillPercent}%, #e2e8f0 ${fillPercent}%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: transparent;"></i>`;
            }).join('');
        };

        // Tính và hiển thị điểm đánh giá trung bình (chỉ hiển thị ở tab Tất cả)
        const avgContainer = document.getElementById("averageRatingContainer");
        if (!isMyReviews && avgContainer && reviews.length > 0) {
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = (totalRating / reviews.length).toFixed(1);
            
            const avgStars = generateStarsHtml(avgRating, '1.8rem');

            avgContainer.style.display = "flex";
            avgContainer.innerHTML = `
                <div style="font-size: 4rem; font-weight: 800; color: #1e293b; line-height: 1; text-shadow: 0 2px 10px rgba(0,0,0,0.05);">${avgRating}</div>
                <div style="margin: 10px 0;">${avgStars}</div>
                <div style="color: #64748b; font-size: 1rem; background: #fff; padding: 6px 16px; border-radius: 99px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">Dựa trên <strong>${reviews.length}</strong> đánh giá</div>
            `;
        } else if (isMyReviews && avgContainer) {
            avgContainer.style.display = "none";
        }

        // Show top 6 for public, all for my reviews
        const topReviews = isMyReviews ? reviews.sort((a, b) => b.reviewID - a.reviewID) : reviews.sort((a, b) => b.reviewID - a.reviewID).slice(0, 6);

        container.innerHTML = topReviews.map(r => {
            const stars = generateStarsHtml(r.rating, '1rem');
            
            const safeAdminReply = escapeHTML(r.adminReply);
            const adminReplyHtml = r.adminReply ? `
                <div style="margin-top: 15px; padding: 12px 16px; background: #f8fafc; border-radius: 12px; font-size: 0.9rem; border-left: 4px solid #f15a24;">
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                        <i class="fas fa-reply" style="color: #f15a24; margin-right: 8px;"></i>
                        <strong style="color: #1e293b;">Phản hồi từ Khách sạn</strong>
                    </div>
                    <p style="margin: 0; color: #475569; line-height: 1.5;">${safeAdminReply}</p>
                </div>
            ` : '';

            const date = new Date(r.reviewDate).toLocaleDateString('vi-VN');
            let roomInfoHtml = '';
            
            if (r.roomType || r.checkinDate) {
                const checkin = r.checkinDate ? new Date(r.checkinDate).toLocaleDateString('vi-VN') : '';
                const checkout = r.checkoutDate ? new Date(r.checkoutDate).toLocaleDateString('vi-VN') : '';
                const timeStr = checkin && checkout ? `${checkin} - ${checkout}` : '';
                
                roomInfoHtml = `
                    <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; color: #64748b; margin-bottom: 12px; display: inline-block;">
                        ${r.roomType ? `<i class="fas fa-bed" style="margin-right: 5px;"></i> ${r.roomType}` : ''}
                        ${timeStr ? `<span style="margin: 0 8px;">|</span><i class="far fa-calendar-alt" style="margin-right: 5px;"></i> ${timeStr}` : ''}
                    </div>
                `;
            }

            const avatarSrc = r.customerAvatar 
                ? (r.customerAvatar.startsWith('http') ? r.customerAvatar : `http://localhost:8080${r.customerAvatar.startsWith('/') ? '' : '/'}${r.customerAvatar}`) 
                : 'asset/default-avatar.png';

            let imagesHtml = '';
            if (r.imageUrls) {
                const urls = r.imageUrls.split(',');
                if (urls.length > 0) {
                    imagesHtml = `<div style="display: flex; gap: 8px; margin-top: 15px; overflow-x: auto; padding-bottom: 5px;">`;
                    urls.forEach(url => {
                        if (url.trim()) {
                            imagesHtml += `<img src="${url.trim()}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 1px solid #e2e8f0; transition: 0.3s;" onclick="window.open(this.src, '_blank')" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">`;
                        }
                    });
                    imagesHtml += `</div>`;
                }
            }

            let subRatingsHtml = '';
            if (r.cleanlinessRating) {
                subRatingsHtml = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0; font-size: 0.8rem; color: #64748b;">
                        <div><i class="fas fa-broom" style="color: #d4a017; width: 15px;"></i> Sạch sẽ: <strong style="color: #1e293b;">${r.cleanlinessRating}/5</strong></div>
                        <div><i class="fas fa-concierge-bell" style="color: #d4a017; width: 15px;"></i> Dịch vụ: <strong style="color: #1e293b;">${r.serviceRating}/5</strong></div>
                        <div><i class="fas fa-tv" style="color: #d4a017; width: 15px;"></i> Tiện nghi: <strong style="color: #1e293b;">${r.facilitiesRating}/5</strong></div>
                        <div><i class="fas fa-map-marker-alt" style="color: #d4a017; width: 15px;"></i> Vị trí: <strong style="color: #1e293b;">${r.locationRating}/5</strong></div>
                    </div>
                `;
            }

            return `
                <div style="background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); display: flex; flex-direction: column; transition: transform 0.3s;">
                    <div style="display: flex; align-items: center; margin-bottom: 15px;">
                        <img src="${avatarSrc}" onerror="this.src='asset/default-avatar.png'" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 15px; border: 2px solid #f1f5f9;">
                        <div>
                            <h4 style="margin: 0 0 4px; color: #1e293b; font-size: 1.05rem;">${escapeHTML(r.customerName) || 'Khách hàng'}</h4>
                            <div style="font-size: 0.85rem; color: #94a3b8;"><i class="far fa-clock" style="margin-right: 4px;"></i>${date}</div>
                        </div>
                    </div>
                    ${roomInfoHtml}
                    <div style="margin-bottom: 12px;">
                        ${stars}
                    </div>
                    <p style="color: #475569; line-height: 1.6; flex-grow: 1; margin: 0 0 15px 0;">"${escapeHTML(r.comment)}"</p>
                    ${imagesHtml}
                    ${subRatingsHtml}
                    ${adminReplyHtml}
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div style="text-align: center; width: 100%; color: #dc2626;">Lỗi kết nối khi tải đánh giá.</div>`;
    }
}

function setupReviewTabs() {
    const token = localStorage.getItem("jwt_token");
    const reviewTabs = document.getElementById("reviewTabs");
    const btnAll = document.getElementById("btnAllReviews");
    const btnMy = document.getElementById("btnMyReviews");

    if (token && reviewTabs) {
        reviewTabs.style.display = "flex";
        
        btnAll.addEventListener("click", () => {
            btnAll.style.background = "linear-gradient(135deg, #ef4136, #c73b0c)";
            btnAll.style.color = "white";
            btnAll.style.boxShadow = "0 4px 14px rgba(239, 65, 54, 0.3)";
            
            btnMy.style.background = "#e2e8f0";
            btnMy.style.color = "#475569";
            btnMy.style.boxShadow = "none";
            
            loadReviews(false);
        });

        btnMy.addEventListener("click", () => {
            btnMy.style.background = "linear-gradient(135deg, #ef4136, #c73b0c)";
            btnMy.style.color = "white";
            btnMy.style.boxShadow = "0 4px 14px rgba(239, 65, 54, 0.3)";
            
            btnAll.style.background = "#e2e8f0";
            btnAll.style.color = "#475569";
            btnAll.style.boxShadow = "none";
            
            loadReviews(true);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupReviewTabs();
    loadReviews(false);
});