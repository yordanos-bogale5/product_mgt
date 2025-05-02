/*
  # Add quantity tracking to products

  1. Changes
    - Add quantity column to products table with default value of 0
    - Ensure the column is numeric type for precise measurements
  
  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN quantity numeric DEFAULT 0;
  END IF;
END $$;