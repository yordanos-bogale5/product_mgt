-- Add quantity column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE products ADD COLUMN quantity numeric DEFAULT 0;
    END IF;
END $$;