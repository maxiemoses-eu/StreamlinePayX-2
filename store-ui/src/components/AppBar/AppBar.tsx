import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

const MyAppBar: React.FC = () => {
  const navigate = useNavigate(); 

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          StreamlinePay Store
        </Typography>
        <Button color="inherit" onClick={handleCartClick}>
          <ShoppingCartIcon />
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default MyAppBar;