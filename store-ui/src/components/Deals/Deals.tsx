import React from 'react';
import { useDeals } from '../../hooks/useDeals'; 

interface Deal {
  id: string;
  name: string;
  price: number;
  discount: number;
}

const Deals: React.FC = () => {
  const [deals, loading] = useDeals();

  if (loading) {
    return <div>Loading deals...</div>;
  }

  return (
    <div className="deals-container">
      {/* FIX: Escaped apostrophe */}
      <h2>Today&apos;s Best Deals</h2>
      <div className="deals-list">
        {deals.map((deal: Deal) => (
          <div key={deal.id} className="deal-card">
            <h3>{deal.name}</h3>
            <p>Original Price: ${deal.price.toFixed(2)}</p>
            <p>Discount: {deal.discount}%</p>
            <p>Sale Price: ${(deal.price * (1 - deal.discount / 100)).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deals;