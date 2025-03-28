import { fetchWithOutAuth } from "./utils.js";


// This will run once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {

    fetchWithOutAuth("/api/categories").then(categories => {
        const cuisineSelect = document.getElementById('category-select');
        categories.forEach(cuisine => {
          const option = document.createElement('option');
          option.value = cuisine.name;
          option.textContent = cuisine.name;
          cuisineSelect.appendChild(option);
        });
    });

    // Render restaurants to the grid
    fetchWithOutAuth("/api/restaurants").then(restaurants => {

        // Render restaurants to the grid
        const restaurantsGrid = document.getElementById('restaurants-grid');
        restaurants.forEach(restaurant => {
            restaurantsGrid.innerHTML += createRestaurantCard(restaurant);
        });

    });

    // Search on Delay
    let typingTimer;
    const typingInterval = 300; // 500ms

    const searchInputElement = document.getElementById('search-input');
    
    searchInputElement.addEventListener('keyup', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            const selectedCategory = document.getElementById('category-select').value;
            const searchInput = searchInputElement.value;
            searchRestaurants(searchInput, selectedCategory);
        }, typingInterval);
    });

    searchInputElement.addEventListener('keydown', function () {
        clearTimeout(typingTimer);
    });

    // Not implemented
    document.getElementById('sort-select').addEventListener('change', function () {
        alert('Sort functionality will be implemented with backend integration');
    });

    document.getElementById('category-select').addEventListener('change', function () {
        const selectedCategory = document.getElementById('category-select').value;
        const searchInput = searchInputElement.value;
        searchRestaurants(searchInput, selectedCategory);
    });

        // Add event listeners for pagination
        document.querySelectorAll('#pagination a').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                alert('Pagination will be implemented with backend integration');
            });
        });

});

// Functions to generate HTML elements
function createRestaurantCard(restaurant) {
    return `
            <div class="restaurant-card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <a href="/restaurants/${restaurant.restaurant_id}">
                    <img class="w-full h-48 object-cover" src="${restaurant.picture_url ? restaurant.picture_url : placeholderUrl}" alt="${restaurant.name}">
                    <div class="p-5">
                        <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900">${restaurant.name}</h5>
                        <div class="flex items-center mb-2">
                        ${generateStarRating(restaurant.average_rating)}
                        <span class="ml-2 text-sm text-gray-600">${restaurant.average_rating} (${restaurant.review_count} reviews)</span>
                        </div>
                        <p class="mb-3 text-sm text-gray-700 line-clamp-2 h-10">${restaurant.description}</p>
                        <div class="flex items-center">
                            <span class="bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-0.5 rounded">${restaurant.category}</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let starsHTML = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<svg class="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
    }

    // Half star
    if (halfStar) {
        starsHTML += '<svg class="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-path="inset(0 50% 0 0)"></path></svg>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
    }

    return starsHTML;
}

function getPriceSymbol(priceRange) {
    switch (priceRange) {
        case 1: return '$';
        case 2: return '$$';
        case 3: return '$$$';
        case 4: return '$$$$';
        default: return '';
    }
}

function searchRestaurants(q, category = 'all') {
    fetchWithOutAuth(`/api/restaurants/?search=${q}`)
        .then(res => {
            const restaurantsGrid = document.getElementById('restaurants-grid');
            const noRestaurantsMessage = document.getElementById('no-restaurants-message');

            let count = 0;
            restaurantsGrid.innerHTML = '';
            res.forEach(restaurant => {
                if (category === 'all' || restaurant.category.toLowerCase() === category.toLowerCase()) {
                    restaurantsGrid.innerHTML += createRestaurantCard(restaurant);
                    count++;
                }
            });

            if (count === 0) {
                noRestaurantsMessage.classList.remove('hidden');
            } else {
                noRestaurantsMessage.classList.add('hidden');
            }
        });
}
