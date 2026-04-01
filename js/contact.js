// Dữ liệu thành viên nhóm
const teamMembers = [
    {
        id: 1,
        fullName: "Nguyễn Văn An",
        studentId: "20210001",
        phone: "0901234567",
        email: "an.nguyen@example.com",
        dob: "15/03/2002",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        portfolioLink: "portfolio-an.html"
    },
    {
        id: 2,
        fullName: "Trần Thị Bình",
        studentId: "20210002",
        phone: "0912345678",
        email: "binh.tran@example.com",
        dob: "22/07/2002",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
        portfolioLink: "portfolio-binh.html"
    },
    {
        id: 3,
        fullName: "Lê Hoàng Cường",
        studentId: "20210003",
        phone: "0923456789",
        email: "cuong.le@example.com",
        dob: "10/11/2001",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
        portfolioLink: "portfolio-cuong.html"
    }
];

// Render danh sách thành viên
function renderTeamMembers() {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;

    teamGrid.innerHTML = teamMembers.map(member => `
        <div class="team-card" data-id="${member.id}">
            <div class="card-avatar">
                <img src="${member.avatar}" alt="Avatar của ${member.fullName}">
            </div>
            <div class="card-info">
                <h3 class="member-name">${member.fullName}</h3>
                <p class="member-student-id"><strong>MSSV:</strong> ${member.studentId}</p>
                <p class="member-phone"><strong>Điện thoại:</strong> ${member.phone}</p>
                <p class="member-email"><strong>Email:</strong> ${member.email}</p>
                <p class="member-dob"><strong>Ngày sinh:</strong> ${member.dob}</p>
                <a href="${member.portfolioLink}" class="btn-portfolio">Xem Portfolio</a>
            </div>
        </div>
    `).join('');

    // Gắn sự kiện click cho toàn bộ card (tùy chọn, nếu muốn click vào card cũng chuyển trang)
    document.querySelectorAll('.team-card').forEach(card => {
        const btn = card.querySelector('.btn-portfolio');
        const link = btn.getAttribute('href');
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Tránh sự kiện nếu click vào nút (vì nút đã có link riêng)
            if (e.target === btn || btn.contains(e.target)) {
                return;
            }
            window.location.href = link;
        });
    });
}

// Cập nhật các link tài nguyên (có thể thay đổi link thật ở đây)
function setResourceLinks() {
    const reportLink = document.getElementById('report-link');
    const frontendLink = document.getElementById('github-frontend-link');
    const backendLink = document.getElementById('github-backend-link');

    // Thay thế các link dưới đây bằng link thực tế của dự án
    if (reportLink) reportLink.href = "https://example.com/report.pdf";
    if (frontendLink) frontendLink.href = "https://github.com/yourusername/frontend-repo";
    if (backendLink) backendLink.href = "https://github.com/yourusername/backend-repo";
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    renderTeamMembers();
    setResourceLinks();
});