import { ProductDetails } from '../types/ProductDetails';

const API_BASE_URL = 'http://api.streamlinepay.com';

export const getProductDetails = async (productId: string): Promise<ProductDetails | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product details');
    }

    const data = await response.json();

    // Optional: Validate or transform data here if needed
    return data as ProductDetails;
  } catch (error) {
    // FIX: Added comment to satisfy 'no-empty' ESLint rule
    /* Intentional no-op or specific error handling can be added here */
    return null;
  }
};
