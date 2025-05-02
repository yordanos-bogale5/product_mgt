import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    kilogram: '',
    price: '',
    description: '',
    quantity: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = fileName; // No need for subfolder if bucket is already 'product-images'

      // Log for debugging
      console.log('Uploading to path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images') // Use the correct bucket name
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      const { data } = supabase.storage
        .from('product-images') // Use the correct bucket name
        .getPublicUrl(filePath);

      console.log('Public URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  };

  // Add this function to validate the form data
  const validateForm = () => {
    // Check if required fields are filled
    if (!formData.name.trim()) {
      alert('Please enter a product name');
      return false;
    }
    
    // Check if we have either an image file or URL
    if (!imageFile && !formData.image.trim()) {
      alert('Please provide an image file or URL');
      return false;
    }
    
    // Validate numeric fields
    if (isNaN(parseFloat(formData.kilogram)) || parseFloat(formData.kilogram) <= 0) {
      alert('Please enter a valid base package size');
      return false;
    }
    
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price');
      return false;
    }
    
    if (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) < 0) {
      alert('Please enter a valid quantity');
      return false;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a product description');
      return false;
    }
    
    return true;
  };

  // Add this function to get a placeholder image if upload fails
  const getPlaceholderImage = () => {
    return 'https://via.placeholder.com/150?text=No+Image';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      // If there's a new image file, try to upload it
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Use URL if provided, otherwise use placeholder
          if (!formData.image) {
            imageUrl = getPlaceholderImage();
            console.log('Using placeholder image:', imageUrl);
          }
        }
      } else if (!imageUrl) {
        // If no file and no URL, use placeholder
        imageUrl = getPlaceholderImage();
        console.log('Using placeholder image:', imageUrl);
      }

      // Log for debugging
      console.log('Inserting product with data:', {
        name: formData.name,
        image: imageUrl,
        kilogram: parseFloat(formData.kilogram),
        price: parseFloat(formData.price),
        description: formData.description,
        quantity: parseFloat(formData.quantity),
      });

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          image: imageUrl,
          kilogram: parseFloat(formData.kilogram),
          price: parseFloat(formData.price),
          description: formData.description,
          quantity: parseFloat(formData.quantity),
        }])
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Product added successfully:', data);
      alert('Product added successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Product Image
          </label>
          <div className="mt-1 flex flex-col space-y-3">
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            <p className="text-xs text-gray-500">Or provide an image URL:</p>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter image URL (optional)"
            />
          </div>
          {imagePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-32 w-32 object-cover rounded-md border border-gray-300" 
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="kilogram" className="block text-sm font-medium text-gray-700">
              Base Package Size (kg)
            </label>
            <input
              type="number"
              id="kilogram"
              name="kilogram"
              required
              step="0.01"
              min="0"
              value={formData.kilogram}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter base package size in kg"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter price"
            />
          </div>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Available Quantity (kg)
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            required
            step="0.01"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter available quantity in kg"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter product description"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;









