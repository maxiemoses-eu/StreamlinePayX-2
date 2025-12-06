import React from 'react';
import MyAppBar from '../AppBar/AppBar';
import Footer from './Footer/Footer';
import Box from '@mui/material/Box';

// FIX: Changed 'any' to a proper React type
interface LayoutProps {
  children: React.ReactNode; 
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MyAppBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;