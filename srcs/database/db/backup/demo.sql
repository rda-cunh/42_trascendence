-- MySQL dump 10.13  Distrib 8.4.9, for Linux (x86_64)
--
-- Host: localhost    Database: transcendence_db
-- ------------------------------------------------------
-- Server version	8.4.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `listing_id` bigint unsigned NOT NULL,
  `buyer_id` bigint unsigned NOT NULL,
  `seller_id` bigint unsigned NOT NULL,
  `last_message` text,
  `last_message_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_listing` (`listing_id`),
  KEY `idx_conversation_buyer` (`buyer_id`),
  KEY `idx_conversation_seller` (`seller_id`),
  CONSTRAINT `fk_conversation_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversation_listing` FOREIGN KEY (`listing_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversation_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,3,6,5,'Off course!','2026-05-25 19:37:50','2026-05-25 19:36:45'),(2,2,5,4,NULL,NULL,'2026-05-25 19:37:57');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `user_id` bigint unsigned NOT NULL,
  `following_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`following_id`),
  KEY `idx_follows_following` (`following_id`),
  CONSTRAINT `fk_follows_follower` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_follows_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_no_self_follow` CHECK ((`user_id` <> `following_id`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
INSERT INTO `follows` VALUES (3,4,'2026-05-27 21:57:36'),(3,5,'2026-05-27 21:57:42'),(3,6,'2026-05-27 21:57:48'),(5,3,'2026-05-27 21:58:16'),(5,4,'2026-05-27 21:58:03'),(6,3,'2026-05-27 21:57:18'),(6,4,'2026-05-27 21:56:54'),(6,5,'2026-05-27 21:57:11');
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint unsigned NOT NULL,
  `sender_id` bigint unsigned NOT NULL,
  `content` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation` (`conversation_id`),
  KEY `idx_messages_sender` (`sender_id`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,6,'I liked your tree, can I have it in yellow?','2026-05-25 19:37:08',NULL),(2,1,5,'Off course!','2026-05-25 19:37:50',NULL);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `receiver_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `type` varchar(40) NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_recipient_unread` (`receiver_id`,`read_at`,`created_at`),
  KEY `idx_notif_recipient_created` (`receiver_id`,`created_at`),
  KEY `fk_notif_actor` (`actor_id`),
  KEY `fk_notif_product` (`product_id`),
  CONSTRAINT `fk_notif_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notif_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_recipient` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `seller_id` bigint unsigned NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `qty` int unsigned NOT NULL DEFAULT '1',
  `subtotal` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  KEY `idx_order_items_seller` (`seller_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_items_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `buyer_id` bigint unsigned NOT NULL,
  `status` enum('Pending','Paid','Done','Cancelled','Refunded') NOT NULL DEFAULT 'Pending',
  `subtotal` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_code` (`code`),
  KEY `idx_order_buyer` (`buyer_id`),
  CONSTRAINT `fk_order_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `provider` varchar(255) NOT NULL,
  `method` enum('Multibanco','Transfer','Paypal','Credit_card','Debit_card','Other') NOT NULL,
  `status` enum('Pending','Approved','Failed','Refused') NOT NULL DEFAULT 'Pending',
  `amount` decimal(12,2) NOT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `image_hash` varchar(500) DEFAULT NULL,
  `display_order` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'56c39dbf-7b6a-4d6b-a558-1645b67c05a2.png',0,'2026-05-25 19:08:51'),(2,1,'842988a9-564a-4d5e-a252-aa415990682d.png',1,'2026-05-25 19:08:51'),(3,2,'9a242d21-6657-4f49-957c-b0dc33e04c31.png',0,'2026-05-25 19:16:08'),(4,2,'db5bb0e2-f37c-4f24-8e30-9d9376abea9f.png',1,'2026-05-25 19:16:08'),(5,3,'be430af6-2dac-4fd2-bb8b-b441c6fa765e.png',0,'2026-05-25 19:24:05'),(6,4,'ad899ed1-024f-4ac8-a9f6-3692827bf259.png',0,'2026-05-25 19:36:18'),(7,5,'a536bfe9-6c30-4b37-ba3b-c3bf644d1c2d.png',0,'2026-05-27 20:59:13'),(8,6,'fbb08c70-3bc1-4030-8f04-507e43634a4d.png',0,'2026-05-27 21:04:05'),(9,7,'a9e7a596-e8b4-43c1-8b34-fee6558c5de2.png',0,'2026-05-27 21:09:18'),(10,8,'71e50e5a-64e3-48a3-a562-4c8d9ab1267f.png',0,'2026-05-27 21:25:46'),(11,9,'e34ba87b-f642-4a97-8b58-b9a29c49383e.png',0,'2026-05-27 21:29:09'),(12,11,'89ced379-987f-401b-8512-93869b32fc51.png',0,'2026-05-27 21:33:32'),(14,12,'2ad26a1a-2fe3-4e72-a91b-759d05e80a72.png',0,'2026-05-27 21:37:39'),(15,13,'fde7cc4f-f56e-48ef-9947-5f92fee0d6be.png',0,'2026-05-27 21:39:42'),(16,14,'f2e3abe6-4b8b-4190-8001-e6d1a3af8617.png',0,'2026-05-27 21:40:49'),(17,15,'5286d47c-480c-487a-bb68-8920296983e3.png',0,'2026-05-27 21:43:18'),(18,16,'540a29bf-8c2a-4420-a77d-858aab0a55ae.png',0,'2026-05-27 21:44:49'),(19,18,'b1d1c8a5-4c0a-45a7-b386-2556a9243cd6.png',0,'2026-05-27 21:47:43'),(20,19,'9e8f6621-2224-47e3-8025-c52ce36c8ba7.png',0,'2026-05-27 21:48:56'),(21,20,'01b0aedc-45f9-4b99-b9ff-c2ea474fe6ce.png',0,'2026-05-27 21:50:29'),(22,21,'8c820224-2ecf-4861-9f42-4fb37092f4cb.png',0,'2026-05-27 21:51:18'),(23,17,'571b686a-1350-4ca2-bde7-e1169588370c.png',0,'2026-05-27 21:51:57'),(24,10,'43593c21-60cb-45ac-90b4-9553720906b6.png',0,'2026-05-27 21:53:09');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `reviewer_id` bigint unsigned NOT NULL,
  `order_items_id` bigint unsigned DEFAULT NULL,
  `rating` tinyint unsigned NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `body` text,
  `status` enum('Pending','Approved','Rejected','Deleted') NOT NULL DEFAULT 'Approved',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review_per_item` (`order_items_id`),
  KEY `idx_review_product` (`product_id`),
  KEY `idx_review_reviewer` (`reviewer_id`),
  CONSTRAINT `fk_review_order_items` FOREIGN KEY (`order_items_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rating` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seller_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text COMMENT 'Product description',
  `price` decimal(12,2) NOT NULL,
  `images` json DEFAULT NULL,
  `status` enum('Draft','Active','Paused','Deleted') NOT NULL DEFAULT 'Active',
  `avg_rating` decimal(3,2) DEFAULT NULL,
  `review_count` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_slug` (`slug`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_product_status` (`status`),
  CONSTRAINT `fk_product_users` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,3,'Space flow','space-flow','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"A super space flow shader.\",\"code\":\"uniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nvoid main() {\\n    // 1. Center the coordinates so the flow revolves around the middle (from -1.0 to 1.0)\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    \\n    // 2. Accumulate space-time distortion to create a fluid, nebula-like flow\\n    vec2 p = uv;\\n    for (float i = 1.0; i < 5.0; i++) {\\n        vec2 newp = p;\\n        // The sine/cosine layering creates the twisting \\\"flow\\\" effect\\n        newp.x += 0.5 / i * sin(i * p.y + u_time * 0.5);\\n        newp.y += 0.5 / i * cos(i * p.x + u_time * 0.3);\\n        p = newp;\\n    }\\n    \\n    // 3. Map the heavily distorted coordinates to deep cosmic colors \\n    // (Dark purples, deep blues, and subtle magentas)\\n    float r = 0.3 * sin(3.0 * p.x) + 0.2;\\n    float g = 0.1 * sin(3.0 * p.y) + 0.1;\\n    float b = 0.5 * sin(p.x + p.y) + 0.4;\\n    vec3 color = vec3(r, g, b);\\n    \\n    // 4. Add a wandering celestial energy core/star that drifts across the flow\\n    vec2 corePos = vec2(sin(u_time * 0.4) * 0.5, cos(u_time * 0.6) * 0.5);\\n    // Inverse length creates a smooth, infinite radial gradient (glow)\\n    float glow = 0.05 / length(uv - corePos); \\n    \\n    // Mix the star\'s bright cyan/white glow into the dark space background\\n    color += vec3(glow * 0.7, glow * 0.8, glow); \\n    \\n    // 5. Output the final fragment color\\n    gl_FragColor = vec4(color, 1.0);\\n}\"}',5.00,NULL,'Active',NULL,0,'2026-05-25 19:08:51','2026-05-25 19:08:51'),(2,4,'Dithering','dithering','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Psychedelic\",\"code\":\"uniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\n// A branchless, math-only 4x4 Bayer matrix generator.\\n// It returns a threshold value between 0.0 and 0.9375 (15/16) based on pixel coordinates.\\nfloat bayer(vec2 p) {\\n    float a = mod(p.x, 2.0);\\n    float b = mod(p.y, 2.0);\\n    float c = mod(floor(p.x / 2.0), 2.0);\\n    float d = mod(floor(p.y / 2.0), 2.0);\\n    \\n    // Generate a 2x2 matrix pattern: (0, 2, 3, 1)\\n    float bayer2 = (a * 2.0 + b * 3.0) - (a * b * 4.0);\\n    \\n    // Expand the 2x2 pattern into a 4x4 matrix\\n    float bayer4 = bayer2 + 4.0 * ((c * 2.0 + d * 3.0) - (c * d * 4.0));\\n    \\n    return bayer4 / 16.0;\\n}\\n\\nvoid main() {\\n    // 1. Get exact pixel coordinates for the dither grid to lock onto\\n    vec2 fragCoord = v_uv * u_resolution;\\n    \\n    // 2. Generate a smooth, vibrant background to apply the dither to\\n    // We create a shifting holographic orb so there are rich gradients to break up\\n    vec2 centerUv = v_uv - 0.5;\\n    float dist = length(centerUv);\\n    \\n    vec3 smoothColor = 0.5 + 0.5 * cos(u_time + v_uv.xyx * 4.0 + vec3(0.0, 2.0, 4.0));\\n    \\n    // Fade the edges to black (smoothstep) to create depth\\n    smoothColor *= smoothstep(0.7, 0.1, dist);\\n    \\n    // 3. Fetch the dither threshold for this specific pixel location\\n    float threshold = bayer(fragCoord);\\n    \\n    // 4. Quantize (crush) the color palette\\n    // Lower numbers mean fewer colors. \\n    // 1.0 = 1-bit per RGB channel (8 colors total - pure retro)\\n    // 2.0 = 3 levels per channel (27 colors total)\\n    // 3.0 = 2-bit per channel (64 colors total)\\n    float colorDepth = 1.0; \\n    \\n    // Apply the dither threshold and snap the gradient to discrete color bands\\n    vec3 ditheredColor = floor(smoothColor * colorDepth + threshold) / colorDepth;\\n    \\n    // 5. Output the final quantized fragment\\n    gl_FragColor = vec4(ditheredColor, 1.0);\\n}\"}',7.90,NULL,'Active',NULL,0,'2026-05-25 19:16:08','2026-05-25 19:16:08'),(3,5,'Nature','nature','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Breezing!\",\"code\":\"uniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\n// A standard 2D rotation matrix to bend space\\nmat2 rot(float a) {\\n    float s = sin(a), c = cos(a);\\n    return mat2(c, -s, s, c);\\n}\\n\\n// Math formula for a box (used for the trunk)\\nfloat sdBox(vec2 p, vec2 b) {\\n    vec2 d = abs(p) - b;\\n    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);\\n}\\n\\n// Math formula for a circle (used for the leaves)\\nfloat sdCircle(vec2 p, float r) {\\n    return length(p) - r;\\n}\\n\\nvoid main() {\\n    // 1. Center the screen (0,0 is now the middle) and fix the aspect ratio\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    // 2. Draw a simple gradient sky for the background\\n    vec3 color = mix(vec3(0.6, 0.8, 1.0), vec3(0.1, 0.3, 0.7), uv.y * 0.5 + 0.5);\\n    \\n    // 3. WIND MECHANICS\\n    // Calculate how high up the screen we are (0.0 at the ground, 1.0+ at the top)\\n    float heightFactor = max(0.0, uv.y + 0.8); \\n    \\n    // Create an erratic wind pattern by layering two sine waves at different speeds\\n    float windStrength = sin(u_time * 2.0) * 0.5 + sin(u_time * 1.33) * 0.25;\\n    \\n    // The bending becomes stronger the higher up the tree you go (quadratic curve)\\n    float bendAngle = windStrength * 0.15 * (heightFactor * heightFactor); \\n    \\n    // Duplicate our UVs so we only distort the tree, not the sky\\n    vec2 treeUv = uv;\\n    \\n    // Anchor the rotation to the ground (y = -0.8), apply the bend, then reset\\n    treeUv.y += 0.8; \\n    treeUv *= rot(bendAngle);\\n    treeUv.y -= 0.8;\\n    // Add a slight horizontal push for extra realism\\n    treeUv.x -= windStrength * 0.1 * heightFactor;\\n    \\n    // 4. DRAW THE SHAPES USING THE DISTORTED SPACE\\n    // The Trunk (A stretched box)\\n    vec2 trunkUv = treeUv - vec2(0.0, -0.3);\\n    float trunk = sdBox(trunkUv, vec2(0.06, 0.5));\\n    \\n    // The Canopy (Four overlapping circles acting as leaf clumps)\\n    vec2 canopyBase = treeUv - vec2(0.0, 0.4);\\n    float c1 = sdCircle(canopyBase, 0.4);                           // Center mass\\n    float c2 = sdCircle(canopyBase - vec2(-0.25, -0.1), 0.3);       // Left clump\\n    float c3 = sdCircle(canopyBase - vec2(0.25, -0.15), 0.35);      // Right clump\\n    float c4 = sdCircle(canopyBase - vec2(0.0, 0.2), 0.3);          // Top clump\\n    \\n    // Merge the circles together by taking the minimum distance of all four\\n    float canopy = min(min(c1, c2), min(c3, c4));\\n    \\n    // 5. COLORS & BLENDING\\n    // Calculate anti-aliasing to keep the edges smooth regardless of resolution\\n    float aa = 2.0 / u_resolution.y;\\n    \\n    // Trunk Color\\n    vec3 trunkColor = vec3(0.25, 0.15, 0.1);\\n    color = mix(color, trunkColor, smoothstep(aa, -aa, trunk));\\n    \\n    // Leaf Color (with a fake shadow based on the UV position)\\n    vec3 leafColor = vec3(0.1, 0.5, 0.2);\\n    leafColor *= 0.6 + 0.4 * smoothstep(-0.4, 0.4, canopyBase.y - canopyBase.x);\\n    color = mix(color, leafColor, smoothstep(aa, -aa, canopy));\\n    \\n    // Draw the ground line\\n    float ground = uv.y + 0.8;\\n    color = mix(color, vec3(0.05, 0.2, 0.05), smoothstep(aa, -aa, ground));\\n    \\n    // 6. Output to screen\\n    gl_FragColor = vec4(color, 1.0);\\n}\"}',12.99,NULL,'Active',NULL,0,'2026-05-25 19:24:05','2026-05-25 19:24:05'),(4,6,'Matrix','matrix','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Call me Neo!\",\"code\":\"uniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\n// A standard pseudo-random noise function based on dot products\\nfloat random(vec2 p) {\\n    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);\\n}\\n\\nvoid main() {\\n    // 1. Create a uniform grid\\n    vec2 uv = v_uv;\\n    uv.x *= u_resolution.x / u_resolution.y; // Prevent stretching\\n    \\n    // Scale the coordinates up to create the \\\"columns\\\" and \\\"rows\\\"\\n    float columns = 40.0;\\n    uv *= columns;\\n    \\n    // 2. Isolate columns and calculate gravity\\n    float col = floor(uv.x);\\n    \\n    // Give each column a random speed and a random vertical starting offset\\n    float speed = random(vec2(col, 1.0)) * 1.5 + 1.0; \\n    float offset = random(vec2(col, 2.0)) * 100.0;\\n    \\n    // Animate the Y-axis. We subtract uv.y so the streams fall downward.\\n    float yPos = -uv.y + (u_time * speed * 4.0) + offset;\\n    float row = floor(yPos);\\n    \\n    // 3. Generate Procedural \\\"Characters\\\"\\n    // Get the local coordinates *inside* the current cell (0.0 to 1.0)\\n    vec2 cellUv = fract(uv);\\n    \\n    // Subdivide the cell into a 3x3 mini-grid to create pixelated \\\"glyphs\\\"\\n    vec2 miniGrid = floor(cellUv * 3.0);\\n    \\n    // Create a seed based on the specific row and column.\\n    // Adding floor(u_time * 15.0) makes the characters rapidly cycle/flicker.\\n    float charSeed = random(vec2(col, row) + floor(u_time * 15.0));\\n    \\n    // Randomly turn on/off blocks in the 3x3 mini-grid to form a shape\\n    float glyph = step(0.5, random(miniGrid + charSeed));\\n    \\n    // Crop the edges of the cell to add spacing between the characters\\n    glyph *= step(0.1, cellUv.x) * step(cellUv.x, 0.9) * step(0.1, cellUv.y) * step(cellUv.y, 0.9);\\n    \\n    // 4. The Rain Trail (Brightness & Fade)\\n    // Divide the falling streams into repeating chunks (e.g., 20 rows long)\\n    float trailLength = 20.0;\\n    float drop = fract(yPos / trailLength);\\n    \\n    // Extract the leading edge (the \\\"head\\\") of the drop\\n    float head = smoothstep(0.9, 1.0, drop);\\n    \\n    // Create the fading trail that follows the head\\n    float tail = max(0.0, 1.0 - (drop * 1.2));\\n    \\n    // 5. Colors and Blending\\n    vec3 matrixGreen = vec3(0.1, 0.9, 0.3);\\n    vec3 headWhite = vec3(0.8, 1.0, 0.8);\\n    \\n    // Base color: The glyph multiplied by the fading tail and the green hue\\n    vec3 color = matrixGreen * glyph * tail;\\n    \\n    // Flash the leading character bright white\\n    color = mix(color, headWhite * glyph, head);\\n    \\n    // Add a faint background glow to the falling streams for ambiance\\n    color += vec3(0.0, 0.15, 0.0) * tail * 0.3;\\n\\n    // 6. Output to screen\\n    gl_FragColor = vec4(color, 1.0);\\n}\"}',15.99,NULL,'Active',NULL,0,'2026-05-25 19:36:18','2026-05-25 19:36:18'),(5,3,'Interactive Liquid Portal','interactive-liquid-portal','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Fluid dimensional gateway\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\n// 1. FUNÇÕES DE UTILIDADE: Rotação e Ruído Procedural 2D\\nmat2 rot(float a) {\\n    float s = sin(a), c = cos(a);\\n    return mat2(c, -s, s, c);\\n}\\n\\n// Ruído pseudo-aleatório para criar as ondulações do líquido\\nfloat noise(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat smoothNoise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    \\n    float a = noise(i);\\n    float b = noise(i + vec2(1.0, 0.0));\\n    float c = noise(i + vec2(0.0, 1.0));\\n    float d = noise(i + vec2(1.0, 1.0));\\n    \\n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\\n}\\n\\nfloat fbm(vec2 p) {\\n    float v = 0.0;\\n    float amplitude = 0.5;\\n    for (int i = 0; i < 3; i++) {\\n        v += amplitude * smoothNoise(p);\\n        p *= 2.0;\\n        amplitude *= 0.5;\\n    }\\n    return v;\\n}\\n\\nfloat map(vec3 p) {\\n    float tunnel = 1.2 - length(p.xy);\\n    \\n    float angle = atan(p.y, p.x);\\n    float depth = p.z;\\n    \\n    float distortion = fbm(vec2(angle * 2.0, depth - u_time * 1.5)) * 0.25;\\n    \\n    return tunnel - distortion;\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    float uvDist = length(uv);\\n    uv *= rot(sin(u_time * 0.2) * 0.2 * (1.0 - uvDist));\\n\\n    vec3 ro = vec3(0.0, 0.0, 0.0); \\n    vec3 rd = normalize(vec3(uv, 1.0)); \\n    \\n    ro.xy += vec2(sin(u_time * 0.5) * 0.1, cos(u_time * 0.3) * 0.1);\\n    rd.xy *= rot(u_time * 0.05);\\n\\n    float dTravelled = 0.0; \\n    float tMax = 20.0;     \\n    float glow = 0.0;\\n    \\n    for (int i = 0; i < 64; i++) {\\n        vec3 currentPos = ro + rd * dTravelled;\\n        float dScene = map(currentPos);\\n        \\n        glow += exp(-dScene * 4.0) * 0.02;\\n        \\n        if (dScene < 0.001 || dTravelled > tMax) break;\\n        \\n        dTravelled += dScene * 0.5; \\n    }\\n\\n    vec3 finalColor = vec3(0.0);\\n    \\n    if (dTravelled < tMax) {\\n        vec3 hitPos = ro + rd * dTravelled;\\n        \\n        vec2 eps = vec2(0.01, 0.0);\\n        vec3 normal = normalize(vec3(\\n            map(hitPos + eps.xyy) - map(hitPos - eps.xyy),\\n            map(hitPos + eps.yxy) - map(hitPos - eps.yxy),\\n            map(hitPos + eps.yyx) - map(hitPos - eps.yyx)\\n        ));\\n        \\n        vec3 lightDir = normalize(vec3(0.0, 0.0, -1.0)); \\n        float diff = max(0.0, dot(normal, lightDir));\\n        \\n        float fresnel = pow(1.0 - max(0.0, dot(normal, -rd)), 4.0);\\n        \\n        vec3 liquidColor = mix(vec3(0.05, 0.1, 0.4), vec3(0.0, 0.8, 0.7), diff);\\n        \\n        finalColor = liquidColor + vec3(0.5, 0.9, 1.0) * fresnel;\\n        finalColor *= exp(-dTravelled * 0.15);\\n    }\\n    \\n    vec3 portalEnergyColor = vec3(0.6, 0.2, 0.8); \\n    finalColor += glow * vec3(0.2, 0.5, 1.0);\\n    finalColor += portalEnergyColor * (1.0 / (1.0 + uvDist * uvDist * 10.0)) * 0.6;\\n    \\n    finalColor = pow(finalColor, vec3(0.85));\\n\\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',18.99,NULL,'Active',NULL,0,'2026-05-27 20:59:13','2026-05-27 20:59:13'),(6,3,'Procedural Aurora Borealis','procedural-aurora-borealis','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Dynamic northern light waves\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nmat2 rot(float a) {\\n    float s = sin(a), c = cos(a);\\n    return mat2(c, -s, s, c);\\n}\\n\\nfloat noise(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat smoothNoise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    \\n    float a = noise(i);\\n    float b = noise(i + vec2(1.0, 0.0));\\n    float c = noise(i + vec2(0.0, 1.0));\\n    float d = noise(i + vec2(1.0, 1.0));\\n    \\n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\\n}\\n\\nfloat auroraNoise(vec2 p) {\\n    float v = 0.0;\\n    float amplitude = 0.5;\\n    for (int i = 0; i < 3; i++) {\\n        v += amplitude * smoothNoise(vec2(p.x * 0.5, p.y));\\n        p *= 2.1;\\n        amplitude *= 0.5;\\n    }\\n    return v;\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    vec3 skyColor = mix(vec3(0.01, 0.02, 0.05), vec3(0.02, 0.05, 0.1), uv.y * 0.5 + 0.5);\\n    \\n    vec2 auroraUv = uv;\\n    auroraUv.x += sin(auroraUv.y * 1.5 + u_time * 0.2) * 0.2;\\n    \\n    float fbm1 = auroraNoise(auroraUv * 2.0 + vec2(u_time * 0.05, -u_time * 0.02));\\n    float fbm2 = auroraNoise(auroraUv * 3.5 - vec2(u_time * 0.03, u_time * 0.04));\\n    \\n    float beam1 = smoothstep(0.2, 0.6, fbm1) * smoothstep(0.8, 0.5, auroraUv.y + 0.2);\\n    float beam2 = smoothstep(0.3, 0.7, fbm2) * smoothstep(0.6, -0.2, auroraUv.y);\\n    \\n    vec3 colorGreen = vec3(0.1, 0.9, 0.4) * beam1 * 1.3;\\n    vec3 colorPurple = vec3(0.5, 0.1, 0.8) * beam2 * 1.0;\\n    vec3 colorCyan = vec3(0.0, 0.7, 0.9) * (beam1 * beam2) * 1.5;\\n    vec3 finalColor = skyColor + colorGreen + colorPurple + colorCyan;\\n\\n    float starDensity = noise(floor(uv * 150.0));\\n    if (starDensity > 0.993) {\\n        float intensity = noise(floor(uv * 150.0) + vec2(7.0)) * 0.5 + 0.5;\\n        intensity *= sin(u_time * 2.0 + starDensity * 100.0) * 0.3 + 0.7;\\n        finalColor += vec3(intensity) * smoothstep(0.1, -0.5, uv.y);\\n    }\\n    \\n    finalColor = clamp(finalColor, 0.0, 1.0);\\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',5.00,NULL,'Active',NULL,0,'2026-05-27 21:04:05','2026-05-27 21:04:05'),(7,5,'Organic Metaballs','organic-metaballs','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Merging soft organic blobs\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nfloat smin(float a, float b, float k) {\\n    float h = max(k - abs(a - b), 0.0) / k;\\n    return min(a, b) - h * h * h * k * (1.0 / 6.0);\\n}\\n\\nfloat sdCircle(vec2 p, vec2 center, float radius) {\\n    return length(p - center) - radius;\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    vec3 backgroundColor = mix(vec3(0.08, 0.08, 0.18), vec3(0.03, 0.02, 0.08), length(uv) * 0.5);\\n    \\n    vec2 p1 = vec2(sin(u_time * 1.1) * 0.5, cos(u_time * 0.8) * 0.3);\\n    vec2 p2 = vec2(cos(u_time * 1.4) * 0.6, sin(u_time * 0.9) * 0.4);\\n    vec2 p3 = vec2(sin(u_time * 0.7 + 2.0) * 0.4, cos(u_time * 1.2 - 1.0) * 0.5);\\n    vec2 p4 = vec2(cos(u_time * 0.9 - 3.0) * 0.5, sin(u_time * 1.5 + 4.0) * 0.3);\\n    vec2 p5 = vec2(sin(u_time * 1.3) * 0.7, sin(u_time * 0.6) * 0.5);\\n    vec2 p6 = vec2(cos(u_time * 0.5) * 0.3, cos(u_time * 1.7) * 0.4);\\n    \\n    float d1 = sdCircle(uv, p1, 0.22);\\n    float d2 = sdCircle(uv, p2, 0.18);\\n    float d3 = sdCircle(uv, p3, 0.25);\\n    float d4 = sdCircle(uv, p4, 0.15);\\n    float d5 = sdCircle(uv, p5, 0.20);\\n    float d6 = sdCircle(uv, p6, 0.14);\\n    \\n    float k = 0.35;\\n    \\n    float d = smin(d1, d2, k);\\n    d = smin(d, d3, k);\\n    d = smin(d, d4, k);\\n    d = smin(d, d5, k);\\n    d = smin(d, d6, k);\\n    \\n    float aa = 2.0 / u_resolution.y;\\n    float mask = smoothstep(aa, -aa, d);\\n    \\n    vec3 ballColor = mix(vec3(0.95, 0.45, 0.1), vec3(0.0, 0.75, 0.95), uv.x * 0.5 + 0.5);\\n    \\n\\n    float edgeGlow = smoothstep(-0.15, 0.05, d) * mask;\\n    ballColor += vec3(0.3, 0.9, 1.0) * edgeGlow * 0.4;\\n    \\n    ballColor *= 0.6 + 0.4 * smoothstep(-0.2, 0.0, d);\\n    \\n    vec3 finalColor = mix(backgroundColor, ballColor, mask);\\n    \\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',9.99,NULL,'Active',NULL,0,'2026-05-27 21:09:18','2026-05-27 21:09:18'),(8,3,'Galaxy Spiral Shader','galaxy-spiral-shader','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Galactic spiral with particles\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nfloat noise(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat nebulaNoise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    return mix(mix(noise(i), noise(i + vec2(1.0, 0.0)), f.x),\\n               mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), f.x), f.y);\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    float r = length(uv);\\n    float angle = atan(uv.y, uv.x);\\n\\n    float spiralFactor = 5.0; \\n    float spiralAngle = angle + (spiralFactor / (r + 0.15)) - u_time * 0.4;\\n\\n    float arms = sin(spiralAngle * 2.0) * 0.5 + 0.5;\\n    arms *= smoothstep(0.9, 0.1, r);\\n    \\n    vec2 spiralCoord = vec2(cos(spiralAngle), sin(spiralAngle)) * r * 3.0;\\n    float dust = nebulaNoise(spiralCoord + u_time * 0.1) * arms;\\n    \\n    vec3 coreColor = vec3(1.0, 0.95, 0.85) * (1.0 / (r * 7.0 + 0.08));\\n    \\n    vec3 armColor = mix(vec3(0.1, 0.4, 0.9), vec3(0.9, 0.2, 0.6), r * 0.8);\\n    vec3 nebulaColor = armColor * (arms * 0.6 + dust * 0.8);\\n    \\n    vec3 finalColor = coreColor + nebulaColor;\\n    \\n    float starAngle = angle - u_time * 0.08;\\n    vec2 starUV = vec2(cos(starAngle), sin(starAngle)) * r;\\n    float stars = noise(floor(starUV * 120.0));\\n    if (stars > 0.992) {\\n        float blink = noise(floor(starUV * 120.0) + vec2(11.0));\\n        float starIntensity = smoothstep(0.9, 0.2, r) * (sin(u_time * 3.0 + blink * 50.0) * 0.4 + 0.6);\\n        finalColor += vec3(starIntensity * 0.8);\\n    }\\n    \\n    float backgroundStars = noise(floor(uv * 200.0));\\n    if (backgroundStars > 0.996) {\\n        finalColor += vec3(smoothstep(0.3, 0.9, backgroundStars));\\n    }\\n    \\n    finalColor = pow(finalColor, vec3(1.1));\\n    finalColor = clamp(finalColor, 0.0, 1.0);\\n    \\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',20.00,NULL,'Active',NULL,0,'2026-05-27 21:25:46','2026-05-27 21:25:46'),(9,5,'Glassmorphism Distortion','glassmorphism-distortion','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Translucent glass with refraction\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nuniform vec2 u_mouse;\\nvarying vec2 v_uv;\\n\\nfloat hash(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat noise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\\n               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\\n}\\n\\nvoid main() {\\n    vec2 uv = v_uv;\\n    vec2 m = u_mouse / u_resolution;\\n    if(u_mouse == vec2(0.0)) m = vec2(0.5);\\n    \\n    float d = distance(uv * vec2(u_resolution.x / u_resolution.y, 1.0), m * vec2(u_resolution.x / u_resolution.y, 1.0));\\n    float glassMask = smoothstep(0.35, 0.33, d);\\n    \\n    vec3 bg = mix(vec3(0.1, 0.15, 0.3), vec3(0.7, 0.2, 0.5), uv.y * 0.5 + uv.x * 0.5);\\n    bg += vec3(0.2, 0.5, 0.9) * (1.0 - smoothstep(0.0, 0.8, distance(uv, vec2(0.2, 0.8))));\\n    \\n    float blurStrength = 0.04 * glassMask;\\n    vec3 blurred = vec3(0.0);\\n    blurred += mix(vec3(0.1, 0.15, 0.3), vec3(0.7, 0.2, 0.5), (uv.y + noise(uv * 50.0) * blurStrength) * 0.5 + uv.x * 0.5);\\n    blurred += mix(vec3(0.1, 0.15, 0.3), vec3(0.7, 0.2, 0.5), uv.y * 0.5 + (uv.x + noise(uv * 50.0 + 1.0) * blurStrength) * 0.5);\\n    blurred += mix(vec3(0.1, 0.15, 0.3), vec3(0.7, 0.2, 0.5), (uv.y - noise(uv * 50.0 + 2.0) * blurStrength) * 0.5 + uv.x * 0.5);\\n    blurred += mix(vec3(0.1, 0.15, 0.3), vec3(0.7, 0.2, 0.5), uv.y * 0.5 + (uv.x - noise(uv * 50.0 + 3.0) * blurStrength) * 0.5);\\n    blurred *= 0.25;\\n    \\n    vec2 refUV = uv + (uv - m) * 0.08 * glassMask;\\n    vec3 refrColor = mix(vec3(0.1, 0.15, 0.3), vec3(0.7, 0.2, 0.5), refUV.y * 0.5 + refUV.x * 0.5);\\n    \\n    vec3 glassColor = mix(blurred, refrColor, 0.4);\\n    glassColor += vec3(0.12);\\n    \\n    float highlight = smoothstep(0.33, 0.325, d) * smoothstep(0.31, 0.33, d);\\n    glassColor += vec3(0.6) * highlight;\\n    \\n    vec3 finalColor = mix(bg, glassColor, glassMask);\\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',23.00,NULL,'Active',NULL,0,'2026-05-27 21:29:09','2026-05-27 21:29:09'),(10,6,'Fire Ribbon','fire-ribbon','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Flowing animated fire trails\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nfloat hash(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat noise(vec3 p) {\\n    vec2 i = floor(p.xy);\\n    vec2 f = fract(p.xy);\\n    f = f * f * (3.0 - 2.0 * f);\\n    float t = p.z;\\n    float a = mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x);\\n    float b = mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x);\\n    return mix(a, b, f.y) * (0.7 + 0.3 * sin(t));\\n}\\n\\nfloat fbm(vec3 p) {\\n    float v = 0.0;\\n    float amp = 0.5;\\n    for(int i = 0; i < 3; i++) {\\n        v += amp * noise(p);\\n        p.xy *= 2.0;\\n        amp *= 0.5;\\n    }\\n    return v;\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    float n1 = fbm(vec3(uv * 1.5, u_time * 1.2));\\n    float n2 = fbm(vec3(uv * 2.5 + vec2(2.0, 4.0), u_time * 1.8));\\n    \\n    float ribbon = uv.y + sin(uv.x * 2.0 + u_time * 2.5) * 0.25;\\n    ribbon += (n1 - 0.5) * 0.4;\\n    \\n    float thickness = 0.07 + (n2 * 0.06);\\n    float intensity = smoothstep(thickness, 0.0, abs(ribbon));\\n    \\n    intensity = pow(intensity, 2.0);\\n    \\n    vec3 fire = mix(vec3(0.8, 0.1, 0.0), vec3(1.0, 0.5, 0.0), intensity);\\n    fire = mix(fire, vec3(1.0, 0.9, 0.3), pow(intensity, 4.0));\\n    \\n    vec3 bg = vec3(0.03, 0.01, 0.04);\\n    vec3 finalColor = mix(bg, fire, intensity * smoothstep(1.5, -1.5, uv.x));\\n    \\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',14.00,NULL,'Active',NULL,0,'2026-05-27 21:31:39','2026-05-27 21:31:39'),(11,4,'Topographic Map Shader','topographic-map-shader','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Animated topographic contour lines\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nfloat hash(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat noise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\\n               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\\n}\\n\\nfloat fbm(vec2 p) {\\n    float v = 0.0;\\n    float amp = 0.5;\\n    for (int i = 0; i < 4; i++) {\\n        v += amp * noise(p);\\n        p *= 2.0;\\n        amp *= 0.5;\\n    }\\n    return v;\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    vec2 movement = vec2(u_time * 0.04, sin(u_time * 0.02) * 0.05);\\n    float elevation = fbm(uv * 2.5 + movement);\\n    \\n    float lineCount = 18.0;\\n    float val = fract(elevation * lineCount);\\n    \\n    float aa = 1.5 / u_resolution.y;\\n    float thickness = 0.04;\\n    float lines = smoothstep(thickness + aa, thickness, abs(val - 0.5));\\n    \\n    vec3 bg = mix(vec3(0.05, 0.07, 0.11), vec3(0.02, 0.03, 0.05), length(uv) * 0.4);\\n    \\n    vec3 lineColor = mix(vec3(0.0, 0.6, 0.8), vec3(0.2, 0.9, 0.6), elevation);\\n    lineColor += vec3(0.3, 0.4, 0.5) * (1.0 - elevation);\\n    \\n    vec3 finalColor = mix(bg, lineColor, lines * 0.8);\\n    \\n    float shadow = fbm(uv * 2.5 + movement + vec2(0.02, -0.02));\\n    finalColor -= vec3(smoothstep(thickness + 0.1, thickness, abs(fract(shadow * lineCount) - 0.5))) * 0.25 * (1.0 - lines);\\n    \\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',29.00,NULL,'Active',NULL,0,'2026-05-27 21:33:32','2026-05-27 21:33:32'),(12,4,'Cyber Grid Horizon','cyber-grid-horizon','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Infinite futuristic neon grid\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nmat2 rot(float a) {\\n    float s = sin(a), c = cos(a);\\n    return mat2(c, -s, s, c);\\n}\\n\\nfloat hash(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat noise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\\n               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\\n}\\n\\nfloat fbm(vec2 p) {\\n    float v = 0.0;\\n    float amp = 0.5;\\n    for (int i = 0; i < 4; i++) {\\n        v += amp * noise(p);\\n        p *= 2.0;\\n        amp *= 0.5;\\n    }\\n    return v;\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    vec3 col = vec3(0.05, 0.0, 0.1);\\n    \\n    float horizon = -0.1;\\n    \\n    if (uv.y < horizon) {\\n        vec3 rd = normalize(vec3(uv.x, uv.y - horizon, 1.0));\\n        vec3 p = vec3(0.0, 1.0, 0.0) + rd * (-1.0 / rd.y);\\n        \\n        p.z += u_time * 2.0;\\n        \\n        float h = fbm(p.xz * 0.2) * 1.8 * smoothstep(1.5, 6.0, abs(p.x));\\n        \\n        vec2 grid = abs(fract(p.xz) - 0.5) / fwidth(p.xz);\\n        float line2d = min(grid.x, grid.y);\\n        float gridMask = 1.0 - min(line2d, 1.0);\\n        \\n        vec2 edgeX = abs(fract(vec2(p.x, p.z - h)) - 0.5) / fwidth(vec2(p.x, p.z - h));\\n        float mountainLines = 1.0 - min(edgeX.x, 1.0);\\n        \\n        float depth = exp(-length(p.xz) * 0.08);\\n        \\n        vec3 gridCol = mix(vec3(1.0, 0.0, 0.5), vec3(0.0, 1.0, 1.0), sin(p.z * 0.1) * 0.5 + 0.5);\\n        col = mix(col, gridCol, max(gridMask, mountainLines * smoothstep(0.1, 0.5, abs(p.x))) * depth);\\n    } else {\\n        vec2 sunUv = uv - vec2(0.0, horizon + 0.3);\\n        float sunDist = length(sunUv);\\n        \\n        col = mix(vec3(0.02, 0.0, 0.08), vec3(0.4, 0.0, 0.3), (uv.y - horizon));\\n        \\n        if (sunDist < 0.4) {\\n            vec3 sunCol = mix(vec3(1.0, 0.8, 0.0), vec3(1.0, 0.0, 0.4), sunUv.y * 2.5 + 0.5);\\n            \\n            float cut = sin(sunUv.y * 40.0 + u_time * 2.0);\\n            float threshold = sunUv.y * 2.0;\\n            \\n            if (cut < threshold - 0.2) {\\n                col = sunCol;\\n            }\\n        }\\n        col += vec3(1.0, 0.0, 0.5) * (1.0 / (1.0 + sunDist * sunDist * 15.0)) * 0.3;\\n    }\\n    \\n    gl_FragColor = vec4(col, 1.0);\\n}\"}',10.00,NULL,'Active',NULL,0,'2026-05-27 21:36:34','2026-05-27 21:36:34'),(13,6,'Ocean Waves Raymarching','ocean-waves-raymarching','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Procedural ocean with depth\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nmat2 rot(float a) {\\n    float s = sin(a), c = cos(a);\\n    return mat2(c, -s, s, c);\\n}\\n\\nfloat hash(vec2 p) {\\n    return fract(sin(dot(p, vec2(134.1, 217.7))) * 43758.5453);\\n}\\n\\nfloat seaNoise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\\n               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\\n}\\n\\nfloat map(vec3 p) {\\n    vec2 uv = p.xz * 0.6;\\n    float amp = 0.25;\\n    float freq = 1.0;\\n    float h = 0.0;\\n    \\n    for(int i = 0; i < 4; i++) {\\n        vec2 off = vec2(u_time * 1.0, u_time * 0.5) * (float(i) * 0.3 + 0.2);\\n        float n = seaNoise(uv * freq + off);\\n        h += sin(uv.x * freq + u_time + n) * amp;\\n        uv *= rot(1.0);\\n        freq *= 1.8;\\n        amp *= 0.45;\\n    }\\n    return p.y - h;\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    vec3 ro = vec3(0.0, 1.5, u_time * 0.5);\\n    vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, 1.2));\\n    \\n    vec3 sky = mix(vec3(0.5, 0.65, 0.75), vec3(0.1, 0.2, 0.35), rd.y * 0.5 + 0.5);\\n    vec3 sunDir = normalize(vec3(0.5, 0.3, 1.0));\\n    sky += vec3(1.0, 0.9, 0.7) * pow(max(0.0, dot(rd, sunDir)), 32.0) * 0.6;\\n    \\n    float d = 0.0;\\n    float h = 0.0;\\n    bool hit = false;\\n    \\n    for(int i = 0; i < 45; i++) {\\n        vec3 p = ro + rd * d;\\n        h = map(p);\\n        if(abs(h) < 0.002 || d > 25.0) {\\n            if(d <= 25.0) hit = true;\\n            break;\\n        }\\n        d += h * 0.6;\\n    }\\n    \\n    vec3 col = sky;\\n    \\n    if(hit) {\\n        vec3 p = ro + rd * d;\\n        vec2 eps = vec2(0.005, 0.0);\\n        vec3 n = normalize(vec3(\\n            map(p + eps.xyy) - map(p - eps.xyy),\\n            map(p + eps.yxy) - map(p - eps.yxy),\\n            map(p + eps.yyx) - map(p - eps.yyx)\\n        ));\\n        \\n        float diff = max(0.0, dot(n, sunDir));\\n        float fresnel = pow(1.0 - max(0.0, dot(n, -rd)), 5.0);\\n        \\n        vec3 waterCol = mix(vec3(0.01, 0.12, 0.18), vec3(0.05, 0.4, 0.45), diff);\\n        vec3 ref = reflect(rd, n);\\n        vec3 refCol = mix(vec3(0.4, 0.6, 0.75), vec3(1.0, 0.9, 0.8), pow(max(0.0, dot(ref, sunDir)), 16.0));\\n        \\n        col = mix(waterCol, refCol, fresnel * 0.6);\\n        col += vec3(1.0, 0.95, 0.8) * pow(max(0.0, dot(ref, sunDir)), 64.0) * 0.8;\\n        col = mix(col, sky, smoothstep(5.0, 25.0, d));\\n    }\\n    \\n    gl_FragColor = vec4(pow(col, vec3(0.95)), 1.0);\\n}\"}',9.99,NULL,'Active',NULL,0,'2026-05-27 21:39:42','2026-05-27 21:39:42'),(14,6,'Ink in Water','ink-in-water','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Ink dispersing through liquid\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nfloat hash(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat noise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\\n               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\\n}\\n\\nfloat fbm(vec2 p) {\\n    float v = 0.0;\\n    float amp = 0.5;\\n    for(int i = 0; i < 4; i++) {\\n        v += amp * noise(p);\\n        p *= 2.2;\\n        amp *= 0.5;\\n    }\\n    return v;\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    vec2 q = vec2(0.0);\\n    q.x = fbm(uv + vec2(0.0, 0.0) + u_time * 0.15);\\n    q.y = fbm(uv + vec2(5.2, 1.3) + u_time * 0.12);\\n    \\n    vec2 r = vec2(0.0);\\n    r.x = fbm(uv + 4.0 * q + vec2(1.7, 9.2) + u_time * 0.08);\\n    r.y = fbm(uv + 4.0 * q + vec2(8.3, 2.8) + u_time * 0.05);\\n    \\n    float f = fbm(uv + 4.0 * r);\\n    \\n    vec3 baseCol = vec3(0.96, 0.95, 0.93);\\n    \\n    vec3 inkCol1 = vec3(0.1, 0.05, 0.2);\\n    vec3 inkCol2 = vec3(0.75, 0.1, 0.35);\\n    vec3 inkCol3 = vec3(0.0, 0.45, 0.5);\\n    \\n    vec3 inkMix = mix(inkCol1, inkCol2, clamp(length(q), 0.0, 1.0));\\n    inkMix = mix(inkMix, inkCol3, clamp(length(r.x), 0.0, 1.0));\\n    \\n    float mask = smoothstep(0.2, 0.75, f * (1.2 - length(uv) * 0.5));\\n    vec3 finalColor = mix(baseCol, inkMix, mask);\\n    \\n    finalColor -= vec3(0.05) * (1.0 - mask) * fbm(uv * 10.0);\\n    \\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',40.00,NULL,'Active',NULL,0,'2026-05-27 21:40:49','2026-05-27 21:40:49'),(15,5,'Energy Shield Bubble','energy-shield-bubble','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Pulsating translucent energy shield\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nuniform vec2 u_mouse;\\nvarying vec2 v_uv;\\n\\nfloat hexDist(vec2 p) {\\n    p = abs(p);\\n    float c = dot(p, normalize(vec2(1.0, 1.73205)));\\n    return max(c, p.x);\\n}\\n\\nvec4 hexCoords(vec2 uv) {\\n    vec2 r = vec2(1.0, 1.73205);\\n    vec2 h = r * 0.5;\\n    vec2 a = mod(uv, r) - h;\\n    vec2 b = mod(uv - h, r) - h;\\n    vec2 gv = dot(a, a) < dot(b, b) ? a : b;\\n    vec2 id = uv - gv;\\n    return vec4(gv.x, gv.y, id.x, id.y);\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    vec2 m = (u_mouse / u_resolution - 0.5) * 2.0;\\n    m.x *= u_resolution.x / u_resolution.y;\\n    if(u_mouse == vec2(0.0)) m = vec2(sin(u_time) * 0.4, cos(u_time) * 0.3);\\n    \\n    float d = length(uv);\\n    float shieldRadius = 0.75;\\n    \\n    vec3 col = vec3(0.02, 0.01, 0.05);\\n    \\n    if (d < shieldRadius) {\\n        float f = shieldRadius - d;\\n        float edgeGlow = smoothstep(shieldRadius, shieldRadius - 0.12, d);\\n        edgeGlow = pow(edgeGlow, 3.0);\\n        \\n        vec2 shieldUv = uv / shieldRadius;\\n        float z = sqrt(1.0 - dot(shieldUv, shieldUv));\\n        vec3 normal = vec3(shieldUv, z);\\n        \\n        vec4 hc = hexCoords(shieldUv * 12.0 + sin(u_time * 0.2));\\n        float hexGrid = smoothstep(0.03, 0.0, hexDist(hc.xy) - 0.46);\\n        \\n        float pulse = sin(hc.zw.x + hc.zw.y + u_time * 2.0) * 0.5 + 0.5;\\n        vec3 shieldBaseColor = mix(vec3(0.0, 0.4, 1.0), vec3(0.6, 0.0, 1.0), shieldUv.y * 0.5 + 0.5);\\n        \\n        float hitDist = distance(uv, m);\\n        float ripple = sin(hitDist * 30.0 - u_time * 12.0) * 0.5 + 0.5;\\n        float hitImpact = smoothstep(0.6, 0.0, hitDist) * ripple;\\n        \\n        col += shieldBaseColor * edgeGlow * 1.5;\\n        col += shieldBaseColor * hexGrid * (0.15 + pulse * 0.2 + hitImpact * 0.8);\\n        col += vec3(0.7, 0.9, 1.0) * hitImpact * smoothstep(0.5, 0.0, hitDist) * 0.5;\\n        col += vec3(0.5, 0.8, 1.0) * pow(1.0 - normal.z, 4.0) * 0.4;\\n    }\\n    \\n    gl_FragColor = vec4(col, 1.0);\\n}\"}',29.00,NULL,'Active',NULL,0,'2026-05-27 21:43:18','2026-05-27 21:43:18'),(16,5,'Particle Flow Field','particle-flow-field','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Particles following vector fields\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nfloat hash(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat noise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\\n               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\\n}\\n\\nvoid main() {\\n    vec2 uv = v_uv;\\n    vec3 col = vec3(0.03, 0.02, 0.06);\\n    \\n    float cells = 45.0;\\n    vec2 gridUv = uv * cells;\\n    vec2 id = floor(gridUv);\\n    \\n    float accum = 0.0;\\n    \\n    for (int y = -1; y <= 1; y++) {\\n        for (int x = -1; x <= 1; x++) {\\n            vec2 curId = id + vec2(float(x), float(y));\\n            float seed = hash(curId);\\n            \\n            vec2 initPos = vec2(hash(curId * 1.1), hash(curId * 2.3));\\n            \\n            float speed = 0.3 + seed * 0.4;\\n            vec2 pos = initPos;\\n            \\n            for (int step = 0; step < 4; step++) {\\n                float angle = noise(pos * 3.0 + u_time * 0.15) * 6.2831 * 2.0;\\n                pos += vec2(cos(angle), sin(angle)) * speed * 0.12;\\n            }\\n            \\n            vec2 cellCenter = (curId + pos) / cells;\\n            float d = distance(uv, cellCenter);\\n            \\n            float pSize = 0.001 + seed * 0.003;\\n            float pGlow = 0.015 + seed * 0.02;\\n            \\n            accum += smoothstep(pSize + 0.002, pSize, d) * 0.7;\\n            accum += pow(pGlow / max(d, 0.001), 1.2) * 0.06;\\n        }\\n    }\\n    \\n    vec3 pColor = mix(vec3(0.0, 0.9, 0.7), vec3(0.5, 0.1, 1.0), uv.x * 0.4 + uv.y * 0.6);\\n    pColor = mix(pColor, vec3(1.0, 0.4, 0.7), sin(u_time * 0.5) * 0.5 + 0.5);\\n    \\n    col += pColor * accum;\\n    col = clamp(col, 0.0, 1.0);\\n    \\n    gl_FragColor = vec4(col, 1.0);\\n}\"}',34.00,NULL,'Active',NULL,0,'2026-05-27 21:44:49','2026-05-27 21:44:49'),(17,5,'Lava Lamp Shader','lava-lamp-shader','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Organic lava lamp bubbles\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nfloat smin(float a, float b, float k) {\\n    float h = max(k - abs(a - b), 0.0) / k;\\n    return min(a, b) - h * h * h * k * (1.0 / 6.0);\\n}\\n\\nfloat sdCircle(vec2 p, vec2 center, float radius) {\\n    return length(p - center) - radius;\\n}\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n\\n    vec3 bg = mix(vec3(0.05, 0.0, 0.1), vec3(0.15, 0.02, 0.12), uv.y * 0.5 + 0.5);\\n\\n    vec2 p1 = vec2(sin(u_time * 0.5) * 0.15, -0.6 + sin(u_time * 0.4) * 0.2);\\n    vec2 p2 = vec2(cos(u_time * 0.6) * 0.2, 0.5 + cos(u_time * 0.3) * 0.3);\\n    vec2 p3 = vec2(sin(u_time * 0.8) * 0.25, cos(u_time * 0.7) * 0.5);\\n    vec2 p4 = vec2(cos(u_time * 0.4) * 0.1, sin(u_time * 0.9) * 0.6);\\n\\n    float d = sdCircle(uv, p1, 0.35);\\n    d = smin(d, sdCircle(uv, p2, 0.28), 0.45);\\n    d = smin(d, sdCircle(uv, p3, 0.22), 0.45);\\n    d = smin(d, sdCircle(uv, p4, 0.18), 0.45);\\n    d = smin(d, uv.y + 0.95, 0.35);\\n    d = smin(d, 0.95 - uv.y, 0.35);\\n\\n    float aa = 2.0 / u_resolution.y;\\n    float mask = smoothstep(aa, -aa, d);\\n\\n    vec3 lavaCol = mix(vec3(0.9, 0.1, 0.0), vec3(1.0, 0.6, 0.0), uv.y * 0.5 + 0.5);\\n    float glow = smoothstep(-0.2, 0.05, d) * mask;\\n    lavaCol += vec3(1.0, 0.9, 0.3) * glow * 0.6;\\n\\n    vec3 finalColor = mix(bg, lavaCol, mask);\\n    finalColor += vec3(0.8, 0.2, 0.0) * (exp(-abs(d) * 3.0)) * (1.0 - mask) * 0.4;\\n\\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',99.00,NULL,'Active',NULL,0,'2026-05-27 21:46:16','2026-05-27 21:46:16'),(18,5,'Procedural Clouds','procedural-clouds','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Procedurally generated volumetric clouds\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nfloat hash(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nfloat noise(vec2 p) {\\n    vec2 i = floor(p);\\n    vec2 f = fract(p);\\n    f = f * f * (3.0 - 2.0 * f);\\n    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\\n               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\\n}\\n\\nfloat fbm(vec2 p) {\\n    float v = 0.0;\\n    float amp = 0.5;\\n    for (int i = 0; i < 5; i++) {\\n        v += amp * noise(p);\\n        p *= 2.02;\\n        amp *= 0.5;\\n    }\\n    return v;\\n}\\n\\nvoid main() {\\n    vec2 uv = v_uv;\\n    \\n    vec3 skyColor = mix(vec3(0.2, 0.4, 0.75), vec3(0.4, 0.6, 0.9), uv.y);\\n    vec3 sunColor = vec3(1.0, 0.85, 0.7);\\n    \\n    vec2 cloudUV = uv * vec2(3.0, 2.0) + vec2(u_time * 0.03, 0.0);\\n    float dens = fbm(cloudUV);\\n    dens = smoothstep(0.35, 0.75, dens * (uv.y * 0.4 + 0.6));\\n    \\n    vec2 lightOff = vec2(0.01, 0.01);\\n    float densOff = fbm(cloudUV + lightOff);\\n    float shadow = smoothstep(0.0, 0.1, dens - densOff);\\n    \\n    vec3 cloudColor = mix(vec3(0.95), vec3(0.6, 0.65, 0.75), shadow);\\n    cloudColor = mix(cloudColor, sunColor, dens * 0.15);\\n    \\n    vec3 finalColor = mix(skyColor, cloudColor, dens);\\n    \\n    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);\\n}\"}',21.00,NULL,'Active',NULL,0,'2026-05-27 21:47:43','2026-05-27 21:47:43'),(19,5,'Infinite Tunnel','infinite-tunnel','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Endless tunnel with depth\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    float r = length(uv);\\n    float angle = atan(uv.y, uv.x);\\n    \\n    float z = 1.0 / max(r, 0.01) + u_time * 1.5;\\n    float repeatAngle = 4.0;\\n    float a = mod(angle * repeatAngle / 3.14159, 1.0);\\n    \\n    float gridX = smoothstep(0.06, 0.0, abs(fract(z) - 0.5));\\n    float gridY = smoothstep(0.08, 0.0, abs(a - 0.5));\\n    float tunnelGrid = max(gridX, gridY);\\n    \\n    vec3 tunnelCol = mix(vec3(0.4, 0.0, 0.8), vec3(0.0, 0.9, 1.0), sin(z * 0.5) * 0.5 + 0.5);\\n    \\n    vec3 finalColor = tunnelCol * tunnelGrid;\\n    finalColor *= smoothstep(0.0, 0.4, r); \\n    \\n    finalColor += vec3(0.1, 0.02, 0.2) * (1.0 - smoothstep(0.0, 0.7, r));\\n    \\n    gl_FragColor = vec4(finalColor, 1.0);\\n}\"}',34.00,NULL,'Active',NULL,0,'2026-05-27 21:48:56','2026-05-27 21:48:56'),(20,4,'Neural Network Visualization','neural-network-visualization','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Animated interactive neural connections\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nfloat hash(vec2 p) {\\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\\n}\\n\\nvoid main() {\\n    vec2 uv = v_uv;\\n    vec3 col = vec3(0.02, 0.02, 0.05);\\n    \\n    float scale = 8.0;\\n    vec2 gUv = uv * scale;\\n    vec2 id = floor(gUv);\\n    \\n    float finalLines = 0.0;\\n    float finalNodes = 0.0;\\n    \\n    for(int y = -1; y <= 1; y++) {\\n        for(int x = -1; x <= 1; x++) {\\n            vec2 curNeighbour = vec2(float(x), float(y));\\n            vec2 curId = id + curNeighbour;\\n            \\n            vec2 randVal = vec2(hash(curId), hash(curId + 5.8));\\n            vec2 nodePos = curId + 0.5 + vec2(sin(u_time * 0.8 + randVal.x * 6.28), cos(u_time * 0.5 + randVal.y * 6.28)) * 0.3;\\n            \\n            float dNode = distance(gUv, nodePos);\\n            finalNodes += smoothstep(0.08, 0.0, dNode);\\n            finalNodes += (0.02 / max(dNode, 0.005)) * 0.4;\\n            \\n            for(int ny = 0; ny <= 1; ny++) {\\n                for(int nx = 0; nx <= 1; nx++) {\\n                    if(nx == 0 && ny == 0) continue;\\n                    vec2 targetId = curId + vec2(float(nx), float(ny));\\n                    vec2 tRandVal = vec2(hash(targetId), hash(targetId + 5.8));\\n                    vec2 targetPos = targetId + 0.5 + vec2(sin(u_time * 0.8 + tRandVal.x * 6.28), cos(u_time * 0.5 + tRandVal.y * 6.28)) * 0.3;\\n                    \\n                    vec2 pa = gUv - nodePos, ba = targetPos - nodePos;\\n                    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);\\n                    float dLine = length(pa - ba * h);\\n                    \\n                    float pulse = sin(h * 4.0 - u_time * 5.0 + hash(curId) * 10.0) * 0.5 + 0.5;\\n                    float lineMask = smoothstep(0.02, 0.0, dLine) * smoothstep(1.8, 0.5, length(ba));\\n                    finalLines += lineMask * (0.2 + pulse * 0.8);\\n                }\\n            }\\n        }\\n    }\\n    \\n    col += vec3(0.0, 0.6, 0.9) * finalLines * 0.6;\\n    col += vec3(0.4, 0.9, 1.0) * finalNodes;\\n    \\n    gl_FragColor = vec4(col, 1.0);\\n}\"}',99.00,NULL,'Active',NULL,0,'2026-05-27 21:50:29','2026-05-27 21:50:29'),(21,4,'Audio Reactive Shader','audio-reactive-shader','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Visuals synchronized with audio\",\"code\":\"precision highp float;\\n\\nuniform float u_time;\\nuniform vec2 u_resolution;\\nuniform sampler2D u_audioTexture;\\nvarying vec2 v_uv;\\n\\nvoid main() {\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    float lowFreq = texture2D(u_audioTexture, vec2(0.05, 0.25)).r;\\n    float midFreq = texture2D(u_audioTexture, vec2(0.45, 0.25)).r;\\n    float highFreq = texture2D(u_audioTexture, vec2(0.85, 0.25)).r;\\n    \\n    if(lowFreq == 0.0 && midFreq == 0.0) {\\n        lowFreq = 0.5 + sin(u_time * 2.0) * 0.2;\\n        midFreq = 0.4 + cos(u_time * 1.5) * 0.15;\\n        highFreq = 0.3 + sin(u_time * 3.0) * 0.1;\\n    }\\n    \\n    float r = length(uv);\\n    float angle = atan(uv.y, uv.x);\\n    \\n    float d = abs(r - (0.4 + lowFreq * 0.25));\\n    \\n    float wave = sin(angle * 12.0 + u_time * 2.0) * (highFreq * 0.04);\\n    d += wave;\\n    \\n    float circleGlow = 0.012 / max(d, 0.001);\\n    circleGlow = pow(circleGlow, 1.1) * smoothstep(0.8, 0.0, d);\\n    \\n    vec3 cCol = mix(vec3(1.0, 0.1, 0.4), vec3(0.0, 0.9, 0.8), sin(angle + u_time) * 0.5 + 0.5);\\n    vec3 col = cCol * circleGlow;\\n    \\n    float barCount = 40.0;\\n    float barIdx = floor(v_uv.x * barCount) / barCount;\\n    float audioVal = texture2D(u_audioTexture, vec2(barIdx * 0.85 + 0.05, 0.25)).r;\\n    if(audioVal == 0.0) audioVal = 0.1 + sin(barIdx * 6.28 + u_time * 3.0) * 0.4 + 0.4;\\n    \\n    float barGridY = fract(v_uv.y * 30.0);\\n    float barMask = step(v_uv.y, audioVal * 0.4 + 0.05) * step(0.15, fract(v_uv.x * barCount)) * step(0.15, barGridY);\\n    \\n    vec3 barCol = mix(vec3(0.0, 0.4, 1.0), vec3(0.3, 1.0, 0.5), v_uv.y * 2.0);\\n    col += barCol * barMask * 0.6;\\n    \\n    col += vec3(0.02, 0.01, 0.05);\\n    gl_FragColor = vec4(col, 1.0);\\n}\"}',39.00,NULL,'Active',NULL,0,'2026-05-27 21:51:18','2026-05-27 21:51:18');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `role` enum('User','Admin') NOT NULL DEFAULT 'User',
  `status` enum('Active','Suspended','Banned','Deactivated') NOT NULL DEFAULT 'Active',
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Leo Vichi','lvichi@email.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225',NULL,'User','Active',NULL,'2026-05-25 19:04:05','2026-05-25 19:04:05'),(3,'Leo Maes','lmaes@email.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','+1 9541234','User','Active',NULL,'2026-05-25 19:04:51','2026-05-25 19:04:51'),(4,'Rapha Campos','rapcampo@email.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','+123456789','User','Active','/images/415bafda-9332-48d4-886e-390762197725.png','2026-05-25 19:09:34','2026-05-25 19:10:17'),(5,'Ricardo Mendes','rda-cunh@email.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','123456789','User','Active',NULL,'2026-05-25 19:17:45','2026-05-25 19:17:45'),(6,'Erik Lustosa','ecarvalh@email.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','123456789','User','Active',NULL,'2026-05-25 19:31:12','2026-05-25 19:32:11'),(7,'System Administrator','admin@admin.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225',NULL,'Admin','Active',NULL,'2026-05-27 20:44:05','2026-05-27 20:44:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-27 21:58:42
