import React from 'react';

interface Product {
  id: number;
  name: string;
}

interface ProductsListProps {
  products: Product[];
  onProductClick: (id: string) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ products, onProductClick }) => {
  return (
    <div>
      {products.map((product) => (
        <div
          key={product.id}
          role="button"
          tabIndex={0}
          onClick={() => onProductClick(product.id.toString())}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onProductClick(product.id.toString());
            }
          }}
          style={{
            padding: '12px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            backgroundColor: '#f9f9f9',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {product.name}
        </div>
      ))}
    </div>
  );
};

export default ProductsList;
