/*
  # Add quantity tracking to products

  1. Changes
    - Add `quantity` column to products table
    - Update existing products to have a default quantity
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity numeric DEFAULT 0;

-- Update RLS policies to allow quantity updates
CREATE POLICY "Allow authenticated users to update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);