USE restaurant_db;

-- Categories Table
CREATE TABLE `categories` (
    `category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (`category_id`)
);

-- Users Table
CREATE TABLE `users` (
    `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `role` ENUM('user', 'owner', 'admin') NOT NULL DEFAULT 'user',
    `create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`)
);

-- Restaurants Table
CREATE TABLE `restaurants` (
    `restaurant_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `picture_url` TEXT NULL,
    `address` TEXT NOT NULL,
    `category_id` INT UNSIGNED NOT NULL,
    `average_rating` DECIMAL(3,2) DEFAULT 0.00,
    `description` TEXT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`restaurant_id`),
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE CASCADE,
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE `reviews` (
    `review_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `restaurant_id` INT UNSIGNED NOT NULL,
    `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
    `comment` TEXT NULL,
    `create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`review_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`restaurant_id`) ON DELETE CASCADE
);

-- Likes Table
CREATE TABLE `likes` (
    `like_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `review_id` INT UNSIGNED NOT NULL,
    `create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`like_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`review_id`) REFERENCES `reviews`(`review_id`) ON DELETE CASCADE,
    CONSTRAINT unique_like UNIQUE (`user_id`, `review_id`) -- Prevent duplicate likes
);

-- Favorites Table
CREATE TABLE `favorites` (
    `favorite_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `restaurant_id` INT UNSIGNED NOT NULL,
    `create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`favorite_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`restaurant_id`) ON DELETE CASCADE,
    CONSTRAINT unique_favorite UNIQUE (`user_id`, `restaurant_id`) -- Prevent duplicate favorites
);

-- Reports Table
CREATE TABLE `reports` (
    `report_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `review_id` INT UNSIGNED NOT NULL,
    `report_reason` TEXT NOT NULL,
    `report_status` ENUM('pending', 'reviewed', 'resolved') NOT NULL DEFAULT 'pending',
    `create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`report_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`review_id`) REFERENCES `reviews`(`review_id`) ON DELETE CASCADE
);

-- Triggers to update average rating when reviews change
DELIMITER $$

CREATE TRIGGER update_average_rating_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET average_rating = COALESCE((
        SELECT AVG(rating) FROM reviews 
        WHERE restaurant_id = NEW.restaurant_id
    ), 0.00)
    WHERE restaurant_id = NEW.restaurant_id;
END$$

CREATE TRIGGER update_average_rating_after_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET average_rating = COALESCE((
        SELECT AVG(rating) FROM reviews 
        WHERE restaurant_id = OLD.restaurant_id
    ), 0.00)
    WHERE restaurant_id = OLD.restaurant_id;
END$$

CREATE TRIGGER update_average_rating_after_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET average_rating = COALESCE((
        SELECT AVG(rating) FROM reviews 
        WHERE restaurant_id = NEW.restaurant_id
    ), 0.00)
    WHERE restaurant_id = NEW.restaurant_id;
END$$

DELIMITER ;

CREATE INDEX idx_restaurant_category ON restaurants (category_id);
CREATE INDEX idx_review_user ON reviews (user_id);
CREATE INDEX idx_review_restaurant ON reviews (restaurant_id);
CREATE INDEX idx_favorites_user ON favorites (user_id);


INSERT INTO categories (name) VALUES
('Chinese'),
('Italian'),
('Japanese'),
('Thai'),
('Buffet'),
('Vegan'),
('Cafe'),
('Fast Food'),
('Barbecue'),
('Seafood'),
('Mexican'),
('Indian'),
('Other')
;