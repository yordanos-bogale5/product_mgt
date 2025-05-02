-- Create a function to delete all orders
CREATE OR REPLACE FUNCTION delete_all_orders()
RETURNS void AS $$
BEGIN
  DELETE FROM orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to delete all products
CREATE OR REPLACE FUNCTION delete_all_products()
RETURNS void AS $$
BEGIN
  DELETE FROM products;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_all_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_all_products() TO authenticated;
