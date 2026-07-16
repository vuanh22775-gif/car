// Thay thế client/src/components/vehicles/VehicleFilter.tsx
window.VehicleFilter = (function () {
  const filterOptions = {
    type: [
      { value: 'car', label: 'Ô tô' },
      { value: 'motorbike', label: 'Xe máy' },
    ],
    seats: [2, 4, 5, 7, 9, 16],
    sortBy: [
      { value: 'newest', label: 'Mới nhất' },
      { value: 'price_asc', label: 'Giá thấp đến cao' },
      { value: 'price_desc', label: 'Giá cao đến thấp' },
      { value: 'rating', label: 'Đánh giá cao nhất' },
    ],
  };

  let brands = [];
  let cities = [];
  let isExpanded = true;
  let localFilters = {};
  let root = null;

  function activeCount(filters) {
    return Object.keys(filters).filter((k) => filters[k]).length;
  }

  function render() {
    if (!root) return;
    const filters = window.VehiclesPage.getFilters();

    root.innerHTML = `
      <div class="bg-white rounded-xl shadow-md p-4">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <i data-lucide="filter" class="text-blue-600 w-5 h-5"></i>
            <h3 class="font-semibold">Bộ lọc</h3>
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">${activeCount(filters)}</span>
          </div>
          <button id="filter-toggle-expand" class="text-gray-500 hover:text-gray-700">
            <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-5 h-5"></i>
          </button>
        </div>

        ${isExpanded ? `
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1.5">Sắp xếp theo</label>
            <select id="filter-sortBy" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="">Mặc định</option>
              ${filterOptions.sortBy.map((o) => `<option value="${o.value}" ${localFilters.sortBy === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1.5">Loại xe</label>
            <div class="flex gap-2">
              ${filterOptions.type.map((o) => `<button data-filter-key="type" data-filter-value="${o.value}" class="filter-toggle-btn px-4 py-1.5 rounded-lg text-sm transition ${localFilters.type === o.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">${o.label}</button>`).join('')}
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1.5">Thành phố</label>
            <select id="filter-city" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="">Tất cả</option>
              ${cities.map((c) => `<option value="${c}" ${localFilters.city === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1.5">Thương hiệu</label>
            <select id="filter-brand" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="">Tất cả</option>
              ${brands.map((b) => `<option value="${b}" ${localFilters.brand === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1.5">Số chỗ ngồi</label>
            <div class="flex flex-wrap gap-1.5">
              ${filterOptions.seats.map((s) => `<button data-filter-key="seats" data-filter-value="${s}" class="filter-toggle-btn px-3 py-1 rounded-lg text-sm transition ${String(localFilters.seats) === String(s) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">${s} chỗ</button>`).join('')}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Giá từ</label>
              <input id="filter-minPrice" type="number" placeholder="0" value="${localFilters.minPrice || ''}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Giá đến</label>
              <input id="filter-maxPrice" type="number" placeholder="10,000,000" value="${localFilters.maxPrice || ''}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button id="filter-apply-btn" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">Áp dụng</button>
            <button id="filter-reset-btn" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-1">
              <i data-lucide="x" class="w-4 h-4"></i> Xóa
            </button>
          </div>
        </div>` : ''}
      </div>`;

    if (window.lucide) window.lucide.createIcons();
    bindEvents();
  }

  function bindEvents() {
    const expandBtn = document.getElementById('filter-toggle-expand');
    if (expandBtn) expandBtn.addEventListener('click', () => { isExpanded = !isExpanded; render(); });

    const sortBy = document.getElementById('filter-sortBy');
    if (sortBy) sortBy.addEventListener('change', (e) => setLocal('sortBy', e.target.value));

    const city = document.getElementById('filter-city');
    if (city) city.addEventListener('change', (e) => setLocal('city', e.target.value));

    const brand = document.getElementById('filter-brand');
    if (brand) brand.addEventListener('change', (e) => setLocal('brand', e.target.value));

    const minPrice = document.getElementById('filter-minPrice');
    if (minPrice) minPrice.addEventListener('change', (e) => setLocal('minPrice', e.target.value));

    const maxPrice = document.getElementById('filter-maxPrice');
    if (maxPrice) maxPrice.addEventListener('change', (e) => setLocal('maxPrice', e.target.value));

    document.querySelectorAll('.filter-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.filterKey;
        const value = btn.dataset.filterValue;
        const current = key === 'seats' ? String(localFilters[key]) : localFilters[key];
        setLocal(key, current === value ? '' : value, true);
      });
    });

    const applyBtn = document.getElementById('filter-apply-btn');
    if (applyBtn) applyBtn.addEventListener('click', () => window.VehiclesPage.fetchVehicles(localFilters));

    const resetBtn = document.getElementById('filter-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      localFilters = {};
      window.VehiclesPage.clearFilters();
    });
  }

  function setLocal(key, value, rerender) {
    localFilters = { ...localFilters };
    if (!value) delete localFilters[key];
    else localFilters[key] = value;
    if (rerender) render();
  }

  async function init() {
    root = document.getElementById('vehicle-filter-root');
    if (!root) return;
    localFilters = { ...window.VehiclesPage.getFilters() };

    try {
      const [brandsRes, citiesRes] = await Promise.all([
        window.api.get('/vehicles/brands'),
        window.api.get('/vehicles/cities'),
      ]);
      brands = brandsRes.data.data;
      cities = citiesRes.data.data;
    } catch (err) {
      console.error('Error loading filter options:', err);
    }

    render();
  }

  // Đồng bộ localFilters khi filters global thay đổi từ nơi khác (giống useEffect([filters]))
  function syncFilters(filters) {
    localFilters = { ...filters };
    render();
  }

  return { init, syncFilters };
})();
