import { useState, useEffect } from 'react';

interface Deal {
  id: string;
  name: string;
  price: number;
  discount: number;
}

// Define the return type of the hook
type UseDealsReturn = [Deal[], boolean];

const useDeals = (): UseDealsReturn => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder logic: Simulate fetching data
    setTimeout(() => {
      const fetchedDeals: Deal[] = [
        { id: 'deal1', name: 'Laptop Deal', price: 999.99, discount: 15 },
        { id: 'deal2', name: 'Monitor Deal', price: 299.99, discount: 10 },
      ];
      setDeals(fetchedDeals);
      setLoading(false);
    }, 500);
  }, []);

  return [deals, loading];
};

export { useDeals };