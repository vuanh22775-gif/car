// Thay thế client/src/services/api.ts (axios instance) bằng fetch thuần.
// Giữ nguyên hành vi: tự gắn Bearer token, tự logout + chuyển /login khi 401.
window.api = (function () {
  const BASE_URL = '/api';

  async function request(method, url, { params, data, headers } = {}) {
    let fullUrl = BASE_URL + url;

    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
      });
      const qs = query.toString();
      if (qs) fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
    }

    const token = localStorage.getItem('token');
    const finalHeaders = { ...(headers || {}) };
    const isFormData = data instanceof FormData;
    if (!isFormData) finalHeaders['Content-Type'] = 'application/json';
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

    const res = await fetch(fullUrl, {
      method,
      headers: finalHeaders,
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    });

    let body = null;
    try {
      body = await res.json();
    } catch (e) {
      body = null;
    }

    if (res.status === 401) {
      localStorage.removeItem('token');
      if (!location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    if (!res.ok) {
      const err = new Error((body && body.message) || `Lỗi ${res.status}`);
      err.response = { status: res.status, data: body };
      throw err;
    }

    return { data: body, status: res.status };
  }

  return {
    get: (url, opts) => request('GET', url, opts),
    post: (url, data, opts) => request('POST', url, { ...opts, data }),
    put: (url, data, opts) => request('PUT', url, { ...opts, data }),
    patch: (url, data, opts) => request('PATCH', url, { ...opts, data }),
    delete: (url, opts) => request('DELETE', url, opts),
  };
})();
