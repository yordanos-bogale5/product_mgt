import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
  kilogram: number;
  price: number;
  description: string;
  quantity: number;
  created_at: string;
}

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProducts();

    // Subscribe to all changes in the products table
    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { 
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: 'products' 
      }, () => {
        fetchProducts();
      })
      .subscribe();

    // Subscribe to all changes in the orders table
    const ordersSubscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', { 
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: 'orders' 
      }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
      ordersSubscription.unsubscribe();
    };
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAllProducts() {
    if (!confirm('WARNING: This will PERMANENTLY DELETE ALL products and orders from the database. This action CANNOT be undone. Continue?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      
      // Get all products
      const { data: allProducts, error: fetchError } = await supabase
        .from('products')
        .select('id');
      
      if (fetchError) {
        console.error("Error fetching products:", fetchError);
        throw fetchError;
      }
      
      // Delete each product individually
      for (const product of allProducts || []) {
        // First delete related orders
        console.log(`Deleting orders for product ${product.id}...`);
        await supabase
          .from('orders')
          .delete()
          .eq('product_id', product.id);
        
        // Then delete the product
        console.log(`Deleting product ${product.id}...`);
        await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
      }
      
      console.log("All products and orders deleted successfully");
      
      // Force clear local state
      setProducts([]);
      
      // Force refresh the page to ensure everything is cleared
      window.location.reload();
      
      alert('All products and orders have been permanently deleted from the database.');
    } catch (error) {
      console.error('Error during deletion:', error);
      alert('Error during deletion. Check console for details.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      // First, delete related orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('product_id', id);
      
      if (ordersError) throw ordersError;
      
      // Then delete the product
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (productError) throw productError;
      
      // Update local state
      setProducts(products.filter(product => product.id !== id));
      
      alert('Product deleted successfully.');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={deleteAllProducts}
          disabled={deleteLoading || products.length === 0}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleteLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </span>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Products
            </>
          )}
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Added
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={product.image || 'https://via.placeholder.com/150?text=No+Image'} 
                        alt={product.name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.kilogram}kg for ${product.price}</div>
                  <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.quantity < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.quantity}kg
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(product.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;










