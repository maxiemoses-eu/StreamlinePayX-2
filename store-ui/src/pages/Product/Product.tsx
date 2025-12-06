import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductDetails } from '../../api/products';
import { ProductDetails } from '../../types/ProductDetails';
import './Product.css';

const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const data = await getProductDetails(id);
        if (!data) {
          setError('Product not found.');
          return;
        }
        setProduct(data);
      } catch (err) {
        setError('Failed to fetch product details.');
        setProduct(null);
      }
    };

    fetchProduct();
  }, [id]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="loading">Loading product...</div>;
  }

  return (
    <div className="product-container">
      <h1>{product.name}</h1>
      {product.image && <img src={product.image} alt={product.name} />}
      {product.description && <p>{product.description}</p>}
      {product.rating && <p>Rating: {product.rating} / 5</p>}
      {product.category && <p>Category: {product.category}</p>}
    </div>
  );
};

export default Product;
