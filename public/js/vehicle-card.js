// Thay thế client/src/components/vehicles/VehicleCard.tsx
window.renderVehicleCard = function (vehicle) {
  const {
    id, name, brand, images, pricePerDay, rating, location,
    specifications, discount, viewCount, type, model,
  } = vehicle;

  const discountedPrice = discount ? pricePerDay * (1 - discount / 100) : pricePerDay;
  const img = (images && images[0]) || '/images/default-car.jpg';

  return `
    <a href="/vehicles/${id}" class="group block">
      <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div class="relative h-48 overflow-hidden bg-gray-200">
          <img src="${img}" alt="${name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ${discount > 0 ? `<span class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold animate-pulse">-${discount}%</span>` : ''}
          <div class="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">${type === 'car' ? '🚗 Ô tô' : '🛵 Xe máy'}</div>
          <div class="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
            <i data-lucide="eye" class="w-[14px] h-[14px]"></i>${viewCount}
          </div>
        </div>

        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="font-semibold text-lg group-hover:text-blue-600 transition line-clamp-1">${brand} ${name}</h3>
              <p class="text-sm text-gray-500">${model}</p>
            </div>
            <div class="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
              <i data-lucide="star" class="text-yellow-500 w-4 h-4" style="fill:currentColor"></i>
              <span class="font-semibold">${rating.average.toFixed(1)}</span>
              <span class="text-gray-400 text-sm">(${rating.count})</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
            <span class="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><i data-lucide="settings" class="w-[14px] h-[14px]"></i>${specifications.transmission}</span>
            <span class="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><i data-lucide="users" class="w-[14px] h-[14px]"></i>${specifications.seats} chỗ</span>
            <span class="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><i data-lucide="fuel" class="w-[14px] h-[14px]"></i>${specifications.fuelType}</span>
          </div>

          <div class="flex items-start gap-1 text-sm text-gray-500 mb-3">
            <i data-lucide="map-pin" class="w-[14px] h-[14px] flex-shrink-0 mt-0.5"></i>
            <span class="line-clamp-1">${location.ward}, ${location.district}, ${location.city}</span>
          </div>

          <div class="flex items-center justify-between border-t pt-3">
            <div>
              ${discount > 0 ? `
                <div>
                  <span class="text-xl font-bold text-blue-600">${discountedPrice.toLocaleString()}đ</span>
                  <span class="text-sm text-gray-400 line-through ml-2">${pricePerDay.toLocaleString()}đ</span>
                </div>` : `<span class="text-xl font-bold text-blue-600">${pricePerDay.toLocaleString()}đ</span>`}
              <span class="text-sm text-gray-500">/ngày</span>
            </div>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">Đặt ngay</button>
          </div>
        </div>
      </div>
    </a>`;
};

// Thay thế client/src/components/vehicles/VehicleList.tsx
window.renderVehicleListSkeleton = function (count) {
  return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${Array.from({ length: count || 6 }).map(() => `
    <div class="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
      <div class="h-48 bg-gray-200"></div>
      <div class="p-4 space-y-3">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>`).join('')}</div>`;
};

window.renderVehicleListEmpty = function () {
  return `
    <div class="text-center py-12">
      <div class="flex justify-center mb-4"><i data-lucide="car" class="text-gray-300 w-16 h-16"></i></div>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy xe</h3>
      <p class="text-gray-500">Vui lòng thử lại với bộ lọc khác</p>
    </div>`;
};

window.renderVehicleGrid = function (vehicles) {
  return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${vehicles.map(window.renderVehicleCard).join('')}</div>`;
};
