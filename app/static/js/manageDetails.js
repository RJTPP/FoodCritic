
import { fetchWithOutAuth, fetchWithAuth, createProfilePlaceholder } from "/static/js/utils.js";

function getRestaurantId() {
    return document.URL.split('/').pop();
}

const restaurantId = getRestaurantId();

document.addEventListener('DOMContentLoaded', function () {
    loadCategories();
    loadRestaurantData();
    loadReviews();
    setupEventListeners();
});

function loadCategories() {
    fetchWithOutAuth("/api/categories").then(categories => {
        const categorySelect = document.getElementById('category-select');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category_id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    });



}

function loadRestaurantData() {
    // Replace mock data with an API call.
    fetchWithAuth(`/api/manage/${restaurantId}`)
        .then(restaurant => {
            populateRestaurantForm(restaurant);
            updateStatistics(restaurant);
            updateCategorySelect(restaurant);
        })
        .catch(error => {
            console.error("Error fetching restaurant data:", error);
        });
}

function populateRestaurantForm(restaurant) {
    // Set form values based on API response
    document.getElementById('restaurant-name').value = restaurant.name;
    document.getElementById('restaurant-address').value = restaurant.address;
    document.getElementById('category-select').value = restaurant.category ? restaurant.category.toLowerCase() : "";
    document.getElementById('restaurant-description').value = restaurant.description;


    // Update breadcrumb
    document.getElementById('restaurant-name-breadcrumb').textContent = restaurant.name;

    // Update image preview if available
    if (restaurant.picture_url) {
        document.getElementById('image-preview').src = restaurant.picture_url;
        document.getElementById('image-preview-container').classList.remove('hidden');
        document.getElementById('upload-icon-container').classList.add('hidden');
    }
}

function updateCategorySelect(restaurant) {
    const categorySelect = document.getElementById('category-select');
    categorySelect.value = restaurant.category_id;
}

function updateStatistics(restaurant) {
    // Update average rating
    document.getElementById('avg-rating').textContent = restaurant.average_rating ? restaurant.average_rating.toFixed(1) : "0.0";

    // Update star rating visuals
    const avgRatingStars = document.getElementById('avg-star-rating');
    avgRatingStars.innerHTML = generateRatingStars(restaurant.average_rating || 0);

    // Update total reviews and views if available
    document.getElementById('total-reviews').textContent = restaurant.total_reviews || 0;
    // If you have a total views element, update it similarly.

    // Update rating distribution (assuming your API returns an object like rating_distribution)
    const ratingDist = restaurant.rating_distribution || { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
    const totalRatings = Object.values(ratingDist).reduce((sum, count) => sum + count, 0);
    for (let i = 1; i <= 5; i++) {
        const count = ratingDist[i.toString()] || 0;
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
        document.getElementById(`rating-${i}-bar`).style.width = `${percentage}%`;
        document.getElementById(`rating-${i}-count`).textContent = count;
    }
}

function loadReviews() {
    fetchWithOutAuth(`/api/restaurants/${restaurantId}/reviews`)
        .then(reviews => {
            displayReviews(reviews);
        })
        .catch(error => {
            console.error("Error fetching reviews:", error);
        });
}

function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="text-center text-gray-500 py-4">No reviews yet.</p>';
        return;
    }
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'bg-gray-50 p-4 rounded-lg';
        reviewElement.innerHTML = `
            <div class="flex items-start">
            ${createProfilePlaceholder(review.username, 10)}
            <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                <h3 class="text-sm font-semibold text-gray-800">${review.username}</h3>
                <span class="text-xs text-gray-500">${formatDate(review.create_at)}</span>
                </div>
                <div class="flex items-center mb-2 star-rating">
                ${generateRatingStars(review.rating)}
                </div>
                <p class="text-sm text-gray-700">${review.content}</p>
            </div>
            </div>
        `;
        reviewsContainer.appendChild(reviewElement);
    });
}

function generateRatingStars(rating) {
    let html = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
        let className;
        if (i <= fullStars) {
            className = 'fas fa-star filled';
        } else if (i === fullStars + 1 && hasHalfStar) {
            className = 'fas fa-star filled';
        } else {
            className = 'fas fa-star';
        }
        html += `<i class="${className}"></i>`;
    }
    return html;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function setupEventListeners() {
    // Restaurant form submission for updating restaurant details
    document.getElementById('restaurant-form').addEventListener('submit', function (e) {
        // Confirm before saving
        if (!confirm('Are you sure you want to update this restaurant?')) {
            return;
        }
        e.preventDefault();
        saveRestaurantData();
    });

    // Image upload preview (using file input and drag-and-drop)
    const fileInput = document.getElementById('restaurant-image');
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                updateImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    const dropArea = document.querySelector('label[for="restaurant-image"]');
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropArea.classList.add('bg-gray-200');
    });
    dropArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        dropArea.classList.remove('bg-gray-200');
    });
    dropArea.addEventListener('drop', function (e) {
        e.preventDefault();
        dropArea.classList.remove('bg-gray-200');
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            // Update file input for consistency
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            const reader = new FileReader();
            reader.onload = function (event) {
                updateImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('delete-restaurant-btn').addEventListener('click', function () {
        // Confirm before deleting
        if (!confirm('Are you sure you want to delete this restaurant?')) {
            return;
        }
        deleteRestaurant();
    });

}

function updateImagePreview(imageSrc) {
    document.getElementById('image-preview').src = imageSrc;
    document.getElementById('image-preview-container').classList.remove('hidden');
    document.getElementById('upload-icon-container').classList.add('hidden');
}

function saveRestaurantData() {
    const updatedRestaurant = {
        name: document.getElementById('restaurant-name').value,
        address: document.getElementById('restaurant-address').value,
        category_id: parseInt(document.getElementById('category-select').value, 10),
        description: document.getElementById('restaurant-description').value,
        picture_url: document.getElementById('restaurant-image-url').value
    };

    console.log('Updating restaurant:', updatedRestaurant);
    

    fetchWithAuth(`/api/manage/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRestaurant)
    })
        .then(data => {
            // alert('Restaurant details updated successfully!');
            window.location.href = '/manage';
        })
        .catch(error => {
            console.error("Error updating restaurant data:", error);
            alert("Error updating restaurant details.");
        });
}

function deleteRestaurant() {
    fetchWithAuth(`/api/manage/${restaurantId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.status === 204) {
                alert('Restaurant deleted successfully!');
                window.location.href = '/manage';
            }
        })
        .catch(error => {
            console.error("Error deleting restaurant:", error);
            alert("Error deleting restaurant.", error);
        });
}