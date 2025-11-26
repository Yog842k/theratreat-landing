'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2,
  CreditCard,
  Wallet,
  Check,
  X
} from 'lucide-react';

interface PaymentMethod {
  _id: string;
  type: 'card' | 'upi' | 'wallet';
  name: string;
  number?: string;
  upiId?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
}

export default function PaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    type: 'card' as 'card' | 'upi' | 'wallet',
    name: '',
    number: '',
    upiId: '',
    expiryMonth: '',
    expiryYear: '',
    isDefault: false
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = () => {
    try {
      const saved = localStorage.getItem('therastore_payment_methods');
      if (saved) {
        setPaymentMethods(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const savePaymentMethods = (newMethods: PaymentMethod[]) => {
    localStorage.setItem('therastore_payment_methods', JSON.stringify(newMethods));
    setPaymentMethods(newMethods);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newMethods: PaymentMethod[];

    if (editingPayment) {
      newMethods = paymentMethods.map(method =>
        method._id === editingPayment._id
          ? { ...formData, _id: editingPayment._id }
          : formData.isDefault ? { ...method, isDefault: false } : method
      );
    } else {
      const newMethod: PaymentMethod = {
        ...formData,
        _id: Date.now().toString()
      };
      newMethods = formData.isDefault
        ? [{ ...newMethod, isDefault: true }, ...paymentMethods.map(m => ({ ...m, isDefault: false }))]
        : [...paymentMethods, newMethod];
    }

    savePaymentMethods(newMethods);
    resetForm();
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingPayment(method);
    setFormData({
      type: method.type,
      name: method.name,
      number: method.number || '',
      upiId: method.upiId || '',
      expiryMonth: method.expiryMonth || '',
      expiryYear: method.expiryYear || '',
      isDefault: method.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = (methodId: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      const newMethods = paymentMethods.filter(method => method._id !== methodId);
      savePaymentMethods(newMethods);
    }
  };

  const setAsDefault = (methodId: string) => {
    const newMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method._id === methodId
    }));
    savePaymentMethods(newMethods);
  };

  const resetForm = () => {
    setFormData({
      type: 'card',
      name: '',
      number: '',
      upiId: '',
      expiryMonth: '',
      expiryYear: '',
      isDefault: false
    });
    setEditingPayment(null);
    setShowForm(false);
  };

  const maskCardNumber = (number: string) => {
    if (number.length <= 4) return number;
    return '**** **** **** ' + number.slice(-4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Payment Methods
          </h1>
          <p className="text-xl text-gray-600">
            Manage your saved payment methods
          </p>
        </div>

        {/* Add Payment Method Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4"
          >
            <Plus className="w-5 h-5" />
            Add Payment Method
          </button>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {formData.type === 'card' ? 'Cardholder Name' : formData.type === 'upi' ? 'UPI Name' : 'Wallet Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder={formData.type === 'card' ? 'John Doe' : formData.type === 'upi' ? 'john@upi' : 'Wallet Name'}
                />
              </div>

              {formData.type === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value.replace(/\s/g, '') })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Month *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.expiryMonth}
                        onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                        placeholder="MM"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Year *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.expiryYear}
                        onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                        placeholder="YY"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.type === 'upi' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="john@paytm"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isDefault" className="text-sm font-semibold text-gray-700">
                  Set as default payment method
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all"
                >
                  {editingPayment ? 'Update Payment Method' : 'Save Payment Method'}
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

        {/* Payment Methods List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paymentMethods.map((method, idx) => (
            <div
              key={method._id}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-emerald-600 transition-all relative animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {method.isDefault && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Default
                </span>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 capitalize">
                    {method.type === 'card' ? 'Card' : method.type === 'upi' ? 'UPI' : 'Wallet'}
                  </h3>
                  <p className="text-sm text-gray-600">{method.name}</p>
                  {method.type === 'card' && method.number && (
                    <p className="text-sm text-gray-700 font-mono mt-1">
                      {maskCardNumber(method.number)}
                    </p>
                  )}
                  {method.type === 'upi' && method.upiId && (
                    <p className="text-sm text-gray-700 font-mono mt-1">
                      {method.upiId}
                    </p>
                  )}
                  {method.type === 'card' && method.expiryMonth && method.expiryYear && (
                    <p className="text-xs text-gray-500 mt-1">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => setAsDefault(method._id)}
                    className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleEdit(method)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(method._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {paymentMethods.length === 0 && !showForm && (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <CreditCard className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No payment methods saved</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Add a payment method for faster checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}







