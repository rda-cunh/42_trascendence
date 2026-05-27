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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'56c39dbf-7b6a-4d6b-a558-1645b67c05a2.png',0,'2026-05-25 19:08:51'),(2,1,'842988a9-564a-4d5e-a252-aa415990682d.png',1,'2026-05-25 19:08:51'),(3,2,'9a242d21-6657-4f49-957c-b0dc33e04c31.png',0,'2026-05-25 19:16:08'),(4,2,'db5bb0e2-f37c-4f24-8e30-9d9376abea9f.png',1,'2026-05-25 19:16:08'),(5,3,'be430af6-2dac-4fd2-bb8b-b441c6fa765e.png',0,'2026-05-25 19:24:05'),(6,4,'ad899ed1-024f-4ac8-a9f6-3692827bf259.png',0,'2026-05-25 19:36:18');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,3,'Space flow','space-flow','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"A super space flow shader.\",\"code\":\"uniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\nvoid main() {\\n    // 1. Center the coordinates so the flow revolves around the middle (from -1.0 to 1.0)\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    \\n    // 2. Accumulate space-time distortion to create a fluid, nebula-like flow\\n    vec2 p = uv;\\n    for (float i = 1.0; i < 5.0; i++) {\\n        vec2 newp = p;\\n        // The sine/cosine layering creates the twisting \\\"flow\\\" effect\\n        newp.x += 0.5 / i * sin(i * p.y + u_time * 0.5);\\n        newp.y += 0.5 / i * cos(i * p.x + u_time * 0.3);\\n        p = newp;\\n    }\\n    \\n    // 3. Map the heavily distorted coordinates to deep cosmic colors \\n    // (Dark purples, deep blues, and subtle magentas)\\n    float r = 0.3 * sin(3.0 * p.x) + 0.2;\\n    float g = 0.1 * sin(3.0 * p.y) + 0.1;\\n    float b = 0.5 * sin(p.x + p.y) + 0.4;\\n    vec3 color = vec3(r, g, b);\\n    \\n    // 4. Add a wandering celestial energy core/star that drifts across the flow\\n    vec2 corePos = vec2(sin(u_time * 0.4) * 0.5, cos(u_time * 0.6) * 0.5);\\n    // Inverse length creates a smooth, infinite radial gradient (glow)\\n    float glow = 0.05 / length(uv - corePos); \\n    \\n    // Mix the star\'s bright cyan/white glow into the dark space background\\n    color += vec3(glow * 0.7, glow * 0.8, glow); \\n    \\n    // 5. Output the final fragment color\\n    gl_FragColor = vec4(color, 1.0);\\n}\"}',5.00,NULL,'Active',NULL,0,'2026-05-25 19:08:51','2026-05-25 19:08:51'),(2,4,'Dithering','dithering','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Psychedelic\",\"code\":\"uniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\n// A branchless, math-only 4x4 Bayer matrix generator.\\n// It returns a threshold value between 0.0 and 0.9375 (15/16) based on pixel coordinates.\\nfloat bayer(vec2 p) {\\n    float a = mod(p.x, 2.0);\\n    float b = mod(p.y, 2.0);\\n    float c = mod(floor(p.x / 2.0), 2.0);\\n    float d = mod(floor(p.y / 2.0), 2.0);\\n    \\n    // Generate a 2x2 matrix pattern: (0, 2, 3, 1)\\n    float bayer2 = (a * 2.0 + b * 3.0) - (a * b * 4.0);\\n    \\n    // Expand the 2x2 pattern into a 4x4 matrix\\n    float bayer4 = bayer2 + 4.0 * ((c * 2.0 + d * 3.0) - (c * d * 4.0));\\n    \\n    return bayer4 / 16.0;\\n}\\n\\nvoid main() {\\n    // 1. Get exact pixel coordinates for the dither grid to lock onto\\n    vec2 fragCoord = v_uv * u_resolution;\\n    \\n    // 2. Generate a smooth, vibrant background to apply the dither to\\n    // We create a shifting holographic orb so there are rich gradients to break up\\n    vec2 centerUv = v_uv - 0.5;\\n    float dist = length(centerUv);\\n    \\n    vec3 smoothColor = 0.5 + 0.5 * cos(u_time + v_uv.xyx * 4.0 + vec3(0.0, 2.0, 4.0));\\n    \\n    // Fade the edges to black (smoothstep) to create depth\\n    smoothColor *= smoothstep(0.7, 0.1, dist);\\n    \\n    // 3. Fetch the dither threshold for this specific pixel location\\n    float threshold = bayer(fragCoord);\\n    \\n    // 4. Quantize (crush) the color palette\\n    // Lower numbers mean fewer colors. \\n    // 1.0 = 1-bit per RGB channel (8 colors total - pure retro)\\n    // 2.0 = 3 levels per channel (27 colors total)\\n    // 3.0 = 2-bit per channel (64 colors total)\\n    float colorDepth = 1.0; \\n    \\n    // Apply the dither threshold and snap the gradient to discrete color bands\\n    vec3 ditheredColor = floor(smoothColor * colorDepth + threshold) / colorDepth;\\n    \\n    // 5. Output the final quantized fragment\\n    gl_FragColor = vec4(ditheredColor, 1.0);\\n}\"}',7.90,NULL,'Active',NULL,0,'2026-05-25 19:16:08','2026-05-25 19:16:08'),(3,5,'Nature','nature','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Breezing!\",\"code\":\"uniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\n// A standard 2D rotation matrix to bend space\\nmat2 rot(float a) {\\n    float s = sin(a), c = cos(a);\\n    return mat2(c, -s, s, c);\\n}\\n\\n// Math formula for a box (used for the trunk)\\nfloat sdBox(vec2 p, vec2 b) {\\n    vec2 d = abs(p) - b;\\n    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);\\n}\\n\\n// Math formula for a circle (used for the leaves)\\nfloat sdCircle(vec2 p, float r) {\\n    return length(p) - r;\\n}\\n\\nvoid main() {\\n    // 1. Center the screen (0,0 is now the middle) and fix the aspect ratio\\n    vec2 uv = (v_uv - 0.5) * 2.0;\\n    uv.x *= u_resolution.x / u_resolution.y;\\n    \\n    // 2. Draw a simple gradient sky for the background\\n    vec3 color = mix(vec3(0.6, 0.8, 1.0), vec3(0.1, 0.3, 0.7), uv.y * 0.5 + 0.5);\\n    \\n    // 3. WIND MECHANICS\\n    // Calculate how high up the screen we are (0.0 at the ground, 1.0+ at the top)\\n    float heightFactor = max(0.0, uv.y + 0.8); \\n    \\n    // Create an erratic wind pattern by layering two sine waves at different speeds\\n    float windStrength = sin(u_time * 2.0) * 0.5 + sin(u_time * 1.33) * 0.25;\\n    \\n    // The bending becomes stronger the higher up the tree you go (quadratic curve)\\n    float bendAngle = windStrength * 0.15 * (heightFactor * heightFactor); \\n    \\n    // Duplicate our UVs so we only distort the tree, not the sky\\n    vec2 treeUv = uv;\\n    \\n    // Anchor the rotation to the ground (y = -0.8), apply the bend, then reset\\n    treeUv.y += 0.8; \\n    treeUv *= rot(bendAngle);\\n    treeUv.y -= 0.8;\\n    // Add a slight horizontal push for extra realism\\n    treeUv.x -= windStrength * 0.1 * heightFactor;\\n    \\n    // 4. DRAW THE SHAPES USING THE DISTORTED SPACE\\n    // The Trunk (A stretched box)\\n    vec2 trunkUv = treeUv - vec2(0.0, -0.3);\\n    float trunk = sdBox(trunkUv, vec2(0.06, 0.5));\\n    \\n    // The Canopy (Four overlapping circles acting as leaf clumps)\\n    vec2 canopyBase = treeUv - vec2(0.0, 0.4);\\n    float c1 = sdCircle(canopyBase, 0.4);                           // Center mass\\n    float c2 = sdCircle(canopyBase - vec2(-0.25, -0.1), 0.3);       // Left clump\\n    float c3 = sdCircle(canopyBase - vec2(0.25, -0.15), 0.35);      // Right clump\\n    float c4 = sdCircle(canopyBase - vec2(0.0, 0.2), 0.3);          // Top clump\\n    \\n    // Merge the circles together by taking the minimum distance of all four\\n    float canopy = min(min(c1, c2), min(c3, c4));\\n    \\n    // 5. COLORS & BLENDING\\n    // Calculate anti-aliasing to keep the edges smooth regardless of resolution\\n    float aa = 2.0 / u_resolution.y;\\n    \\n    // Trunk Color\\n    vec3 trunkColor = vec3(0.25, 0.15, 0.1);\\n    color = mix(color, trunkColor, smoothstep(aa, -aa, trunk));\\n    \\n    // Leaf Color (with a fake shadow based on the UV position)\\n    vec3 leafColor = vec3(0.1, 0.5, 0.2);\\n    leafColor *= 0.6 + 0.4 * smoothstep(-0.4, 0.4, canopyBase.y - canopyBase.x);\\n    color = mix(color, leafColor, smoothstep(aa, -aa, canopy));\\n    \\n    // Draw the ground line\\n    float ground = uv.y + 0.8;\\n    color = mix(color, vec3(0.05, 0.2, 0.05), smoothstep(aa, -aa, ground));\\n    \\n    // 6. Output to screen\\n    gl_FragColor = vec4(color, 1.0);\\n}\"}',12.99,NULL,'Active',NULL,0,'2026-05-25 19:24:05','2026-05-25 19:24:05'),(4,6,'Matrix','matrix','__PROJECT_SHADER_V1__\n{\"type\":\"shader\",\"version\":1,\"language\":\"glsl\",\"notes\":\"Call me Neo!\",\"code\":\"uniform float u_time;\\nuniform vec2 u_resolution;\\nvarying vec2 v_uv;\\n\\n// A standard pseudo-random noise function based on dot products\\nfloat random(vec2 p) {\\n    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);\\n}\\n\\nvoid main() {\\n    // 1. Create a uniform grid\\n    vec2 uv = v_uv;\\n    uv.x *= u_resolution.x / u_resolution.y; // Prevent stretching\\n    \\n    // Scale the coordinates up to create the \\\"columns\\\" and \\\"rows\\\"\\n    float columns = 40.0;\\n    uv *= columns;\\n    \\n    // 2. Isolate columns and calculate gravity\\n    float col = floor(uv.x);\\n    \\n    // Give each column a random speed and a random vertical starting offset\\n    float speed = random(vec2(col, 1.0)) * 1.5 + 1.0; \\n    float offset = random(vec2(col, 2.0)) * 100.0;\\n    \\n    // Animate the Y-axis. We subtract uv.y so the streams fall downward.\\n    float yPos = -uv.y + (u_time * speed * 4.0) + offset;\\n    float row = floor(yPos);\\n    \\n    // 3. Generate Procedural \\\"Characters\\\"\\n    // Get the local coordinates *inside* the current cell (0.0 to 1.0)\\n    vec2 cellUv = fract(uv);\\n    \\n    // Subdivide the cell into a 3x3 mini-grid to create pixelated \\\"glyphs\\\"\\n    vec2 miniGrid = floor(cellUv * 3.0);\\n    \\n    // Create a seed based on the specific row and column.\\n    // Adding floor(u_time * 15.0) makes the characters rapidly cycle/flicker.\\n    float charSeed = random(vec2(col, row) + floor(u_time * 15.0));\\n    \\n    // Randomly turn on/off blocks in the 3x3 mini-grid to form a shape\\n    float glyph = step(0.5, random(miniGrid + charSeed));\\n    \\n    // Crop the edges of the cell to add spacing between the characters\\n    glyph *= step(0.1, cellUv.x) * step(cellUv.x, 0.9) * step(0.1, cellUv.y) * step(cellUv.y, 0.9);\\n    \\n    // 4. The Rain Trail (Brightness & Fade)\\n    // Divide the falling streams into repeating chunks (e.g., 20 rows long)\\n    float trailLength = 20.0;\\n    float drop = fract(yPos / trailLength);\\n    \\n    // Extract the leading edge (the \\\"head\\\") of the drop\\n    float head = smoothstep(0.9, 1.0, drop);\\n    \\n    // Create the fading trail that follows the head\\n    float tail = max(0.0, 1.0 - (drop * 1.2));\\n    \\n    // 5. Colors and Blending\\n    vec3 matrixGreen = vec3(0.1, 0.9, 0.3);\\n    vec3 headWhite = vec3(0.8, 1.0, 0.8);\\n    \\n    // Base color: The glyph multiplied by the fading tail and the green hue\\n    vec3 color = matrixGreen * glyph * tail;\\n    \\n    // Flash the leading character bright white\\n    color = mix(color, headWhite * glyph, head);\\n    \\n    // Add a faint background glow to the falling streams for ambiance\\n    color += vec3(0.0, 0.15, 0.0) * tail * 0.3;\\n\\n    // 6. Output to screen\\n    gl_FragColor = vec4(color, 1.0);\\n}\"}',15.99,NULL,'Active',NULL,0,'2026-05-25 19:36:18','2026-05-25 19:36:18');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Leo Vichi','lvichi@email.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225',NULL,'User','Active',NULL,'2026-05-25 19:04:05','2026-05-25 19:04:05'),(3,'Leo Maes','lmaes@email.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','+1 9541234','User','Active',NULL,'2026-05-25 19:04:51','2026-05-25 19:04:51'),(4,'Rapha Campos','rapcampo@email.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','+123456789','User','Active','/images/415bafda-9332-48d4-886e-390762197725.png','2026-05-25 19:09:34','2026-05-25 19:10:17'),(5,'Ricardo Mendes','rda-cunh@email.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','123456789','User','Active',NULL,'2026-05-25 19:17:45','2026-05-25 19:17:45'),(6,'Erik Lustosa','ecarvalh@email.com','0367572f297dad65b81f96973254f4d340f1fc4de2f20364ed380d889a9f6cb9','123456789','User','Active',NULL,'2026-05-25 19:31:12','2026-05-25 19:32:11');
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

-- Dump completed on 2026-05-25 19:41:03
