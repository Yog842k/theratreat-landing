'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Plus
} from 'lucide-react';

interface RefundRequest {
  _id: string;
  orderNumber: string;
  productName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  amount: number;
  requestedDate: string;
  image?: string;
  description?: string;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    orderNumber: '',
    productName: '',
    reason: '',
    description: '',
    amount: 0
  });

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = () => {
    try {
      const saved = localStorage.getItem('therastore_refunds');
      if (saved) {
        setRefunds(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading refunds:', error);
    }
  };

  const saveRefunds = (newRefunds: RefundRequest[]) => {
    localStorage.setItem('therastore_refunds', JSON.stringify(newRefunds));
    setRefunds(newRefunds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRefund: RefundRequest = {
      _id: Date.now().toString(),
      orderNumber: formData.orderNumber,
      productName: formData.productName,
      reason: formData.reason,
      description: formData.description,
      amount: formData.amount,
      status: 'pending',
      requestedDate: new Date().toISOString()
    };

    saveRefunds([...refunds, newRefund]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      orderNumber: '',
      productName: '',
      reason: '',
      description: '',
      amount: 0
    });
    setShowForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'processed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'processed':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                Returns & Refunds
              </h1>
              <p className="text-xl text-gray-600">
                Request a return or refund for your orders
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Request
              </button>
            )}
          </div>
        </div>

        {/* Request Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Request Return/Refund</h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="ORD123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Product name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Return/Refund *
                </label>
                <select
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                >
                  <option value="">Select a reason</option>
                  <option value="defective">Defective Product</option>
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="damaged">Damaged During Shipping</option>
                  <option value="not_as_described">Not as Described</option>
                  <option value="size_issue">Size/Size Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="Please provide any additional information about your return/refund request..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all"
                >
                  Submit Request
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

        {/* Refunds List */}
        <div className="space-y-4">
          {refunds.map((refund, idx) => (
            <div
              key={refund._id}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{refund.productName}</h3>
                    <p className="text-sm text-gray-600">Order #{refund.orderNumber}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Requested on {new Date(refund.requestedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(refund.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(refund.status)}`}>
                    {refund.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reason</p>
                  <p className="font-semibold text-gray-900 capitalize">{refund.reason.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Refund Amount</p>
                  <p className="text-2xl font-extrabold text-emerald-600">₹{refund.amount.toLocaleString()}</p>
                </div>
              </div>

              {refund.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-700">{refund.description}</p>
                </div>
              )}

              {refund.status === 'pending' && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Your request is being reviewed. We'll update you soon.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {refunds.length === 0 && !showForm && (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <FileText className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No refund requests</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Start a new return or refund request for your orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}







