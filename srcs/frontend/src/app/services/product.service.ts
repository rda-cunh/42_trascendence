/**
 * Product Service
 * Handles all product-related API calls
 */

import { api } from "../lib/api";
import { Product, PaginatedResponse, ProductFilters } from "../types";

export const productService = {
  /**
   * Get all products with optional filters
   */
  async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();

    if (filters?.category) params.append("category", filters.category);
    if (filters?.minPrice) params.append("min_price", filters.minPrice.toString());
    if (filters?.maxPrice) params.append("max_price", filters.maxPrice.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.sortBy) params.append("sort_by", filters.sortBy);
    if (filters?.sortOrder) params.append("sort_order", filters.sortOrder);

    const queryString = params.toString();
    const _url = `/listings/${queryString ? `?${queryString}` : ""}`;

    return api.getListings();
  },

  /**
   * Get a single product by ID
   */
  async getById(id: string): Promise<Product> {
    const response = await api.getListing(id);
    return response.listing;
  },

  /**
   * Create a new product
   */
  async create(data: Partial<Product>, token: string): Promise<Product> {
    return api.createListing(data, token);
  },

  /**
   * Update an existing product
   */
  async update(id: string, data: Partial<Product>, token: string): Promise<Product> {
    return api.updateListing(id, data, token);
  },

  /**
   * Delete a product
   */
  async delete(id: string, token: string): Promise<void> {
    return api.deleteListing(id, token);
  },

  /**
   * Search products
   */
  async search(query: string): Promise<Product[]> {
    const response = await this.getAll({ search: query });
    return response.results;
  },

  /**
   * Get products by category
   */
  async getByCategory(category: string): Promise<Product[]> {
    const response = await this.getAll({ category });
    return response.results;
  },
};
