// frontend/src/components/Common/APITestComponent.tsx (or any suitable path)
"use client";

import React, { useEffect, useState } from 'react';
// Adjust these import paths if your files are located elsewhere!
import { getCategories, getProducts, PaginatedProducts } from '@/lib/apiService';
import { Category } from '@/types/category';
import { Product, PaginatedProducts } from '@/types/product';

const APITestComponent = () => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    console.log("API_BASE_URL from env:", process.env.NEXT_PUBLIC_API_BASE_URL);

    const getCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError(null);
      const categoriesUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'}/shop/categories/?limit=100`;
      console.log("Attempting to fetch categories from URL:", categoriesUrl);
      try {
        const response = await fetch(categoriesUrl);
        console.log("Categories raw response status:", response.status);
        const responseText = await response.text(); // Get raw response text
        console.log("Categories raw response text:", responseText);

        if (!response.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText); // Try to parse as JSON
          } catch (e) {
            errorData = { message: `Request failed with status ${response.status}. Response: ${responseText}` };
          }
          throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = JSON.parse(responseText); // Parse the text now that we know it's ok

        console.log("Fetched Categories Data:", data);
        setCategories(data.results || data); // Handle both paginated and direct array responses
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (error instanceof Error) {
          setCategoryError(error.message);
        } else {
          setCategoryError("An unknown error occurred while fetching categories.");
        }
      } finally {
        setIsLoadingCategories(false);
      }
    };

    const getProducts = async () => {
      setIsLoadingProducts(true);
      setProductError(null);
      const productsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'}/shop/products/`;
      console.log("Attempting to fetch products from URL:", productsUrl);
      try {
        const response = await fetch(productsUrl);
        console.log("Products raw response status:", response.status);
        const responseText = await response.text();
        console.log("Products raw response text:", responseText);

        if (!response.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            errorData = { message: `Request failed with status ${response.status}. Response: ${responseText}` };
          }
          throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: PaginatedProducts = JSON.parse(responseText);

        console.log("Fetched Products (Paginated) Data:", data);
        setProducts(data.results);
      } catch (error) {
        console.error("Error fetching products:", error);
        if (error instanceof Error) {
          setProductError(error.message);
        } else {
          setProductError("An unknown error occurred while fetching products.");
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    getCategories();
    getProducts();
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', backgroundColor: '#f9f9f9' }}>
      <h2>API Connection Test Component</h2>
      <p><strong>API Base URL (from env):</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not Set - Using default http://127.0.0.1:8000/api'}</p>

      <div style={{ marginTop: '15px', padding: '10px', border: '1px dashed #aaa' }}>
        <h3>Categories Status:</h3>
        {isLoadingCategories && <p><em>Loading categories...</em></p>}
        {categoryError && <p style={{ color: 'red' }}><strong>Error:</strong> {categoryError}</p>}
        {categories && categories.length > 0 && (
          <>
            <p style={{ color: 'green' }}>Successfully fetched {categories.length} categories.</p>
            <ul>
              {categories.slice(0, 5).map((category) => ( // Displaying only first 5 for brevity
                <li key={category.id}>{category.id}: {category.name} (Slug: {category.slug})</li>
              ))}
              {categories.length > 5 && <li>... and {categories.length - 5} more.</li>}
            </ul>
          </>
        )}
        {!isLoadingCategories && categories && categories.length === 0 && <p>No categories found (API call successful, but no data).</p>}
      </div>

      <hr style={{ margin: '20px 0' }} />

      <div style={{ marginTop: '15px', padding: '10px', border: '1px dashed #aaa' }}>
        <h3>Products Status:</h3>
        {isLoadingProducts && <p><em>Loading products...</em></p>}
        {productError && <p style={{ color: 'red' }}><strong>Error:</strong> {productError}</p>}
        {products && products.length > 0 && (
          <>
            <p style={{ color: 'green' }}>Successfully fetched {products.length} products (first page).</p>
            <ul>
              {products.slice(0, 5).map((product) => ( // Displaying only first 5 for brevity
                <li key={product.id}>{product.id}: {product.name} - ${product.price}</li>
              ))}
              {products.length > 5 && <li>... and {products.length - 5} more.</li>}
            </ul>
          </>
        )}
        {!isLoadingProducts && products && products.length === 0 && <p>No products found (API call successful, but no data).</p>}
      </div>
    </div>
  );
};

export default APITestComponent;
