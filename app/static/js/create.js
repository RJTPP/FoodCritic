
import { fetchWithOutAuth } from "./utils.js";

document.addEventListener('DOMContentLoaded', function () {
    // Populate category options
    fetchWithOutAuth("/api/categories").then(categories => {
        const categorySelect = document.getElementById('category-select');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category_id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    });

    // Image upload preview handling (not used for submission)
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('preview-container');
    const uploadIcon = document.getElementById('upload-icon');

    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            imagePreview.src = event.target.result;
            previewContainer.classList.remove('hidden');
            uploadIcon.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    imageUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            loadImage(file);
        }
    });

    const dropZone = document.querySelector('label[for="image-upload"]');
    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.classList.add('bg-gray-200');
    });
    dropZone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        dropZone.classList.remove('bg-gray-200');
    });
    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('bg-gray-200');
        const file = e.dataTransfer.files[0];
        if (file) {
            imageUpload.files = e.dataTransfer.files;
            loadImage(file);
        }
    });

    // Handle form submission using only the image URL field
    const restaurantForm = document.getElementById('restaurant-form');
    restaurantForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Gather form data
        const name = document.getElementById('name').value;
        const category_id = document.getElementById('category-select').value;
        const address = document.getElementById('address').value;
        const description = document.getElementById('description').value;
        const imageUrl = document.getElementById('imageUrl').value;

        // Build the request object to match your API schema (RestaurantCreate)
        const formData = {
            name,
            category_id,
            address,
            description,
            picture_url: imageUrl ? imageUrl : null
        };

        console.log('Submitting restaurant:', formData);

        const token = localStorage.getItem("access_token");
        const token_type = localStorage.getItem("token_type");

        if (!token) {
            console.log("No token found. Redirecting to login...");
            window.location.href = "/signin"; // Redirect if token is missing
            return;
        }

        // Send POST request to create the restaurant
        fetch("/api/manage/", {
            method: "POST",
            headers: {
                "Authorization": `${token_type} ${token}`,
                "Content-Type": "application/json"

            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to create restaurant");
                }
                return response.json();
            })
            .then(data => {
                console.log("Created restaurant:", data);
                alert("Restaurant created successfully!");
                window.location.href = '/manage';
            })
            .catch(error => {
                console.error(error);
                alert("Error creating restaurant.");
            });
    });
});
