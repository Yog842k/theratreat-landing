'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Trash2,
  MapPin,
  Home,
  Building,
  Check,
  X
} from 'lucide-react';

interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    try {
      const saved = localStorage.getItem('therastore_addresses');
      if (saved) {
        setAddresses(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveAddresses = (newAddresses: Address[]) => {
    localStorage.setItem('therastore_addresses', JSON.stringify(newAddresses));
    setAddresses(newAddresses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newAddresses: Address[];

    if (editingAddress) {
      newAddresses = addresses.map(addr =>
        addr._id === editingAddress._id
          ? { ...formData, _id: editingAddress._id }
          : formData.isDefault ? { ...addr, isDefault: false } : addr
      );
    } else {
      const newAddress: Address = {
        ...formData,
        _id: Date.now().toString()
      };
      newAddresses = formData.isDefault
        ? [{ ...newAddress, isDefault: true }, ...addresses.map(a => ({ ...a, isDefault: false }))]
        : [...addresses, newAddress];
    }

    saveAddresses(newAddresses);
    resetForm();
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const newAddresses = addresses.filter(addr => addr._id !== addressId);
      saveAddresses(newAddresses);
    }
  };

  const setAsDefault = (addressId: string) => {
    const newAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr._id === addressId
    }));
    saveAddresses(newAddresses);
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'work':
        return <Building className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            My Addresses
          </h1>
          <p className="text-xl text-gray-600">
            Manage your shipping addresses
          </p>
        </div>

        {/* Add Address Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="110001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="House/Flat No., Building Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="Street, Area, Landmark"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="New Delhi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Delhi"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isDefault" className="text-sm font-semibold text-gray-700">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address, idx) => (
            <div
              key={address._id}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-emerald-600 transition-all relative animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {address.isDefault && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Default
                </span>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  {getTypeIcon(address.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 capitalize">
                    {address.type} Address
                  </h3>
                  <p className="text-sm text-gray-600">{address.name}</p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                </div>
              </div>

              <div className="text-gray-700 mb-4 space-y-1">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} - {address.pincode}</p>
              </div>

              <div className="flex gap-2">
                {!address.isDefault && (
                  <button
                    onClick={() => setAsDefault(address._id)}
                    className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleEdit(address)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {addresses.length === 0 && !showForm && (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <MapPin className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No addresses saved</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Add your first address to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}







