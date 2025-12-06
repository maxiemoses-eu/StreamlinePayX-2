import React, { useState, useEffect } from 'react'; // FIX: Added React import
import { getCartItems, removeFromCart } from '../../api/cart';
import { Grid, Typography, Button, Paper, Box } from '@mui/material';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  // Removed explicit :any assignment to avoid warning, letting TS infer or defining specific return type
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getCartItems();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch cart items", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <Typography>Loading cart...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      {items.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* FIX: JSX is now correctly scoped to React */}
            {items.map((item) => (
              <Paper key={item.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography>Price: ${item.price.toFixed(2)}</Typography>
                  <Typography>Quantity: {item.quantity}</Typography>
                </Box>
                <Button variant="outlined" color="secondary" onClick={() => handleRemove(item.id)}>
                  Remove
                </Button>
              </Paper>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${total.toFixed(2)}</Typography>
              </Box>
              <Button variant="contained" color="primary" fullWidth>
                Proceed to Checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Cart;