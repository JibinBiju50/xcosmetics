'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  Package,
  LogOut,
  Search,
  Filter,
  CheckCircle,
  Truck,
  Clock,
  CreditCard,
  Banknote,
  X,
  Copy,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageSquare,
  Star,
  Trash2,
  Edit2,
  Save,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  shipping_charge: number;
  total: number;
  payment_method: 'online' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'not_yet_shipped' | 'shipped' | 'delivered';
  courier_service: 'dtdc' | 'postal';
  created_at: string;
}

interface AdminDashboardClientProps {
  orders: Order[];
  reviews: Review[];
  products?: { id: string; name: string }[];
}

export default function AdminDashboardClient({ orders: initialOrders, reviews: initialReviews, products = [] }: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'reviews'>('orders');
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewProductFilter, setReviewProductFilter] = useState<string>('all');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewData, setEditingReviewData] = useState<Partial<Review>>({});
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, paymentStatusFilter, startDate, endDate]);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  const handleCopy = () => {
    if (!selectedOrder) return;
    const text = `Order ID: ${selectedOrder.order_id}
Name: ${selectedOrder.customer_name}
Phone: ${selectedOrder.customer_phone}
Email: ${selectedOrder.customer_email}
Address: ${selectedOrder.shipping_address}
Courier: ${selectedOrder.courier_service.toUpperCase()}
Total: ${formatPrice(selectedOrder.total)}
Payment: ${selectedOrder.payment_method.toUpperCase()} (${selectedOrder.payment_status})
Items:
${selectedOrder.items.map(i => `- ${i.name} x${i.quantity}`).join('\n')}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/xportal/login');
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['order_status']) => {
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('order_id', orderId);

    if (!error) {
      setOrders(orders.map(o =>
        o.order_id === orderId ? { ...o, order_status: newStatus } : o
      ));
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }
    }
    setUpdating(false);
  };

  const updatePaymentStatus = async (orderId: string, newStatus: Order['payment_status']) => {
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newStatus })
      .eq('order_id', orderId);

    if (!error) {
      setOrders(orders.map(o =>
        o.order_id === orderId ? { ...o, payment_status: newStatus } : o
      ));
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: newStatus });
      }
    }
    setUpdating(false);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setUpdating(true);
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (!error) {
      setReviews(reviews.filter(r => r.id !== reviewId));
    } else {
      alert('Failed to delete review');
    }
    setUpdating(false);
  };

  const handleUpdateReview = async (reviewId: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from('reviews')
      .update({
        customer_name: editingReviewData.customer_name,
        rating: editingReviewData.rating,
        comment: editingReviewData.comment,
      })
      .eq('id', reviewId);

    if (!error) {
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, ...editingReviewData } : r
      ));
      setEditingReviewId(null);
    } else {
      alert('Failed to update review');
    }
    setUpdating(false);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_method === paymentFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter;

    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (orderDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesPaymentStatus && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / 10));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * 10, currentPage * 10);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'not_yet_shipped').length,
    shipped: orders.filter(o => o.order_status === 'shipped').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length,
    unpaidOnline: orders.filter(
      o => o.payment_method === 'online' && (o.payment_status === 'pending' || o.payment_status === 'failed')
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={28} className="text-pink-500" />
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
        {/* Tab Switcher */}
        <div className="border-b bg-white px-4">
          <div className="container mx-auto flex gap-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 pt-2 font-medium text-sm transition-colors relative ${activeTab === 'orders' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Orders Management
              {activeTab === 'orders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 pt-2 font-medium text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Reviews Management
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-t-full" />}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto" style={{ padding: '32px 24px' }}>
        {activeTab === 'orders' ? (
          <>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '20px', marginBottom: '28px' }}>
          <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px' }}>
            <p className="text-gray-500 text-sm" style={{ marginBottom: '8px' }}>Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px' }}>
            <p className="text-gray-500 text-sm" style={{ marginBottom: '8px' }}>Not Yet Shipped</p>
            <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px' }}>
            <p className="text-gray-500 text-sm" style={{ marginBottom: '8px' }}>Shipped</p>
            <p className="text-2xl font-bold text-blue-500">{stats.shipped}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px' }}>
            <p className="text-gray-500 text-sm" style={{ marginBottom: '8px' }}>Delivered</p>
            <p className="text-2xl font-bold text-green-500">{stats.delivered}</p>
          </div>
        </div>



        {/* Filters */}
        <div
          className="bg-white rounded-xl shadow-sm flex flex-col md:flex-row md:items-center"
          style={{ padding: '20px', gap: '16px', marginBottom: '28px' }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Order ID, Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50 w-full md:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:flex-none w-full sm:w-auto">
                <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 sm:hidden w-10">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 w-full sm:w-auto flex-1"
                  title="Start Date"
                />
              </div>
              <div className="hidden sm:block text-gray-400 text-sm">to</div>
              <div className="flex items-center gap-2 flex-1 sm:flex-none w-full sm:w-auto border-t border-gray-200 sm:border-none pt-2 sm:pt-0">
                <span className="text-sm text-gray-500 sm:hidden w-10">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 w-full sm:w-auto flex-1"
                  title="End Date"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <Filter size={18} className="text-gray-400 hidden md:block" />
              <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="not_yet_shipped">Not Yet Shipped</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">Payment Type (All)</option>
              <option value="cod">COD Only</option>
              <option value="online">Online Only</option>
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">Payment Status (All)</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '24px' }}>
          {/* Orders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="font-semibold text-gray-700" style={{ marginBottom: '8px' }}>
              Orders ({filteredOrders.length})
            </h2>
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl text-center text-gray-500" style={{ padding: '40px 32px' }}>
                No orders found
              </div>
            ) : (
              paginatedOrders.map((order) => {
                const isProblem = order.payment_method === 'online' && (order.payment_status === 'pending' || order.payment_status === 'failed');
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`${
                      isProblem ? 'bg-red-50 border-2 border-red-200' : 'bg-white shadow-sm'
                    } rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedOrder?.id === order.id ? (isProblem ? 'ring-2 ring-red-500' : 'ring-2 ring-pink-500') : ''
                    }`}
                    style={{ padding: '20px' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className={`font-bold ${isProblem ? 'text-red-600' : 'text-pink-500'}`}>{order.order_id}</p>
                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isProblem ? 'bg-red-100 text-red-700' :
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.order_status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {isProblem ? (order.payment_status === 'failed' ? '✕ Failed' : '⏳ Unpaid') : order.order_status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {isMounted ? new Date(order.created_at).toLocaleDateString() : '...'}
                      </span>
                      <span className="font-semibold">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {order.payment_method === 'cod' ? (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Banknote size={14} /> COD
                        </span>
                      ) : (
                        <span className={`flex items-center gap-1 text-xs ${isProblem ? 'text-red-500' : 'text-gray-500'}`}>
                          <CreditCard size={14} /> Online {isProblem && `— ${order.payment_status}`}
                        </span>
                      )}
                      {!isProblem && (
                        <span className={`text-xs ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                          {order.payment_status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 mt-2">
                <span className="text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className={
            selectedOrder
              ? "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm lg:static lg:inset-auto lg:z-auto lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:block lg:sticky lg:top-4"
              : "hidden lg:block lg:sticky lg:top-4"
          }>
            {selectedOrder ? (
              <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative" style={{ padding: '28px' }}>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full lg:hidden"
                >
                  <X size={20} />
                </button>
                <div className="flex justify-between items-start mb-5 pr-8">
                  <h2 className="font-bold text-lg">Order Details</h2>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-sm font-medium text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Details'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Warning for unpaid online orders */}
                  {selectedOrder.payment_method === 'online' && selectedOrder.payment_status !== 'paid' && (
                    <div className="bg-red-100 border-2 border-red-400 rounded-xl flex items-center gap-3" style={{ padding: '14px 18px' }}>
                      <AlertTriangle size={22} className="text-red-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-red-800 text-sm">⚠ DO NOT SHIP — Payment not received</p>
                        <p className="text-xs text-red-600">
                          This customer selected online payment but {selectedOrder.payment_status === 'failed' ? 'the payment failed' : 'did not complete it'}.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-bold text-pink-500">{selectedOrder.order_id}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="text-gray-500 w-16">Name:</span>
                          <span className="font-medium text-gray-900">{selectedOrder.customer_name}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-16">Phone:</span>
                          <span className="font-medium text-gray-900">{selectedOrder.customer_phone}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-16">Email:</span>
                          <span className="font-medium text-gray-900 break-all">{selectedOrder.customer_email}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="text-gray-500 w-16">Address:</span>
                          <span className="font-medium text-gray-900 leading-tight flex-1">{selectedOrder.shipping_address}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-16">Courier:</span>
                          <span className="font-medium text-gray-900 uppercase">{selectedOrder.courier_service}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Items</p>
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1 border-b">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm py-1">
                      <span>Shipping</span>
                      <span>{formatPrice(selectedOrder.shipping_charge)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-pink-500">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>

                  {/* Status Controls */}
                  <div className="pt-4 border-t space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Order Status</p>
                      <div className="flex gap-2 flex-wrap">
                        {(['not_yet_shipped', 'shipped', 'delivered'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(selectedOrder.order_id, status)}
                            disabled={
                              updating ||
                              selectedOrder.order_status === status ||
                              (status !== 'not_yet_shipped' && selectedOrder.payment_method === 'online' && selectedOrder.payment_status !== 'paid')
                            }
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedOrder.order_status === status
                              ? status === 'delivered'
                                ? 'bg-green-500 text-white'
                                : status === 'shipped'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {status === 'not_yet_shipped' && <Clock size={14} className="inline mr-1" />}
                            {status === 'shipped' && <Truck size={14} className="inline mr-1" />}
                            {status === 'delivered' && <CheckCircle size={14} className="inline mr-1" />}
                            {status.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedOrder.payment_method === 'cod' && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Payment Status (COD)</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updatePaymentStatus(selectedOrder.order_id, 'pending')}
                            disabled={updating || selectedOrder.payment_status === 'pending'}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedOrder.payment_status === 'pending'
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(selectedOrder.order_id, 'paid')}
                            disabled={updating || selectedOrder.payment_status === 'paid'}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedOrder.payment_status === 'paid'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            Paid
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl text-center text-gray-500" style={{ padding: '40px 32px' }}>
                <Package size={48} className="mx-auto text-gray-300" style={{ marginBottom: '16px' }} />
                Select an order to view details
              </div>
            )}
          </div>
        </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-semibold text-gray-700">Reviews ({reviews.length})</h2>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={reviewProductFilter}
                  onChange={(e) => setReviewProductFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                >
                  <option value="all">All Products</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {reviews.filter(r => reviewProductFilter === 'all' || r.product_id === reviewProductFilter).length === 0 ? (
              <div className="bg-white rounded-xl text-center text-gray-500 py-12">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                No reviews found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.filter(r => reviewProductFilter === 'all' || r.product_id === reviewProductFilter).map(review => {
                  const isEditing = editingReviewId === review.id;
                  const productName = products.find(p => p.id === review.product_id)?.name || review.product_id;
                  return (
                    <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
                      {isEditing ? (
                        <div className="flex flex-col gap-3 flex-1">
                          <input 
                            value={editingReviewData.customer_name || ''} 
                            onChange={e => setEditingReviewData({...editingReviewData, customer_name: e.target.value})}
                            className="border px-3 py-1.5 rounded-lg text-sm"
                            placeholder="Customer Name"
                          />
                          <input 
                            type="number"
                            min="1" max="5"
                            value={editingReviewData.rating || ''} 
                            onChange={e => setEditingReviewData({...editingReviewData, rating: parseInt(e.target.value)})}
                            className="border px-3 py-1.5 rounded-lg text-sm"
                            placeholder="Rating (1-5)"
                          />
                          <textarea 
                            value={editingReviewData.comment || ''} 
                            onChange={e => setEditingReviewData({...editingReviewData, comment: e.target.value})}
                            className="border px-3 py-1.5 rounded-lg text-sm flex-1"
                            placeholder="Comment"
                            rows={3}
                          />
                          <div className="flex gap-2 justify-end mt-2">
                            <button onClick={() => setEditingReviewId(null)} className="px-3 py-1.5 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleUpdateReview(review.id)} disabled={updating} className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded-lg flex items-center gap-1 hover:bg-pink-600 disabled:opacity-50"><Save size={14} /> Save</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-bold text-gray-900">{review.customer_name}</p>
                              <div className="flex text-yellow-400 my-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-700 flex-1 mb-4">"{review.comment}"</p>
                          <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-100">
                            <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md max-w-[200px] truncate" title={productName}>{productName}</span>
                            <div className="flex gap-2">
                              <button onClick={() => {
                                setEditingReviewId(review.id);
                                setEditingReviewData(review);
                              }} className="text-blue-500 hover:text-blue-700 flex items-center gap-1"><Edit2 size={14} /> Edit</button>
                              <button onClick={() => handleDeleteReview(review.id)} disabled={updating} className="text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}