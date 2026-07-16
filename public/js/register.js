// Thay thế client/src/pages/Register.tsx
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('register-form');
  const submitBtn = document.getElementById('register-submit-btn');
  const submitLabel = document.getElementById('register-submit-label');

  document.querySelectorAll('.toggle-pw-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" class="w-5 h-5"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const formData = {
        fullName: data.get('fullName'),
        username: data.get('username'),
        email: data.get('email'),
        phone: data.get('phone'),
        password: data.get('password'),
      };
      const confirmPassword = data.get('confirmPassword');

      if (formData.password !== confirmPassword) {
        window.toast.error('Mật khẩu xác nhận không khớp');
        return;
      }

      submitBtn.disabled = true;
      submitLabel.textContent = 'Đang xử lý...';

      try {
        await window.Auth.register(formData);
        window.toast.success('Đăng ký thành công!');
        window.location.href = '/';
      } catch (err) {
        const message = (err.response && err.response.data && err.response.data.message) || 'Đăng ký thất bại';
        window.toast.error(message);
        submitBtn.disabled = false;
        submitLabel.textContent = 'Đăng ký';
      }
    });
  }
});
