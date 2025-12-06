import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Deals from '../../components/Deals/Deals';
import ProductsList from '../../components/ProductsList/ProductsList';
import Carousel from '../../components/Carousel/Carousel';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Home component loaded');
  }, []);

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  const products = [
    { id: 1, name: 'Product A' },
    { id: 2, name: 'Product B' },
    { id: 3, name: 'Product C' },
  ];

  return (
    <div className="home-container">
      <Carousel />
      <Deals />
      <section className="featured-products">
        <h2>Featured Products</h2>
        <ProductsList products={products} onProductClick={handleProductClick} />
      </section>
      <section className="about-us">
        <h3>About StreamlinePay</h3>
        <p>Your one-stop shop for all things digital and physical.</p>
      </section>
    </div>
  );
};

export default Home;
