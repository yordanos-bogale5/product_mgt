import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  product_id: string;
  product_name: string;
  kilogram: number;
  price: number;
  order_date: string;
}

interface GroupedOrders {
  [productId: string]: {
    productName: string;
    orders: Order[];
    totalKilograms: number;
    totalPrice: number;
  }
}

function Orders() {
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Subscribe to changes in the orders table
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', { 
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: 'orders' 
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      setIsLoading(false);
      return;
    }

    // Group orders by product
    const grouped = (data || []).reduce((acc: GroupedOrders, order: Order) => {
      if (!acc[order.product_id]) {
        acc[order.product_id] = {
          productName: order.product_name,
          orders: [],
          totalKilograms: 0,
          totalPrice: 0
        };
      }
      acc[order.product_id].orders.push(order);
      acc[order.product_id].totalKilograms += order.kilogram;
      acc[order.product_id].totalPrice += order.price;
      return acc;
    }, {});

    setGroupedOrders(grouped);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedOrders).map(([productId, { productName, orders, totalKilograms, totalPrice }]) => (
        <div key={productId} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{productName}</h2>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Orders: {orders.length}</p>
                <p className="text-sm font-medium text-gray-900">
                  Total: {totalKilograms.toFixed(2)}kg (${totalPrice.toFixed(2)})
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.kilogram}kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.order_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {Object.keys(groupedOrders).length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  );
}

export default Orders;

