// Thay thế "react-hot-toast" - toast.success(...) / toast.error(...)
window.toast = (function () {
  function show(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    const base = 'px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-xs animate-fade-in flex items-center gap-2';
    const styles = {
      success: 'bg-white text-gray-800 border-l-4 border-green-500',
      error: 'bg-white text-gray-800 border-l-4 border-red-500',
      info: 'bg-white text-gray-800 border-l-4 border-blue-500',
    };
    el.className = `${base} ${styles[type] || styles.info}`;
    el.innerText = message;
    container.appendChild(el);

    setTimeout(() => {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  return {
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
  };
})();
