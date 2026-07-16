// Thay thế client/src/pages/Home.tsx
document.addEventListener('DOMContentLoaded', async function () {
  const root = document.getElementById('featured-vehicles-root');
  const form = document.getElementById('home-search-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const params = new URLSearchParams();
      const location = data.get('location');
      if (location) params.append('location', location);
      window.location.href = `/vehicles?${params.toString()}`;
    });
  }

  if (root) {
    try {
      const vehicles = (window.MOCK_VEHICLES || []).slice(0, 6);
      root.innerHTML = vehicles.length ? window.renderVehicleGrid(vehicles) : window.renderVehicleListEmpty();
    } catch (err) {
      root.innerHTML = '<p class="text-center text-gray-500 py-12">Không thể tải danh sách xe. Vui lòng thử lại.</p>';
    } finally {
      if (window.lucide) window.lucide.createIcons();
    }
  }
});
