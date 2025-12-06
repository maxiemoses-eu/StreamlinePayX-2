// src/api/cart.ts

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// Placeholder data for testing
const mockCart: CartItem[] = [
  { id: 'c1', productId: 'p1', name: 'Widget Pro', price: 50.00, quantity: 1 },
  { id: 'c2', productId: 'p2', name: 'Gadget Mini', price: 15.00, quantity: 2 },
];

// FIX: Export the required function
export const getCartItems = async (): Promise<CartItem[]> => {
  // In a real app, this fetches data from the StreamlinePay backend service
  return new Promise(resolve => setTimeout(() => resolve(mockCart), 100));
};

// FIX: Export the required function
export const removeFromCart = async (itemId: string): Promise<void> => {
  // In a real app, this sends a DELETE request to the backend
  console.log(`Removing item ${itemId} from cart.`);
  return new Promise(resolve => setTimeout(resolve, 50));
};

// You likely also need addToCart if you haven't implemented it yet
export const addToCart = async (productId: string, quantity: number): Promise<void> => {
  console.log(`Adding ${quantity} of product ${productId} to cart.`);
  return new Promise(resolve => setTimeout(resolve, 50));
};