// Thay thế client/src/pages/Vehicles.tsx + client/src/context/VehicleContext.tsx
window.VehiclesPage = (function () {
  let vehicles = [];
  let loading = false;
  let filters = {};
  let pagination = { page: 1, limit: 12, total: 0, totalPages: 0 };
  let viewMode = 'grid';

  function getFilters() {
    return filters;
  }

  async function fetchVehicles(newFilters, page = 1) {
    loading = true;
    renderList();

    try {
      const currentFilters = newFilters || filters;
      const params = { ...currentFilters, page, limit: pagination.limit };
      const res = await window.api.get('/vehicles', { params });

      vehicles = res.data.data;
      pagination = res.data.pagination;

      if (newFilters) filters = newFilters;
    } catch (err) {
      window.toast.error(err.message || 'Lỗi khi tải danh sách xe');
    } finally {
      loading = false;
      renderList();
      renderPagination();
      renderTotalLabel();
      if (window.VehicleFilter && document.getElementById('vehicle-filter-root')) {
        window.VehicleFilter.syncFilters(filters);
      }
    }
  }

  function clearFilters() {
    filters = {};
    fetchVehicles({});
  }

  function renderTotalLabel() {
    const el = document.getElementById('vehicles-total-label');
    if (el) el.textContent = `${pagination.total} xe đang có sẵn`;
  }

  function renderList() {
    const root = document.getElementById('vehicles-list-root');
    if (!root) return;

    if (loading) {
      root.innerHTML = window.renderVehicleListSkeleton(6);
    } else if (!vehicles.length) {
      root.innerHTML = window.renderVehicleListEmpty();
    } else {
      root.innerHTML = window.renderVehicleGrid(vehicles);
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function renderPagination() {
    const root = document.getElementById('vehicles-pagination-root');
    if (!root) return;

    if (pagination.totalPages <= 1) {
      root.innerHTML = '';
      return;
    }

    let html = `<button data-page="${pagination.page - 1}" ${pagination.page === 1 ? 'disabled' : ''}
      class="page-btn px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Trước</button>`;

    for (let i = 1; i <= pagination.totalPages; i++) {
      html += `<button data-page="${i}" class="page-btn px-4 py-2 rounded-lg ${pagination.page === i ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}">${i}</button>`;
    }

    html += `<button data-page="${pagination.page + 1}" ${pagination.page === pagination.totalPages ? 'disabled' : ''}
      class="page-btn px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Sau</button>`;

    root.innerHTML = html;
    root.querySelectorAll('.page-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page, 10);
        fetchVehicles(filters, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function setViewMode(mode) {
    viewMode = mode;
    const gridBtn = document.getElementById('view-grid-btn');
    const listBtn = document.getElementById('view-list-btn');
    if (gridBtn) gridBtn.className = `p-2 rounded ${mode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`;
    if (listBtn) listBtn.className = `p-2 rounded ${mode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`;
  }

  function bindUIEvents() {
    const gridBtn = document.getElementById('view-grid-btn');
    const listBtn = document.getElementById('view-list-btn');
    const filterToggleBtn = document.getElementById('toggle-filter-btn');
    const filterSidebar = document.getElementById('filter-sidebar');

    if (gridBtn) gridBtn.addEventListener('click', () => setViewMode('grid'));
    if (listBtn) listBtn.addEventListener('click', () => setViewMode('list'));
    if (filterToggleBtn && filterSidebar) {
      filterToggleBtn.addEventListener('click', () => filterSidebar.classList.toggle('hidden'));
    }
  }

  async function init() {
    bindUIEvents();

    // Đọc query string ?location=... giống searchParams trong Vehicles.tsx
    // (đã sửa lỗi filters cũ: truyền thẳng newFilters vào fetchVehicles thay vì
    // dựa vào setFilters trước đó, vì state không cập nhật đồng bộ).
    const params = new URLSearchParams(window.location.search);
    const city = params.get('location') || '';

    if (window.VehicleFilter) window.VehicleFilter.init();

    if (city) {
      const newFilters = { ...filters, city };
      await fetchVehicles(newFilters);
    } else {
      await fetchVehicles();
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { getFilters, fetchVehicles, clearFilters };
})();
