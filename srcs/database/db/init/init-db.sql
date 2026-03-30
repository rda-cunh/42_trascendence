USE transcendence_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL DEFAULT NULL,
  status ENUM('Active','Suspended','Banned','Deactivated') NOT NULL DEFAULT 'Active',
  avatar_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users_address (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  users_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(50) NULL DEFAULT NULL,
  street VARCHAR(255) NOT NULL,
  number VARCHAR(255) NULL DEFAULT NULL,
  complement VARCHAR(255) NULL DEFAULT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  postal_code VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL DEFAULT 'PT',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_addresses_users (users_id),
  CONSTRAINT fk_addresses_users FOREIGN KEY (users_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  seller_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL DEFAULT NULL COMMENT 'Product description',
  price DECIMAL(12,2) NOT NULL,
  status ENUM('Draft', 'Active', 'Paused', 'Deleted') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_slug (slug),
  KEY idx_seller_id (seller_id),
  CONSTRAINT fk_product_users FOREIGN KEY (seller_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  image_hash VARCHAR(500),
  display_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_images_product (product_id),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  buyer_id BIGINT UNSIGNED NOT NULL,
  buyer_address_id BIGINT UNSIGNED NULL DEFAULT NULL,
  status ENUM('Pending', 'Paid', 'Done', 'Cancelled', 'Refunded') NOT NULL DEFAULT 'Pending',
  subtotal DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  notes TEXT NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_order_code (code),
  KEY idx_order_buyer (buyer_id),
  CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_id) REFERENCES users (id),
  CONSTRAINT fk_order_address FOREIGN KEY (buyer_address_id) REFERENCES users_address (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL DEFAULT NULL,
  seller_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  qty INT UNSIGNED NOT NULL DEFAULT 1,
  subtotal DECIMAL(12,2),
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  KEY idx_order_items_seller (seller_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id),
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT fk_order_items_seller FOREIGN KEY (seller_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  buyer_id BIGINT UNSIGNED NOT NULL,
  order_items_id BIGINT UNSIGNED NULL DEFAULT NULL,
  review TINYINT UNSIGNED NOT NULL,
  title VARCHAR(150) NULL DEFAULT NULL,
  body TEXT NULL DEFAULT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_review_per_item (order_items_id),
  KEY idx_review_product (product_id),
  KEY idx_review_buyer (buyer_id),
  CONSTRAINT chk_rating CHECK (review BETWEEN 1 AND 5),
  CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT fk_review_buyer FOREIGN KEY (buyer_id) REFERENCES users (id),
  CONSTRAINT fk_review_order_items FOREIGN KEY (order_items_id) REFERENCES order_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(255) NOT NULL,
  method ENUM('Multibanco','Transfer','Paypal','Credit_card', 'Debit_card', 'Other') NOT NULL,
  status ENUM('Pending','Approved','Failed','Refused') NOT NULL DEFAULT 'Pending',
  amount DECIMAL (12,2) NOT NULL,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_order (order_id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
