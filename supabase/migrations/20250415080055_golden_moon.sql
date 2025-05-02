/*
  # Add insert policy for products table

  1. Changes
    - Add policy to allow authenticated users to insert products
    
  2. Security
    - Only authenticated users can insert new products
*/

CREATE POLICY "Allow authenticated users to insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);