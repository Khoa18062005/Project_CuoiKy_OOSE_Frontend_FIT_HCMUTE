function normalizePathname(pathname) {
    let currentPath = pathname.toLowerCase().split('/').pop();

    if (!currentPath || currentPath === "") {
        return "index.html";
    }
    return currentPath;
}

function buildAvatarUrl(url) {
    if (!url || !url.trim()) {
        return "asset/default-avatar.png";
    }
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${Date.now()}`;
}

function initHeader() {
    const allLinks = document.querySelectorAll('.nav-links a');
    if (!allLinks.length) return;

    const currentPath = normalizePathname(window.location.pathname);
    const currentHash = window.location.hash || "";

    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const [linkPath, linkHash] = href.toLowerCase().split('#');
        const normalizedLinkPath = linkPath && linkPath !== "" ? linkPath : currentPath;

        const pathMatched = normalizedLinkPath === currentPath;
        const hashMatched = !linkHash || (`#${linkHash}` === currentHash.toLowerCase());

        if (pathMatched && hashMatched) {
            link.classList.add('active');
        } else if (
            currentPath === "profile.html" &&
            normalizedLinkPath === "profile.html"
        ) {
            link.classList.add('active');
        } else if (
            currentPath === "room.html" &&
            normalizedLinkPath === "room.html"
        ) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    bindMobileMenu();
    bindDropdownOutsideClick();
}

function bindMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('nav-links');

    if (!mobileMenuBtn || !navLinks || mobileMenuBtn.dataset.bound === "true") return;

    mobileMenuBtn.dataset.bound = "true";
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

function bindDropdownOutsideClick() {
    const dropdown = document.getElementById('user-dropdown');
    const toggle = document.getElementById('user-dropdown-toggle');

    if (!dropdown || !toggle || dropdown.dataset.outsideBound === "true") return;

    dropdown.dataset.outsideBound = "true";

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

function updateHeaderUserUI(username, avatar) {
    const authButtons = document.getElementById('auth-buttons');
    const userDropdown = document.getElementById('user-dropdown');
    const displayUsername = document.getElementById('display-username');
    const avatarImg = document.getElementById('header-avatar-img');

    if (authButtons) authButtons.style.display = 'none';
    if (userDropdown) userDropdown.style.display = 'block';

    if (displayUsername) {
        displayUsername.innerText = username || "User";
    }

    if (avatarImg) {
        avatarImg.src = buildAvatarUrl(avatar || "");
    }
}

function initAuth() {
    const authButtons = document.getElementById('auth-buttons');
    const userDropdown = document.getElementById('user-dropdown');
    const displayUsername = document.getElementById('display-username');
    const logoutBtn = document.getElementById('logout-btn');
    const dropdownToggle = document.getElementById('user-dropdown-toggle');
    const currentUser = localStorage.getItem('current_user');
    const currentAvatar = localStorage.getItem('current_avatar');

    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'block';
        if (displayUsername) displayUsername.innerText = currentUser;

        const avatarImg = document.getElementById('header-avatar-img');
        if (avatarImg) {
            avatarImg.src = buildAvatarUrl(currentAvatar || "");
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userDropdown) userDropdown.style.display = 'none';
    }

    if (dropdownToggle && !dropdownToggle.dataset.bound) {
        dropdownToggle.dataset.bound = "true";
        dropdownToggle.addEventListener('click', () => {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('open');
            }
        });
    }

    if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = "true";
        logoutBtn.addEventListener('click', () => {
            const confirmed = confirm("Bạn có chắc chắn muốn đăng xuất?");
            if (!confirmed) return;

            localStorage.removeItem('current_user');
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('current_avatar');

            notifySafe("Đăng xuất thành công!", "success");

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        });
    }

    loadHeaderProfile();
}

async function loadHeaderProfile() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8080/api/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return;

        const profile = await response.json();

        localStorage.setItem('current_user', profile.username || "");
        localStorage.setItem('current_avatar', profile.avatar || "");

        updateHeaderUserUI(profile.username || "User", profile.avatar || "");
    } catch (error) {
        console.warn("Không tải được profile header:", error);
    }
}

function notifySafe(message, type) {
    if (typeof notify !== 'undefined' && notify && typeof notify.show === 'function') {
        notify.show(message, type);
    }
}

window.addEventListener("profile-updated", (e) => {
    const detail = e.detail || {};
    const username = detail.username || "User";
    const avatar = detail.avatar || "";

    localStorage.setItem("current_user", username);
    localStorage.setItem("current_avatar", avatar);

    updateHeaderUserUI(username, avatar);
});