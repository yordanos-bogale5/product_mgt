-- Add policy to allow authenticated users to update products
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);