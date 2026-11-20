// app.js - Asosiy mantiq va interfaollik

let currentCategory = 'all';
let currentBrand = 'all';
let currentSearch = '';
let currentMaxPrice = 150000;
let currentSort = 'popular';
let favorites = JSON.parse(localStorage.getItem('avto_favorites') || '[]');
let compareList = JSON.parse(localStorage.getItem('avto_compare') || '[]');

// DOM yuklangandan so'ng ishga tushish
document.addEventListener('DOMContentLoaded', () => {
  initCarsGrid();
  initCategoryTabs();
  initBrandFilters();
  initSearchAndPriceFilters();
  initLoanCalculator();
  initModals();
  initFavoritesCounter();
  initCompareDrawer();
  initMobileMenu();
  setupHeroFilters();
});

// 1. Avtomobillar ro'yxatini render qilish
function initCarsGrid() {
  renderCars();
  
  // Saralash
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCars();
    });
  }
}

function getFilteredCars() {
  return CARS_DATA.filter(car => {
    // Kategoriya bo'yicha
    if (currentCategory !== 'all' && car.category !== currentCategory) {
      return false;
    }
    // Marka bo'yicha
    if (currentBrand !== 'all' && car.brand.toLowerCase() !== currentBrand.toLowerCase()) {
      return false;
    }
    // Narx bo'yicha
    if (car.price > currentMaxPrice) {
      return false;
    }
    // Qidiruv so'zi bo'yicha
    if (currentSearch.trim() !== '') {
      const q = currentSearch.toLowerCase();
      const match = car.name.toLowerCase().includes(q) || 
                    car.brand.toLowerCase().includes(q) || 
                    car.fuel.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (currentSort === 'price-asc') return a.price - b.price;
    if (currentSort === 'price-desc') return b.price - a.price;
    if (currentSort === 'year-desc') return b.year - a.year;
    return a.id - b.id; // default
  });
}

function renderCars() {
  const container = document.getElementById('cars-grid');
  const countBadge = document.getElementById('cars-count');
  if (!container) return;

  const filtered = getFilteredCars();
  if (countBadge) {
    countBadge.textContent = `${filtered.length} ta avtomobil topildi`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-gray-400 mb-4">
          <i class="fa-solid fa-car-side text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Hech qanday avtomobil topilmadi</h3>
        <p class="text-gray-400 max-w-md mx-auto mb-6">Tanlangan parametrlar bo'yicha mashina topilmadi. Qidiruv parametrlarini o'zgartirib ko'ring.</p>
        <button onclick="resetFilters()" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition text-sm font-semibold">
          Filtrlarni tozalash
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(car => {
    const isFav = favorites.includes(car.id);
    const inCompare = compareList.includes(car.id);

    return `
      <div class="car-card rounded-2xl overflow-hidden flex flex-col group">
        <!-- Rasm qismi -->
        <div class="car-image-container h-52 bg-gray-900 relative">
          <img src="${car.image}" alt="${car.name}" class="w-full h-full object-cover" loading="lazy">
          
          <!-- Badge -->
          <div class="absolute top-3 left-3 flex gap-2">
            <span class="px-3 py-1 text-xs font-bold uppercase rounded-full text-white ${car.badgeColor} shadow-lg shadow-black/40">
              ${car.badge}
            </span>
          </div>

          <!-- Sevimlilar va Taqqoslash tugmalari -->
          <div class="absolute top-3 right-3 flex flex-col gap-2">
            <button onclick="toggleFavorite(${car.id})" class="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md flex items-center justify-center text-white transition ${isFav ? 'text-red-500' : 'text-gray-300'}" title="Sevimlilarga qo'shish">
              <i class="${isFav ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart"></i>
            </button>
            <button onclick="toggleCompare(${car.id})" class="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md flex items-center justify-center transition ${inCompare ? 'text-blue-400' : 'text-gray-300'}" title="Taqqoslashga qo'shish">
              <i class="fa-solid fa-code-compare"></i>
            </button>
          </div>

          <!-- Yili va Yoqilg'i -->
          <div class="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs text-white/90">
            <span class="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm">
              <i class="fa-solid fa-calendar-days mr-1 text-blue-400"></i> ${car.year}-yil
            </span>
            <span class="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm">
              <i class="fa-solid fa-gas-pump mr-1 text-emerald-400"></i> ${car.fuel}
            </span>
          </div>
        </div>

        <!-- Matn qismi -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span class="uppercase tracking-wider font-semibold text-blue-400">${car.brand}</span>
              <span><i class="fa-solid fa-gauge text-gray-500 mr-1"></i>${car.mileage}</span>
            </div>
            
            <h3 class="text-lg font-bold text-white group-hover:text-blue-400 transition mb-3">
              ${car.name}
            </h3>

            <!-- Asosiy parametrlar mini grid -->
            <div class="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-4 bg-gray-900/60 p-2.5 rounded-xl border border-gray-800">
              <div class="flex items-center gap-1.5">
                <i class="fa-solid fa-bolt text-amber-400"></i>
                <span class="truncate">${car.engine}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <i class="fa-solid fa-stopwatch text-rose-400"></i>
                <span>0-100: ${car.acceleration}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <i class="fa-solid fa-route text-sky-400"></i>
                <span class="truncate">${car.range}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <i class="fa-solid fa-gears text-purple-400"></i>
                <span class="truncate">${car.transmission.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          <!-- Narx va harakatlar -->
          <div class="pt-3 border-t border-gray-800/80">
            <div class="flex items-baseline justify-between mb-3">
              <div>
                <span class="text-xs text-gray-400 block">Narxi:</span>
                <span class="text-2xl font-black text-white">$${car.price.toLocaleString()}</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-gray-400 block">Kredit:</span>
                <span class="text-xs font-semibold text-emerald-400">oyiga $${car.monthlyPayment} dan</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button onclick="openCarModal(${car.id})" class="w-full py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                <i class="fa-solid fa-circle-info"></i> Batafsil
              </button>
              <button onclick="openTestDriveModal(${car.id})" class="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-600/30">
                <i class="fa-solid fa-key"></i> Test-drayv
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 2. Kategoriya tablari
function initCategoryTabs() {
  const tabs = document.querySelectorAll('.cat-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
        t.classList.add('bg-gray-800/80', 'text-gray-300');
      });
      tab.classList.remove('bg-gray-800/80', 'text-gray-300');
      tab.classList.add('bg-blue-600', 'text-white', 'shadow-lg');

      currentCategory = tab.dataset.category;
      renderCars();
    });
  });
}

// 3. Marka filtri
function initBrandFilters() {
  const brandPills = document.querySelectorAll('.brand-pill');
  brandPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const selected = pill.dataset.brand;
      if (currentBrand === selected) {
        currentBrand = 'all';
        pill.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-900/30');
      } else {
        brandPills.forEach(p => p.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-900/30'));
        currentBrand = selected;
        pill.classList.add('ring-2', 'ring-blue-500', 'bg-blue-900/30');
      }
      renderCars();
    });
  });
}

// 4. Qidiruv va Narx slayderi
function initSearchAndPriceFilters() {
  const searchInput = document.getElementById('search-cars');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderCars();
    });
  }

  const priceRange = document.getElementById('price-range');
  const priceDisplay = document.getElementById('price-range-display');
  if (priceRange && priceDisplay) {
    priceRange.addEventListener('input', (e) => {
      currentMaxPrice = parseInt(e.target.value);
      priceDisplay.textContent = `$${currentMaxPrice.toLocaleString()}`;
      renderCars();
    });
  }
}

// Hero section filtri
function setupHeroFilters() {
  const heroForm = document.getElementById('hero-filter-form');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const brand = document.getElementById('hero-brand').value;
      const type = document.getElementById('hero-type').value;
      const maxPrice = document.getElementById('hero-price').value;

      currentBrand = brand;
      currentCategory = type;
      if (maxPrice && maxPrice !== 'all') {
        currentMaxPrice = parseInt(maxPrice);
        const priceRange = document.getElementById('price-range');
        const priceDisplay = document.getElementById('price-range-display');
        if (priceRange) priceRange.value = maxPrice;
        if (priceDisplay) priceDisplay.textContent = `$${parseInt(maxPrice).toLocaleString()}`;
      }

      // Update Category tab UI
      const tabs = document.querySelectorAll('.cat-tab-btn');
      tabs.forEach(tab => {
        if (tab.dataset.category === type) {
          tab.classList.remove('bg-gray-800/80', 'text-gray-300');
          tab.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
        } else {
          tab.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
          tab.classList.add('bg-gray-800/80', 'text-gray-300');
        }
      });

      renderCars();

      // Scroll to cars section
      const carsSection = document.getElementById('avtomobillar');
      if (carsSection) {
        carsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

function resetFilters() {
  currentCategory = 'all';
  currentBrand = 'all';
  currentSearch = '';
  currentMaxPrice = 150000;
  currentSort = 'popular';

  const searchInput = document.getElementById('search-cars');
  if (searchInput) searchInput.value = '';

  const priceRange = document.getElementById('price-range');
  const priceDisplay = document.getElementById('price-range-display');
  if (priceRange) priceRange.value = 150000;
  if (priceDisplay) priceDisplay.textContent = '$150,000';

  const tabs = document.querySelectorAll('.cat-tab-btn');
  tabs.forEach((tab, index) => {
    if (index === 0) {
      tab.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
      tab.classList.remove('bg-gray-800/80', 'text-gray-300');
    } else {
      tab.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
      tab.classList.add('bg-gray-800/80', 'text-gray-300');
    }
  });

  const brandPills = document.querySelectorAll('.brand-pill');
  brandPills.forEach(p => p.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-900/30'));

  renderCars();
  showToast("Barcha filtrlar tozalandi", "info");
}

// 5. Kredit Kalkulyatori
function initLoanCalculator() {
  const calcPrice = document.getElementById('calc-price');
  const calcPriceVal = document.getElementById('calc-price-val');
  const calcDown = document.getElementById('calc-down');
  const calcDownVal = document.getElementById('calc-down-val');
  const calcTerm = document.getElementById('calc-term');
  const calcRate = document.getElementById('calc-rate');
  const calcRateVal = document.getElementById('calc-rate-val');

  if (!calcPrice) return;

  function recalculate() {
    const price = parseFloat(calcPrice.value);
    const downPercent = parseFloat(calcDown.value);
    const months = parseInt(calcTerm.value);
    const annualRate = parseFloat(calcRate.value);

    // Displays
    calcPriceVal.textContent = `$${price.toLocaleString()}`;
    calcDownVal.textContent = `${downPercent}% ($${Math.round(price * downPercent / 100).toLocaleString()})`;
    calcRateVal.textContent = `${annualRate}%`;

    const downPayment = price * (downPercent / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = (annualRate / 100) / 12;

    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / months;
    } else {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = downPayment + (monthlyPayment * months);
    const totalInterest = totalPayment - price;

    // Dollar to UZS kursi (taxminiy 12,800 so'm)
    const rateUZS = 12800;

    document.getElementById('res-monthly-usd').textContent = `$${Math.round(monthlyPayment).toLocaleString()}`;
    document.getElementById('res-monthly-uzs').textContent = `~ ${(Math.round(monthlyPayment) * rateUZS).toLocaleString()} so'm / oy`;
    document.getElementById('res-downpayment').textContent = `$${Math.round(downPayment).toLocaleString()}`;
    document.getElementById('res-loan-amount').textContent = `$${Math.round(loanAmount).toLocaleString()}`;
    document.getElementById('res-interest').textContent = `$${Math.round(totalInterest).toLocaleString()}`;
    document.getElementById('res-total').textContent = `$${Math.round(totalPayment).toLocaleString()}`;
  }

  calcPrice.addEventListener('input', recalculate);
  calcDown.addEventListener('input', recalculate);
  calcTerm.addEventListener('change', recalculate);
  calcRate.addEventListener('input', recalculate);

  recalculate();
}

// 6. Sevimlilar (Favorites)
function toggleFavorite(id) {
  const index = favorites.indexOf(id);
  const car = CARS_DATA.find(c => c.id === id);
  if (index === -1) {
    favorites.push(id);
    showToast(`${car.name} sevimlilarga qo'shildi!`, "success");
  } else {
    favorites.splice(index, 1);
    showToast(`${car.name} sevimlilardan o'chirildi!`, "info");
  }
  localStorage.setItem('avto_favorites', JSON.stringify(favorites));
  initFavoritesCounter();
  renderCars();
}

function initFavoritesCounter() {
  const badges = document.querySelectorAll('.fav-badge');
  badges.forEach(badge => {
    badge.textContent = favorites.length;
    if (favorites.length > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

function openFavoritesModal() {
  const modal = document.getElementById('fav-modal');
  const list = document.getElementById('fav-list');
  if (!modal || !list) return;

  const favCars = CARS_DATA.filter(c => favorites.includes(c.id));
  if (favCars.length === 0) {
    list.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <i class="fa-regular fa-heart text-4xl mb-3 text-gray-600"></i>
        <p>Sizda hali saqlangan avtomobillar yo'q.</p>
      </div>
    `;
  } else {
    list.innerHTML = favCars.map(car => `
      <div class="flex items-center gap-4 p-3 bg-gray-850 rounded-xl border border-gray-800">
        <img src="${car.image}" alt="${car.name}" class="w-20 h-16 object-cover rounded-lg">
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-white text-sm truncate">${car.name}</h4>
          <p class="text-xs text-blue-400 font-semibold">$${car.price.toLocaleString()}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="openCarModal(${car.id}); closeModal('fav-modal');" class="p-2 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg text-white">
            <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button onclick="toggleFavorite(${car.id}); openFavoritesModal();" class="p-2 text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  modal.classList.remove('hidden');
}

// 7. Taqqoslash (Compare)
function toggleCompare(id) {
  const car = CARS_DATA.find(c => c.id === id);
  const index = compareList.indexOf(id);
  if (index === -1) {
    if (compareList.length >= 3) {
      showToast("Maksimal 3 ta mashinani taqqoslashingiz mumkin!", "warning");
      return;
    }
    compareList.push(id);
    showToast(`${car.name} taqqoslashga qo'shildi!`, "success");
  } else {
    compareList.splice(index, 1);
    showToast(`${car.name} taqqoslashdan olindi!`, "info");
  }
  localStorage.setItem('avto_compare', JSON.stringify(compareList));
  initCompareDrawer();
  renderCars();
}

function initCompareDrawer() {
  const drawer = document.getElementById('compare-floating-btn');
  const countSpan = document.getElementById('compare-count');
  if (!drawer || !countSpan) return;

  countSpan.textContent = compareList.length;
  if (compareList.length > 0) {
    drawer.classList.remove('hidden');
  } else {
    drawer.classList.add('hidden');
  }
}

function openCompareModal() {
  const modal = document.getElementById('compare-modal');
  const container = document.getElementById('compare-table-content');
  if (!modal || !container) return;

  const cars = CARS_DATA.filter(c => compareList.includes(c.id));
  if (cars.length === 0) {
    showToast("Taqqoslanadigan mashina tanlanmagan!", "warning");
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-gray-300">
        <thead class="bg-gray-900 border-b border-gray-800 text-white">
          <tr>
            <th class="p-4 w-44">Xususiyat</th>
            ${cars.map(c => `
              <th class="p-4 min-w-[220px]">
                <img src="${c.image}" class="w-full h-32 object-cover rounded-xl mb-2">
                <div class="font-bold text-base">${c.name}</div>
                <div class="text-blue-400 font-extrabold text-lg">$${c.price.toLocaleString()}</div>
                <button onclick="toggleCompare(${c.id}); openCompareModal();" class="text-xs text-red-400 hover:underline mt-1">O'chirish</button>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr>
            <td class="p-4 font-semibold text-gray-400">Yili</td>
            ${cars.map(c => `<td class="p-4 font-medium">${c.year}</td>`).join('')}
          </tr>
          <tr>
            <td class="p-4 font-semibold text-gray-400">Yoqilg'i turi</td>
            ${cars.map(c => `<td class="p-4">${c.fuel}</td>`).join('')}
          </tr>
          <tr>
            <td class="p-4 font-semibold text-gray-400">Dvigatel / Quvvat</td>
            ${cars.map(c => `<td class="p-4 font-medium">${c.engine}</td>`).join('')}
          </tr>
          <tr>
            <td class="p-4 font-semibold text-gray-400">Tezlanish (0-100)</td>
            ${cars.map(c => `<td class="p-4 text-emerald-400 font-bold">${c.acceleration}</td>`).join('')}
          </tr>
          <tr>
            <td class="p-4 font-semibold text-gray-400">Maks. tezlik</td>
            ${cars.map(c => `<td class="p-4">${c.maxSpeed}</td>`).join('')}
          </tr>
          <tr>
            <td class="p-4 font-semibold text-gray-400">Zaxira / Bak</td>
            ${cars.map(c => `<td class="p-4">${c.range}</td>`).join('')}
          </tr>
          <tr>
            <td class="p-4 font-semibold text-gray-400">Tortuvchi qism (Privod)</td>
            ${cars.map(c => `<td class="p-4">${c.drive}</td>`).join('')}
          </tr>
          <tr>
            <td class="p-4 font-semibold text-gray-400">Uzatmalar qutisi</td>
            ${cars.map(c => `<td class="p-4">${c.transmission}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  modal.classList.remove('hidden');
}

// 8. Mashina Tafsilotlari Modali (Car Details Modal)
function openCarModal(id) {
  const car = CARS_DATA.find(c => c.id === id);
  if (!car) return;

  const modal = document.getElementById('car-detail-modal');
  const container = document.getElementById('car-detail-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Rasm galereyasi -->
      <div>
        <div class="rounded-2xl overflow-hidden h-72 sm:h-96 bg-gray-900 border border-gray-800 mb-4">
          <img id="detail-main-img" src="${car.gallery[0] || car.image}" alt="${car.name}" class="w-full h-full object-cover">
        </div>
        ${car.gallery.length > 1 ? `
          <div class="grid grid-cols-3 gap-3">
            ${car.gallery.map((img, idx) => `
              <div onclick="document.getElementById('detail-main-img').src='${img}'" class="h-20 rounded-xl overflow-hidden cursor-pointer border border-gray-800 hover:border-blue-500 transition">
                <img src="${img}" class="w-full h-full object-cover">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Ma'lumotlar -->
      <div class="flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold text-white ${car.badgeColor}">${car.badge}</span>
            <span class="text-sm text-gray-400 font-semibold">${car.brand} • ${car.year}</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold text-white mb-3">${car.name}</h2>
          
          <div class="flex items-baseline gap-4 mb-4 pb-4 border-b border-gray-800">
            <div>
              <span class="text-xs text-gray-400 block">Sotuv narxi:</span>
              <span class="text-3xl font-black text-blue-400">$${car.price.toLocaleString()}</span>
            </div>
            <div>
              <span class="text-xs text-gray-400 block">So'mda:</span>
              <span class="text-sm font-semibold text-gray-300">~ ${car.priceUzs} so'm</span>
            </div>
          </div>

          <p class="text-gray-300 text-sm mb-6 leading-relaxed">${car.description}</p>

          <!-- Texnik ko'rsatkichlar jadvali -->
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Texnik parametrlar</h4>
          <div class="grid grid-cols-2 gap-3 text-xs mb-6">
            <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span class="text-gray-400 block">Dvigatel / Quvvat:</span>
              <span class="font-bold text-white">${car.engine}</span>
            </div>
            <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span class="text-gray-400 block">0-100 km/s tezlanish:</span>
              <span class="font-bold text-emerald-400">${car.acceleration}</span>
            </div>
            <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span class="text-gray-400 block">Maksimal tezlik:</span>
              <span class="font-bold text-white">${car.maxSpeed}</span>
            </div>
            <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span class="text-gray-400 block">Zaxira / Bak:</span>
              <span class="font-bold text-white">${car.range}</span>
            </div>
            <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span class="text-gray-400 block">Privod:</span>
              <span class="font-bold text-white">${car.drive}</span>
            </div>
            <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span class="text-gray-400 block">Rang:</span>
              <span class="font-bold text-white">${car.color}</span>
            </div>
          </div>

          <!-- Asosiy qulayliklar -->
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Qulayliklar va opsiyalar</h4>
          <ul class="space-y-1.5 text-xs text-gray-300 mb-6">
            ${car.features.map(f => `
              <li class="flex items-center gap-2">
                <i class="fa-solid fa-circle-check text-blue-400 text-sm"></i> ${f}
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Tugmalar -->
        <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
          <button onclick="closeModal('car-detail-modal'); openTestDriveModal(${car.id});" class="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition">
            <i class="fa-solid fa-calendar-check"></i> Test-drayvga yozilish
          </button>
          <a href="tel:+998712000000" class="py-3 px-5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition">
            <i class="fa-solid fa-phone text-emerald-400"></i> Bog'lanish
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

// 9. Test-Drayv Modali
function openTestDriveModal(carId = null) {
  const modal = document.getElementById('test-drive-modal');
  const select = document.getElementById('td-car-select');
  if (!modal) return;

  if (select) {
    select.innerHTML = CARS_DATA.map(c => `
      <option value="${c.name}" ${carId && c.id === carId ? 'selected' : ''}>
        ${c.name} ($${c.price.toLocaleString()})
      </option>
    `).join('');
  }

  modal.classList.remove('hidden');
}

function handleTestDriveSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('td-name').value;
  const phone = document.getElementById('td-phone').value;
  const car = document.getElementById('td-car-select').value;

  closeModal('test-drive-modal');
  showToast(`Rahmat, ${name}! "${car}" uchun arizangiz qabul qilindi. Tez orada telefoningizga (+998 ${phone}) aloqaga chiqamiz!`, "success");
  e.target.reset();
}

// 10. Modallarni yopish va umumiy boshqarish
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
  }
}

function initModals() {
  // ESC tugmasi bosilganda modallarni yopish
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ['car-detail-modal', 'test-drive-modal', 'compare-modal', 'fav-modal'].forEach(closeModal);
    }
  });

  // Modal orqasiga bosganda yopish
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.closest('.fixed').classList.add('hidden');
      }
    });
  });
}

// 11. Xabar bildirishnomasi (Toast)
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  const icons = {
    success: 'fa-circle-check text-emerald-400',
    info: 'fa-circle-info text-blue-400',
    warning: 'fa-triangle-exclamation text-amber-400',
    error: 'fa-circle-xmark text-rose-400'
  };

  toast.className = `toast glass-panel px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 text-sm text-white mb-2 max-w-sm pointer-events-auto`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-lg"></i>
    <span class="flex-1 font-medium">${message}</span>
    <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-white">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 12. Mobil Menyu
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  const links = menu.querySelectorAll('a');
  links.forEach(l => {
    l.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}
