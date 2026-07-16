// Thay thế client/src/pages/Vehicles.tsx + client/src/context/VehicleContext.tsx
// Đã đổi sang dùng dữ liệu xe tĩnh (window.MOCK_VEHICLES) thay vì gọi API GET /api/vehicles.
window.VehiclesPage = (function () {
  let vehicles = [];
  let loading = false;
  let filters = {};
  let pagination = { page: 1, limit: 9, total: 0, totalPages: 0 };
  let viewMode = 'grid';

  function getFilters() {
    return filters;
  }

  // Lọc + sắp xếp dữ liệu tĩnh dựa theo filters (mô phỏng lại đúng các bộ lọc
  // mà backend gốc hỗ trợ: type, city, brand, seats, minPrice, maxPrice, sortBy)
  function applyFiltersAndSort(all, f) {
    let result = all.filter((v) => {
      if (f.type && v.type !== f.type) return false;
      if (f.city && v.location.city !== f.city) return false;
      if (f.brand && v.brand !== f.brand) return false;
      if (f.seats && String(v.specifications.seats) !== String(f.seats)) return false;
      if (f.minPrice && v.pricePerDay < Number(f.minPrice)) return false;
      if (f.maxPrice && v.pricePerDay > Number(f.maxPrice)) return false;
      return true;
    });

    switch (f.sortBy) {
      case 'price_asc':
        result = result.slice().sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price_desc':
        result = result.slice().sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'rating':
        result = result.slice().sort((a, b) => b.rating.average - a.rating.average);
        break;
      case 'newest':
      default:
        break; // giữ nguyên thứ tự khai báo (mới nhất trước) như dữ liệu mẫu
    }

    return result;
  }

  async function fetchVehicles(newFilters, page = 1) {
    loading = true;
    renderList();

    // Mô phỏng độ trễ mạng nhẹ để giữ nguyên cảm giác loading như khi gọi API thật
    await new Promise((resolve) => setTimeout(resolve, 250));

    try {
      const currentFilters = newFilters || filters;
      const all = window.MOCK_VEHICLES || [];
      const filtered = applyFiltersAndSort(all, currentFilters);

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pagination.limit));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const start = (safePage - 1) * pagination.limit;
      const pageItems = filtered.slice(start, start + pagination.limit);

      vehicles = pageItems;
      pagination = { page: safePage, limit: pagination.limit, total, totalPages };

      if (newFilters) filters = newFilters;
    } catch (err) {
      window.toast.error((err && err.message) || 'Lỗi khi tải danh sách xe');
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

    const listRoot = document.getElementById('vehicles-list-root');
    if (listRoot) {
      const grid = listRoot.querySelector(':scope > div');
      if (grid) {
        if (mode === 'list') {
          grid.classList.remove('sm:grid-cols-2', 'lg:grid-cols-3');
          grid.classList.add('grid-cols-1');
        } else {
          grid.classList.add('sm:grid-cols-2', 'lg:grid-cols-3');
        }
      }
    }
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
