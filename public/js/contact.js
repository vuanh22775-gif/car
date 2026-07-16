// Thay thế client/src/pages/Contact.tsx
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const submitLabel = document.getElementById('contact-submit-label');
  const openChatBtn = document.getElementById('open-chat-btn');

  if (openChatBtn) {
    openChatBtn.addEventListener('click', () => window.openChatBot());
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitLabel.textContent = 'Đang gửi...';

      // Không có API contact riêng ở backend gốc -> giữ nguyên hành vi mô phỏng gửi thành công
      await new Promise((resolve) => setTimeout(resolve, 800));

      window.toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm nhất.');
      form.reset();
      submitBtn.disabled = false;
      submitLabel.textContent = 'Gửi tin nhắn';
    });
  }
});
