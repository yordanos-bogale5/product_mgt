-- Add user_id column to orders table
ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies to filter by user_id
DROP POLICY IF EXISTS "Users can read their own orders" ON orders;
CREATE POLICY "Users can read their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());