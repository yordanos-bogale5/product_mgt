import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  image: string;
  kilogram: number;
  price: number;
  description: string;
  quantity: number;
}

interface ProductOrder {
  productId: string;
  orderKg: number;
}

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [loadingOrders, setLoadingOrders] = useState<Record<string, boolean>>({});
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();

    // Subscribe to all changes in the products table
    const productsSubscription = supabase
      .channel('products-changes-home')
      .on('postgres_changes', { 
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: 'products' 
      }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
    };
  }, []);

  // Add a timeout effect to clear success message
  useEffect(() => {
    if (orderSuccess) {
      const timer = setTimeout(() => {
        setOrderSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderSuccess]);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProducts(data || []);
    // Initialize order quantities with default product weights
    const initialQuantities: Record<string, number> = {};
    data?.forEach(product => {
      initialQuantities[product.id] = product.kilogram;
    });
    setOrderQuantities(initialQuantities);
  }

  const handleQuantityChange = (productId: string, value: string) => {
    const kg = parseFloat(value) || 0;
    setOrderQuantities(prev => ({
      ...prev,
      [productId]: kg
    }));
  };

  const calculatePrice = (basePrice: number, baseKg: number, orderKg: number) => {
    const pricePerKg = basePrice / baseKg;
    return (pricePerKg * orderKg).toFixed(2);
  };

  async function handleOrder(product: Product) {
    const orderKg = orderQuantities[product.id];
    
    if (orderKg > product.quantity) {
      alert('Cannot order more than available quantity!');
      return;
    }

    // Set loading state for this specific product
    setLoadingOrders(prev => ({
      ...prev,
      [product.id]: true
    }));

    const orderPrice = parseFloat(calculatePrice(product.price, product.kilogram, orderKg));

    // Start a transaction to update both orders and products
    try {
      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            product_id: product.id,
            product_name: product.name,
            kilogram: orderKg,
            price: orderPrice,
          },
        ])
        .select();

      if (orderError) throw orderError;

      // Update product quantity
      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: product.quantity - orderKg })
        .eq('id', product.id);

      if (updateError) throw updateError;

      // Update local state to reflect the changes
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity - orderKg } 
            : p
        )
      );

      // Set success message
      setOrderSuccess(`Successfully ordered ${orderKg}kg of ${product.name}`);
      
      // Reset order quantity to default
      setOrderQuantities(prev => ({
        ...prev,
        [product.id]: product.kilogram
      }));
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      // Clear loading state
      setLoadingOrders(prev => ({
        ...prev,
        [product.id]: false
      }));
    }
  }

  return (
    <div>
      {orderSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
          {orderSuccess}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={product.image || 'https://via.placeholder.com/150?text=No+Image'}
              alt={product.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                console.error('Image failed to load:', product.image);
                // If image fails to load, use placeholder
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
              }}
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="mt-1 text-gray-500">{product.description}</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <label htmlFor={`kg-${product.id}`} className="text-sm text-gray-500">
                    Quantity (kg):
                  </label>
                  <input
                    type="number"
                    id={`kg-${product.id}`}
                    value={orderQuantities[product.id]}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    min="0.1"
                    step="0.1"
                    max={product.quantity}
                    className="w-24 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Base: {product.kilogram}kg for ${product.price}
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      Total: ${calculatePrice(product.price, product.kilogram, orderQuantities[product.id])}
                    </p>
                    <p className="text-sm text-gray-500">
                      Available: <span className={product.quantity < 5 ? 'text-red-600 font-medium' : ''}>{product.quantity}kg</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleOrder(product)}
                    disabled={orderQuantities[product.id] > product.quantity || loadingOrders[product.id]}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingOrders[product.id] ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing
                      </span>
                    ) : (
                      'Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;







