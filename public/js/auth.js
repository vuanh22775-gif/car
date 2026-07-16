// Thay thế client/src/context/AuthContext.tsx + services/authService.ts
window.Auth = (function () {
  let currentUser = null;
  let initialized = false;
  let initPromise = null;

  async function loginUser(email, password) {
    const res = await window.api.post('/auth/login', { email, password });
    return res.data.data; // { user, token }
  }

  async function registerUser(userData) {
    const res = await window.api.post('/auth/register', userData);
    return res.data.data;
  }

  async function getCurrentUser() {
    const res = await window.api.get('/auth/me');
    return res.data.data;
  }

  async function login(email, password) {
    const data = await loginUser(email, password);
    currentUser = data.user;
    localStorage.setItem('token', data.token);
    return data;
  }

  async function register(userData) {
    const data = await registerUser(userData);
    currentUser = data.user;
    localStorage.setItem('token', data.token);
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    updateHeaderUI();
  }

  function isAuthenticated() {
    return !!currentUser;
  }

  function isAdmin() {
    return !!currentUser && currentUser.role === 'admin';
  }

  function getUser() {
    return currentUser;
  }

  // ── Đồng bộ giao diện Header giống Header.tsx (điều kiện isAuthenticated/isAdmin) ─
  function updateHeaderUI() {
    const loggedInEl = document.getElementById('auth-area-loggedin');
    const loggedOutEl = document.getElementById('auth-area-loggedout');
    const mobileLoggedOutEl = document.getElementById('mobile-auth-loggedout');

    if (currentUser) {
      if (loggedInEl) {
        loggedInEl.classList.remove('hidden');
        loggedInEl.classList.add('flex');
      }
      if (loggedOutEl) loggedOutEl.classList.add('hidden');
      if (mobileLoggedOutEl) mobileLoggedOutEl.classList.add('hidden');

      const fullnameEl = document.getElementById('user-fullname');
      const dropdownFullname = document.getElementById('dropdown-fullname');
      const dropdownEmail = document.getElementById('dropdown-email');
      const adminBadge = document.getElementById('dropdown-admin-badge');
      const adminLink = document.getElementById('dropdown-admin-link');
      const avatarWrap = document.getElementById('user-avatar-wrap');

      if (fullnameEl) fullnameEl.textContent = currentUser.fullName || '';
      if (dropdownFullname) dropdownFullname.textContent = currentUser.fullName || '';
      if (dropdownEmail) dropdownEmail.textContent = currentUser.email || '';
      if (adminBadge) adminBadge.classList.toggle('hidden', currentUser.role !== 'admin');
      if (adminLink) adminLink.classList.toggle('hidden', currentUser.role !== 'admin');
      if (avatarWrap && currentUser.avatar) {
        avatarWrap.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.fullName}" class="w-full h-full rounded-full object-cover" />`;
      }
    } else {
      if (loggedInEl) {
        loggedInEl.classList.add('hidden');
        loggedInEl.classList.remove('flex');
      }
      if (loggedOutEl) loggedOutEl.classList.remove('hidden');
      if (mobileLoggedOutEl) mobileLoggedOutEl.classList.remove('hidden');
    }

    document.dispatchEvent(new CustomEvent('auth:ready', { detail: { user: currentUser } }));
  }

  // Khởi tạo 1 lần cho mỗi trang: kiểm tra token, load user hiện tại, cập nhật Header.
  function init() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          currentUser = await getCurrentUser();
        } catch (err) {
          localStorage.removeItem('token');
          currentUser = null;
        }
      }
      initialized = true;
      updateHeaderUI();
      return currentUser;
    })();
    return initPromise;
  }

  // Dùng cho các trang cần đăng nhập (giống PrivateRoute.tsx)
  async function requireAuth() {
    await init();
    if (!currentUser) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }

  // Dùng cho các trang admin (giống AdminRoute.tsx)
  async function requireAdmin() {
    await init();
    if (!currentUser) {
      window.location.href = '/login';
      return false;
    }
    if (currentUser.role !== 'admin') {
      window.location.href = '/';
      return false;
    }
    return true;
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    init,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    getUser,
    requireAuth,
    requireAdmin,
    updateHeaderUI,
  };
})();
