// Thay thế client/src/pages/Login.tsx
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit-btn');
  const submitLabel = document.getElementById('login-submit-label');
  const toggleBtn = document.getElementById('toggle-password-btn');
  const passwordInput = document.getElementById('login-password-input');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" class="w-5 h-5"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.classList.add('hidden');
      submitBtn.disabled = true;
      submitLabel.textContent = 'Đang đăng nhập...';

      const data = new FormData(form);
      const email = data.get('email');
      const password = data.get('password');

      try {
        await window.Auth.login(email, password);
        window.toast.success('Đăng nhập thành công!');
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        window.location.href = redirect || '/';
      } catch (err) {
        const message = (err.response && err.response.data && err.response.data.message) || 'Email hoặc mật khẩu không đúng';
        errorBox.textContent = message;
        errorBox.classList.remove('hidden');
        submitBtn.disabled = false;
        submitLabel.textContent = 'Đăng nhập';
      }
    });
  }
});
