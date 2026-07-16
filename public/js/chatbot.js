// Thay thế client/src/components/chat/ChatBot.tsx + hooks/useChat.ts
window.ChatBot = (function () {
  const quickQuestions = [
    'MOTO có những dịch vụ gì?',
    'Quy trình thuê xe tự lái trên MOTO như thế nào?',
    'Quy trình thuê xe có tài xế trên MOTO như thế nào?',
    'Tôi có xe nhàn rỗi, làm thế nào đăng kí cho thuê với MOTO?',
    'Làm thế nào khi cần hỗ trợ nhanh về dịch vụ?',
  ];

  let messages = [];
  let loading = false;
  let sessionId = localStorage.getItem('chatSessionId');
  let container = null;

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function bubble(msg) {
    const isUser = msg.sender === 'user';
    return `
      <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[80%] p-3 rounded-lg ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'}">
          ${!isUser ? '<div class="flex items-center gap-1 mb-1"><i data-lucide="bot" class="w-3.5 h-3.5 text-blue-600"></i><span class="text-xs font-medium text-blue-600">Mia</span></div>' : ''}
          <p class="text-sm whitespace-pre-line">${escapeHtml(msg.message)}</p>
          <span class="text-xs opacity-70 mt-1 block">${new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>`;
  }

  function render() {
    if (!container) return;

    const messagesHtml = messages.length === 0
      ? `<div class="text-center py-8 text-gray-500">
          <i data-lucide="bot" class="w-12 h-12 mx-auto mb-3 text-blue-400"></i>
          <p class="text-sm">Xin chào! Tôi là Mia, trợ lý của MOTO.</p>
          <p class="text-sm">Tôi có thể giúp gì cho bạn?</p>
        </div>`
      : messages.map(bubble).join('');

    const loadingHtml = loading ? `
      <div class="flex justify-start">
        <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.1s"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.2s"></span>
          </div>
        </div>
      </div>` : '';

    const quickHtml = messages.length < 2 ? `
      <div class="p-3 border-t border-gray-200 bg-gray-50">
        <p class="text-xs text-gray-500 mb-2">Câu hỏi gợi ý:</p>
        <div class="flex flex-wrap gap-2">
          ${quickQuestions.map((q, i) => `<button data-quick-q="${i}" class="quick-q-btn text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:bg-blue-50 hover:border-blue-300 transition">${escapeHtml(q)}</button>`).join('')}
        </div>
      </div>` : '';

    container.innerHTML = `
      <div class="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-[90] border border-gray-200">
        <div class="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-2xl">
          <div class="flex items-center gap-2">
            <i data-lucide="bot" class="w-6 h-6"></i>
            <div>
              <h3 class="font-semibold">Chatbot Mia</h3>
              <p class="text-xs opacity-90">Online • Sẵn sàng hỗ trợ</p>
            </div>
          </div>
          <button id="chatbot-close-btn" class="hover:bg-blue-700 p-1 rounded transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div id="chatbot-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          ${messagesHtml}
          ${loadingHtml}
        </div>

        ${quickHtml}

        <div class="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
          <div class="flex gap-2">
            <input id="chatbot-input" type="text" placeholder="Nhập tin nhắn..."
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" ${loading ? 'disabled' : ''} />
            <button id="chatbot-send-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              <i data-lucide="send" class="w-[18px] h-[18px]"></i>
            </button>
          </div>
        </div>
      </div>`;

    if (window.lucide) window.lucide.createIcons();
    bindEvents();
    scrollToBottom();
  }

  function scrollToBottom() {
    const el = document.getElementById('chatbot-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function bindEvents() {
    const closeBtn = document.getElementById('chatbot-close-btn');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send-btn');

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (sendBtn) sendBtn.addEventListener('click', () => handleSend(input ? input.value : ''));
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend(input.value);
        }
      });
    }
    document.querySelectorAll('.quick-q-btn').forEach((btn) => {
      btn.addEventListener('click', () => handleSend(quickQuestions[parseInt(btn.dataset.quickQ, 10)]));
    });
  }

  async function handleSend(text) {
    const message = (text || '').trim();
    if (!message || loading) return;

    const input = document.getElementById('chatbot-input');
    if (input) input.value = '';

    messages.push({ id: Date.now().toString(), sender: 'user', message, timestamp: new Date() });
    loading = true;
    render();

    try {
      const res = await window.api.post('/chat/message', { sessionId, message });
      const { sessionId: newSessionId, response } = res.data.data;

      if (!sessionId) {
        sessionId = newSessionId;
        localStorage.setItem('chatSessionId', newSessionId);
      }

      messages.push({ id: (Date.now() + 1).toString(), sender: 'bot', message: response, timestamp: new Date() });
    } catch (err) {
      messages.push({ id: (Date.now() + 1).toString(), sender: 'bot', message: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.', timestamp: new Date() });
    } finally {
      loading = false;
      render();
    }
  }

  async function loadHistory() {
    if (!sessionId) return;
    loading = true;
    render();
    try {
      const res = await window.api.get('/chat/history', { params: { sessionId } });
      messages = res.data.data;
    } catch (err) {
      /* bỏ qua lỗi */
    } finally {
      loading = false;
      render();
    }
  }

  function open() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'chatbot-root';
      document.body.appendChild(container);
    }
    render();
    loadHistory();
  }

  function close() {
    if (container) {
      container.innerHTML = '';
    }
  }

  return { open, close };
})();

// Hàm tiện ích toàn cục để mở chatbot từ bất kỳ trang nào (nút "Chat với Mia")
window.openChatBot = function () {
  window.ChatBot.open();
};
