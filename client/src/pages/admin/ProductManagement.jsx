import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import ProductContext from '../../context/ProductContext';
import { Plus, Edit2, Trash2, X, Upload, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductManagement = () => {
  const { products, categories, fetchProducts, loading } = useContext(ProductContext);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Submit and delete loaders
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProducts({ pageSize: 100 }); // load all products for listing
  }, []);

  const openAddModal = () => {
    setEditMode(false);
    setSelectedProductId(null);
    setName('');
    setPrice('');
    setDescription('');
    setCategory('');
    setStock('');
    setImageFiles([]);
    setExistingImages([]);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditMode(true);
    setSelectedProductId(product._id);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setCategory(product.category);
    setStock(product.stock);
    setImageFiles([]);
    setExistingImages(product.images || []);
    setFormError('');
    setModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      alert('Product deleted successfully');
      fetchProducts({ pageSize: 100 });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Delete failed');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !price || !category || !description || !stock) {
      setFormError('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);

    // Prepare Multipart FormData for Image Uploads
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('stock', stock);

    // Append newly chosen files
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
      }
    } else if (existingImages.length > 0) {
      // Send existing images if editing and no new files were selected
      formData.append('images', JSON.stringify(existingImages));
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editMode) {
        await api.put(`/products/${selectedProductId}`, formData, config);
        alert('Product updated successfully');
      } else {
        await api.post('/products', formData, config);
        alert('Product created successfully');
      }

      setModalOpen(false);
      fetchProducts({ pageSize: 100 });
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Form submission failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Product Management</h1>
            <p className="text-slate-400 text-sm">Create, modify, and delete catalog products</p>
          </div>
        </div>

        <button onClick={openAddModal} className="btn-primary py-2.5 px-6 flex items-center gap-1.5 text-sm font-bold shadow-md">
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <span>Loading product listings...</span>
          </div>
        ) : products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Product Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((prod) => {
                  const image = prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                  return (
                    <tr key={prod._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <img src={image} alt="" className="w-12 h-12 object-cover rounded-lg bg-slate-50 border border-slate-100" />
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{prod.name}</td>
                      <td className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-primary-600">
                        {prod.category}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">${prod.price.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                          prod.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {prod.stock} items
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-2 text-slate-400 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod._id)}
                            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400">
            No products found in database. Create one to populate!
          </div>
        )}
      </div>

      {/* Add / Edit product modal overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-extrabold text-slate-800">
              {editMode ? 'Edit Product Details' : 'Create New Product'}
            </h2>

            {formError && (
              <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-100">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Leather Wallet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    placeholder="Electronics, Fashion etc."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="29.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="form-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
                <textarea
                  rows="4"
                  placeholder="Write complete product highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input text-sm resize-none"
                />
              </div>

              {/* Multiple Image file uploader */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Product Images (Allowed formats: JPG, JPEG, PNG, WEBP)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-primary-500 transition-colors bg-slate-50 flex flex-col items-center justify-center cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Choose images to upload</span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {imageFiles.length > 0
                      ? `${imageFiles.length} files chosen`
                      : 'Files will be stored securely on Cloudinary'}
                  </span>
                </div>
                {/* Image Previews */}
                {imageFiles.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    {imageFiles.map((file, idx) => (
                      <span key={idx} className="bg-primary-50 text-primary-700 border border-primary-100 text-[10px] px-2.5 py-1 rounded-lg font-bold">
                        📎 {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 btn-secondary py-3 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-1/2 btn-primary py-3 text-sm flex items-center justify-center gap-1.5"
                >
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{editMode ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
