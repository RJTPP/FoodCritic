
import { fetchWithOutAuth, fetchWithAuth, createProfilePlaceholder } from "./utils.js";

document.addEventListener('DOMContentLoaded', function () {
    // Toggle user dropdown
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');
    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', function () {
            userDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', function (event) {
            if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    // Write review form toggle
    const writeReviewButton = document.getElementById('write-review-button');
    const reviewForm = document.getElementById('review-form');
    const cancelReviewButton = document.getElementById('cancel-review-button');

    writeReviewButton.addEventListener('click', function () {
        reviewForm.classList.remove('hidden');
        writeReviewButton.classList.add('hidden');
    });

    cancelReviewButton.addEventListener('click', function () {
        reviewForm.classList.add('hidden');
        writeReviewButton.classList.remove('hidden');
        document.getElementById('review-title').value = '';
        document.getElementById('review-content').value = '';
        resetRatingSelector();
    });

    // Rating selector
    const ratingStars = document.querySelectorAll('#rating-selector i');
    let selectedRating = 0;

    function resetRatingSelector() {
        selectedRating = 0;
        ratingStars.forEach(star => {
            star.className = 'fa-regular fa-star text-2xl cursor-pointer hover:text-amber-300 mr-1';
        });
        // Remove margin from last star
        ratingStars[ratingStars.length - 1].classList.remove('mr-1');
    }

    ratingStars.forEach(star => {
        star.addEventListener('click', function () {
            const rating = parseInt(this.getAttribute('data-rating'));
            selectedRating = rating;
            ratingStars.forEach((s, index) => {
                if (index < rating) {
                    s.className = 'fa-solid fa-star text-2xl cursor-pointer text-amber-300 mr-1';
                } else {
                    s.className = 'fa-regular fa-star text-2xl cursor-pointer hover:text-amber-300 mr-1';
                }
            });
            ratingStars[ratingStars.length - 1].classList.remove('mr-1');
        });
    });

    // Global array to store reviews
    let reviewsList = [];

    // Get restaurant ID from URL (update this function to extract a real ID if needed)
    function getRestaurantId() {
        return document.URL.split('/').pop();
    }

    // Fetch restaurant details from API using fetchWithOutAuth
    function fetchRestaurantData(restaurantId) {
        fetchWithOutAuth(`/api/restaurants/${restaurantId}`)
            .then(restaurant => {
                // console.log(restaurant);
                document.getElementById('restaurant-name').textContent = restaurant.name;
                const breadcrumbElem = document.getElementById('breadcrumb-restaurant-name');
                if (breadcrumbElem) breadcrumbElem.textContent = restaurant.name;
                document.getElementById('restaurant-address').textContent = restaurant.address;
                document.getElementById('restaurant-description').textContent = restaurant.description || "No description available";
                // Use picture_url if available; otherwise, fallback to placeholder
                const restaurantImage = document.getElementById('restaurant-image');
                restaurantImage.src = restaurant.picture_url ? restaurant.picture_url : placeholderURL;
                // Update categories if nested data is available (adjust if your serializer differs)
                const categoriesContainer = document.getElementById('restaurant-categories');
                categoriesContainer.innerHTML = "";
                if (restaurant.category && restaurant.category.name) {
                    const span = document.createElement('span');
                    span.className = "bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm";
                    span.textContent = restaurant.category.name;
                    categoriesContainer.appendChild(span);
                }
                // Update average rating and stars
                document.getElementById('restaurant-rating').textContent = restaurant.average_rating ? restaurant.average_rating.toFixed(1) : "0.0";
                renderStars(document.getElementById('restaurant-stars'), restaurant.average_rating || 0);
            })
            .catch(error => {
                console.error("Error fetching restaurant data:", error);
            });
    }

    // Fetch reviews from API using fetchWithOutAuth
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

    // Submit review handler (combines title and content into comment)
    const submitReviewButton = document.getElementById('submit-review-button');
    submitReviewButton.addEventListener('click', function () {
        const reviewTitle = document.getElementById('review-title').value;
        const reviewContent = document.getElementById('review-content').value;
        if (selectedRating === 0) {
            alert('Please select a rating before submitting');
            return;
        }
        if (!reviewTitle) {
            alert('Please enter a title for your review');
            return;
        }
        const restaurantId = getRestaurantId();
        // Combine title and content as the review comment
        const comment = reviewTitle + "\n\n" + reviewContent;
        const reviewPayload = {
            rating: selectedRating,
            comment: comment
        };

        fetchWithAuth(`/api/restaurants/${restaurantId}/reviews`,
            {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json'
                // },
                body: JSON.stringify(reviewPayload)
            },
            false
        )
            .then(newReview => {
                if (!newReview) {
                    alert("Please sign in to submit a review.");
                    window.location.href = '/signin';
                    return;
                }
                addReview(newReview);
                reviewsList.push(newReview);
                updateRatingSummary();
                alert("Review submitted successfully!");
                reviewForm.classList.add('hidden');
                writeReviewButton.classList.remove('hidden');
                document.getElementById('review-title').value = '';
                document.getElementById('review-content').value = '';
                resetRatingSelector();
                document.getElementById('no-reviews-message').classList.add('hidden');
            })
            .catch(error => {
                if (error.status === 401) {
                    alert("Please log in to submit a review.");
                } else {
                    console.error("Error submitting review:", error);
                    alert("Error submitting review.");
                }
            });
    });

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
    fetchRestaurantData(restaurantId);
    fetchReviews(restaurantId);
});

// Report Modal functionality remains unchanged
document.addEventListener("DOMContentLoaded", function () {
    const reportModal = document.getElementById("reportModal");
    const cancelReport = document.getElementById("cancelReport");
    const submitReport = document.getElementById("submitReport");
    const reportReason = document.getElementById("reportReason");
    let currentReviewId = null;
    document.getElementById("reviews-container").addEventListener("click", function (event) {
        if (event.target.classList.contains("fa-flag")) {
            const reviewElement = event.target.closest(".border-b");
            if (reviewElement) {
                currentReviewId = reviewElement.dataset.reviewId;
                reportModal.classList.remove("hidden");
            }
        }
    });
    cancelReport.addEventListener("click", function () {
        reportModal.classList.add("hidden");
        reportReason.value = "";
    });
    submitReport.addEventListener("click", function () {
        const reason = reportReason.value.trim();
        if (!reason) {
            alert("Please enter a reason for reporting.");
            return;
        }
        // console.log(currentReviewId, reason);

        fetchWithAuth(`/api/reviews/${currentReviewId}/reports`,
            {
                method: 'POST',
                body: JSON.stringify({ report_reason: reason })
            },
            false
        )
            .then(response => {
                if (!response) {
                    alert("Please sign in to submit a report.");
                    window.location.href = '/signin';
                    return;
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                alert("Report submitted successfully.");
                return response.json();
            })
            .catch(error => {
                if (error.status === 401) {
                    alert("Please sign in to submit a report.");
                    window.location.href = '/signin';
                }
                console.error('Error:', error);
            });


        reportModal.classList.add("hidden");
        reportReason.value = "";
    });
});