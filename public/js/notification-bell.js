// Thay thế client/src/components/common/NotificationBell.tsx
window.NotificationBell = (function () {
  const TYPE_ICON = {
    vehicle_booked: '🎉',
    booking_cancelled: '❌',
    vehicle_approved: '✅',
    vehicle_rejected: '⚠️',
  };

  let notifications = [];
  let unreadCount = 0;
  let open = false;
  let pollTimer = null;
  let root = null;

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function render() {
    if (!root) return;

    if (!window.Auth.isAuthenticated()) {
      root.innerHTML = '';
      return;
    }

    const badge = unreadCount > 0
      ? `<span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">${unreadCount > 9 ? '9+' : unreadCount}</span>`
      : '';

    let listHtml;
    if (notifications.length === 0) {
      listHtml = `
        <div class="flex flex-col items-center py-10 text-gray-400">
          <i data-lucide="bell" class="w-8 h-8 mb-2 opacity-30"></i>
          <p class="text-sm">Chưa có thông báo nào</p>
        </div>`;
    } else {
      listHtml = notifications.map((n) => {
        const img = n.vehicleId && n.vehicleId.images && n.vehicleId.images[0]
          ? `<img src="${n.vehicleId.images[0]}" alt="" class="w-full h-full object-cover" />`
          : (TYPE_ICON[n.type] || '🔔');
        return `
          <div class="flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${!n.isRead ? 'bg-blue-50/50' : ''}">
            <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-lg">${img}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium leading-snug ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}">${escapeHtml(n.title)}</p>
                ${!n.isRead ? '<span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>' : ''}
              </div>
              <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">${escapeHtml(n.message)}</p>
              <p class="text-xs text-gray-400 mt-1">${new Date(n.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>`;
      }).join('');
    }

    root.innerHTML = `
      <div class="relative">
        <button id="notif-bell-btn" class="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
          <i data-lucide="bell" class="w-5 h-5"></i>
          ${badge}
        </button>
        <div id="notif-dropdown" class="${open ? '' : 'hidden'} absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b">
            <h3 class="font-semibold text-gray-800">Thông báo</h3>
            <button id="notif-close-btn" class="text-gray-400 hover:text-gray-600">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
          <div class="max-h-80 overflow-y-auto">${listHtml}</div>
          ${notifications.length > 0 ? `
          <div class="px-4 py-2 border-t text-center">
            <button id="notif-read-all-btn" class="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mx-auto">
              <i data-lucide="check" class="w-3 h-3"></i> Đánh dấu tất cả đã đọc
            </button>
          </div>` : ''}
        </div>
      </div>`;

    if (window.lucide) window.lucide.createIcons();

    const bellBtn = document.getElementById('notif-bell-btn');
    const closeBtn = document.getElementById('notif-close-btn');
    const readAllBtn = document.getElementById('notif-read-all-btn');

    if (bellBtn) bellBtn.addEventListener('click', handleOpen);
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); open = false; render(); });
    if (readAllBtn) readAllBtn.addEventListener('click', markAllRead);
  }

  async function fetchNotifications() {
    try {
      const res = await window.api.get('/notifications');
      notifications = res.data.data;
      unreadCount = res.data.unreadCount;
      render();
    } catch (e) {
      /* bỏ qua lỗi mạng */
    }
  }

  function markAllRead() {
    window.api.put('/notifications/read-all').then(() => {
      unreadCount = 0;
      notifications = notifications.map((n) => ({ ...n, isRead: true }));
      render();
    }).catch(() => {});
  }

  function handleOpen() {
    const wasOpen = open;
    open = !open;
    if (!wasOpen && unreadCount > 0) markAllRead();
    render();
  }

  function init() {
    root = document.getElementById('notification-bell-root');
    if (!root) return;

    document.addEventListener('click', (e) => {
      if (open && root && !root.contains(e.target)) {
        open = false;
        render();
      }
    });

    document.addEventListener('auth:ready', () => {
      if (window.Auth.isAuthenticated()) {
        fetchNotifications();
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(fetchNotifications, 30000);
      } else {
        if (pollTimer) clearInterval(pollTimer);
        render();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { fetchNotifications };
})();
