CREATE TABLE `addresses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`address_line1` varchar(500) NOT NULL,
	`address_line2` varchar(500),
	`city` varchar(100) NOT NULL,
	`province` varchar(100) NOT NULL,
	`postal_code` varchar(10),
	`is_default` boolean NOT NULL DEFAULT false,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`actor_user_id` int,
	`action` varchar(80) NOT NULL,
	`entity_type` varchar(60) NOT NULL,
	`entity_id` varchar(60),
	`meta` json,
	`ip_address` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `banners` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`subtitle` varchar(500),
	`image_url` varchar(500) NOT NULL,
	`mobile_image_url` varchar(500),
	`link_url` varchar(500),
	`cta_text` varchar(100),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`starts_at` timestamp,
	`ends_at` timestamp,
	CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`logo_url` varchar(500),
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` varchar(100),
	`product_id` int NOT NULL,
	`variant_id` int,
	`quantity` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`image_url` varchar(500),
	`parent_id` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`brand_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`image_url` varchar(500),
	`season` varchar(60),
	`source_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `collections_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(60) NOT NULL,
	`description` varchar(255),
	`discount_type` enum('percent','fixed') NOT NULL,
	`discount_value` decimal(10,2) NOT NULL,
	`min_subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
	`usage_limit` int,
	`used_count` int NOT NULL DEFAULT 0,
	`starts_at` timestamp,
	`ends_at` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `email_log` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`to_address` varchar(255) NOT NULL,
	`template` varchar(80) NOT NULL,
	`subject` varchar(255),
	`status` enum('queued','sent','failed','retried') NOT NULL DEFAULT 'queued',
	`attempts` int NOT NULL DEFAULT 0,
	`error_message` varchar(500),
	`related_order_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_verification_tokens` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_verification_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`subscribed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`product_id` int NOT NULL,
	`variant_id` int,
	`product_name` varchar(500) NOT NULL,
	`product_image` varchar(500) NOT NULL,
	`size` varchar(20),
	`color` varchar(50),
	`quantity` int NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`status` varchar(40) NOT NULL,
	`changed_by_user_id` int,
	`note` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`order_number` varchar(50) NOT NULL,
	`status` enum('pending','awaiting_payment','paid','confirmed','processing','shipped','delivered','cancelled','return_requested','returned','refunded') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(10,2) NOT NULL,
	`delivery_charges` decimal(10,2) NOT NULL DEFAULT '0.00',
	`discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`coupon_id` int,
	`coupon_code` varchar(60),
	`total` decimal(10,2) NOT NULL,
	`payment_method` enum('cod','bank_transfer','jazzcash','easypaisa') NOT NULL DEFAULT 'cod',
	`payment_status` enum('pending','awaiting','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`payment_reference` varchar(120),
	`shipping_address_json` json NOT NULL,
	`guest_email` varchar(255),
	`guest_phone` varchar(20),
	`courier` varchar(100),
	`tracking_number` varchar(100),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`image_url` varchar(500) NOT NULL,
	`alt_text` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_primary` boolean NOT NULL DEFAULT false,
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`size` varchar(20),
	`color` varchar(50),
	`color_hex` varchar(7),
	`stock_quantity` int NOT NULL DEFAULT 0,
	`price_adjustment` decimal(10,2) NOT NULL DEFAULT '0.00',
	`sku_suffix` varchar(20),
	`measurement_notes` varchar(500),
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`description` text,
	`short_description` varchar(1000),
	`brand_id` int NOT NULL,
	`category_id` int NOT NULL,
	`collection_id` int,
	`base_price` decimal(10,2) NOT NULL,
	`sale_price` decimal(10,2),
	`sku` varchar(100) NOT NULL,
	`original_product_code` varchar(120),
	`season` varchar(60),
	`source_url` varchar(500),
	`stitch_type` enum('stitched','unstitched'),
	`work_type` enum('print','embroidered','plain','mixed'),
	`piece_count` enum('1-piece','2-piece','3-piece'),
	`fabric` varchar(100),
	`shirt_fabric` varchar(100),
	`trouser_fabric` varchar(100),
	`dupatta_fabric` varchar(100),
	`color` varchar(80),
	`care_instructions` text,
	`occasion` varchar(100),
	`delivery_estimate` varchar(120),
	`return_eligible` boolean NOT NULL DEFAULT true,
	`tax_status` varchar(60),
	`weight_grams` int,
	`shipping_class` varchar(60),
	`video_url` varchar(500),
	`is_featured` boolean NOT NULL DEFAULT false,
	`is_new_arrival` boolean NOT NULL DEFAULT false,
	`is_best_seller` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`publish_status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`stock_quantity` int NOT NULL DEFAULT 0,
	`meta_title` varchar(255),
	`meta_description` varchar(500),
	`canonical_url` varchar(500),
	`social_image_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`user_id` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`is_approved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`phone` varchar(20),
	`role` enum('customer','catalogue_editor','order_manager','admin') NOT NULL DEFAULT 'customer',
	`email_verified_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`product_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`)
);
