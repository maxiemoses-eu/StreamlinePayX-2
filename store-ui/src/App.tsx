import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
// import { BrowserRouter } from 'react-router-dom'; // <-- Line removed to fix the error
import Home from './pages/Home/Home';
import Product from './pages/Product/Product';
import Cart from './pages/Cart/Cart';
import Deals from './components/Deals/Deals';
import AppBar from './components/AppBar/AppBar';
import GlobalContextProvider from './components/layout/GlobalContext';

function App() {
  return (
    <GlobalContextProvider>
      <div className="App">
        <AppBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/deals" element={<Deals />} />
        </Routes>
      </div>
    </GlobalContextProvider>
  );
}

export default App;