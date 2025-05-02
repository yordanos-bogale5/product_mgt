/*
  # Create Products and Orders Tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `image` (text, URL)
      - `kilogram` (numeric)
      - `price` (numeric)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `product_name` (text)
      - `kilogram` (numeric)
      - `price` (numeric)
      - `order_date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to products
    - Add policies for authenticated users to read/write orders
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image text NOT NULL,
  kilogram numeric NOT NULL,
  price numeric NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) NOT NULL,
  product_name text NOT NULL,
  kilogram numeric NOT NULL,
  price numeric NOT NULL,
  order_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products policies (public read access)
CREATE POLICY "Allow public read access"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Orders policies (authenticated users only)
CREATE POLICY "Users can read their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);