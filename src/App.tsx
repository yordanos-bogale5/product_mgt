import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Store, Plus, LogOut, List } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Orders from './pages/Orders';
import AddProduct from './pages/AddProduct';
import Auth from './pages/Auth';
import ProductList from './pages/ProductList';
import Profile from './pages/Profile';

function Navigation() {
  const { signOut, user } = useAuth();
  const isRegularUser = user?.email !== "user1@gmail.com"; // Reversed logic - anyone who is not user1 is a regular user

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex items-center">
              <Store className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Spice Market</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isRegularUser ? (
              <>
                <Link
                  to="/orders"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Your Orders
                </Link>
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/add-product"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Link>
                <Link
                  to="/products"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <List className="h-4 w-4 mr-1" />
                  List of Products
                </Link>
                <Link
                  to="/orders"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Orders
                </Link>
              </>
            )}
            <button
              onClick={() => signOut()}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navigation />
                  <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Home />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navigation />
                  <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Home />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navigation />
                  <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <ProductList />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navigation />
                  <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Orders />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navigation />
                  <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <AddProduct />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navigation />
                  <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Profile />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


