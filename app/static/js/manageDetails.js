
import { fetchWithOutAuth, fetchWithAuth, createProfilePlaceholder } from "/static/js/utils.js";

function getRestaurantId() {
    return document.URL.split('/').pop();
}

const restaurantId = getRestaurantId();

document.addEventListener('DOMContentLoaded', function () {
    loadCategories();
    loadRestaurantData();
    // loadReviews();
    setupEventListeners();
    
    // Global array to store reviews
    let reviewsList = [];
    function fetchReviews(restaurantId) {
            fetchWithOutAuth(`/api/restaurants/${restaurantId}/reviews`)
                .then(reviews => {
                    reviewsList = []; // Reset reviewsList
                    reviews.forEach(review => {
                        addReview(review);
                        reviewsList.push(review);
                    });
                    updateRatingSummary();
                })
                .catch(error => {
                    console.error("Error fetching reviews:", error);
                });
        }

    
        // Render star ratings for a given container based on rating value
        function renderStars(container, rating) {
            container.innerHTML = '';
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                if (i <= fullStars) {
                    star.className = 'fa-solid fa-star star-filled';
                } else if (i === fullStars + 1 && hasHalfStar) {
                    star.className = 'fa-solid fa-star-half-stroke star-filled';
                } else {
                    star.className = 'fa-regular fa-star star-rating';
                }
                container.appendChild(star);
            }
        }
    
        // Format date to a readable string
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    
        // Function to add a review element to the UI
        function addReview(review) {
    
            const reviewsContainer = document.getElementById('reviews-container');
            const noReviewsMessage = document.getElementById('no-reviews-message');
            if (noReviewsMessage) {
                noReviewsMessage.classList.add('hidden');
            }
            const reviewElement = document.createElement('div');
            reviewElement.className = 'border-b border-gray-200 py-4';
            reviewElement.dataset.reviewId = review.review_id; // Use review_id from the API
            reviewElement.innerHTML = `
                <div class="flex justify-between mb-2">
                <div class="flex items-center">
                    ${createProfilePlaceholder(review.username && review.username ? review.username : '?', 10)}
                    <div>
                    <div class="font-medium">${review.username && review.username ? review.username : 'Anonymous'}</div>
                    <div class="text-sm text-gray-500">${formatDate(review.create_at)}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="text-gray-400 hover:text-red-600">
                    <i class="fa-solid fa-flag cursor-pointer"></i>
                    </button>
                </div>
                </div>
                <div class="flex mb-2" id="review-stars-${review.review_id}"></div>
                <h3 class="font-semibold text-lg mb-2">${review.comment.split("\n\n")[0] || ''}</h3>
                <p class="text-gray-700">${review.comment.split("\n\n")[1] || ''}</p>
            `;
            reviewsContainer.prepend(reviewElement);
            renderStars(document.getElementById(`review-stars-${review.review_id}`), review.rating);
            if (reviewsContainer.children.length > 5) {
                document.getElementById('pagination').classList.remove('hidden');
            }
        }
    
        // Update the rating summary based on current reviewsList
        function updateRatingSummary() {
            if (reviewsList.length === 0) {
                document.getElementById('average-rating').textContent = "0.0";
                document.getElementById('total-reviews').textContent = "0 reviews";
                ['five', 'four', 'three', 'two', 'one'].forEach(star => {
                    const barContainer = document.getElementById(`${star}-star-bar`);
                    const innerBar = barContainer.querySelector("div > div");
                    const percentageSpan = barContainer.querySelector("span:last-child");
                    innerBar.style.width = "0%";
                    percentageSpan.textContent = "0%";
                });
                return;
            }
            let totalRating = 0;
            const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviewsList.forEach(r => {
                totalRating += r.rating;
                ratingCount[r.rating] = (ratingCount[r.rating] || 0) + 1;
            });
            const averageRating = totalRating / reviewsList.length;
            document.getElementById('average-rating').textContent = averageRating.toFixed(1);
            renderStars(document.getElementById('average-stars'), averageRating);
            document.getElementById('total-reviews').textContent = reviewsList.length + " reviews";
    
            function updateBar(star, count) {
                const percentage = (count / reviewsList.length) * 100;
                const barContainer = document.getElementById(`${star}-star-bar`);
                // Use the class selector to get the inner amber bar directly
                const innerBar = barContainer.querySelector(".bg-amber-300");
    
                if (percentage < 4) {
                    innerBar.classList.add("hidden");
                } else {
                    innerBar.classList.remove("hidden");
                }
    
    
                if (innerBar) {
                    innerBar.style.width = percentage + "%";
                }
                const percentageSpan = barContainer.querySelector("span:last-child");
                if (percentageSpan) {
                    percentageSpan.textContent = percentage.toFixed(0) + "%";
                }
            }
    
            updateBar("five", ratingCount[5] || 0);
            updateBar("four", ratingCount[4] || 0);
            updateBar("three", ratingCount[3] || 0);
            updateBar("two", ratingCount[2] || 0);
            updateBar("one", ratingCount[1] || 0);
        }
    
        // Fetch restaurant data and reviews when the page loads
        const restaurantId = getRestaurantId();
        fetchReviews(restaurantId);
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