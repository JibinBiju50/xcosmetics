'use client';

import { useState } from 'react';
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
  Check
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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
}

export default function AdminDashboardClient({ orders: initialOrders }: AdminDashboardClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_method === paymentFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesPaymentStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'not_yet_shipped').length,
    shipped: orders.filter(o => o.order_status === 'shipped').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length,
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
      </header>

      <div className="container mx-auto" style={{ padding: '32px 24px' }}>
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
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={18} className="text-gray-400" />
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
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedOrder?.id === order.id ? 'ring-2 ring-pink-500' : ''}`}
                  style={{ padding: '20px' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-pink-500">{order.order_id}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.order_status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.order_status === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                      }`}>
                      {order.order_status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {order.payment_method === 'cod' ? (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Banknote size={14} /> COD
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <CreditCard size={14} /> Online
                      </span>
                    )}
                    <span className={`text-xs ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              ))
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
                            disabled={updating || selectedOrder.order_status === status}
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
      </div>
    </div>
  );
}