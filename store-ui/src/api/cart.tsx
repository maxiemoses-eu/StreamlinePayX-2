// Assuming your API calls are structured like this
const API_BASE_URL = 'http://api.streamlinepay.com'; // Example base URL

export const fetchCartItems = async () => {
  // Example fix: Ensuring string literals are not concatenated like "part1" + "/part2"
  const url = `${API_BASE_URL}/cart/items`; 
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch cart items');
  }
  return response.json();
};

export const addToCart = async (productId: string, quantity: number) => {
  // Example fix applied to any string concatenation for URLs or messages
  const url = `${API_BASE_URL}/cart/add`; 
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!response.ok) {
    throw new Error('Failed to add item to cart');
  }
  return response.json();
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const url = `${API_BASE_URL}/cart/update/${itemId}`; 
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) {
    throw new Error('Failed to update cart item');
  }
  return response.json();
};

export const removeCartItem = async (itemId: string) => {
  const url = `${API_BASE_URL}/cart/remove/${itemId}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove cart item');
  }
  return response.json();
};