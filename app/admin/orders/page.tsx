"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Package, Phone, Mail, Calendar, Loader2, Trash2, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import api from "@/lib/api"

interface OrderItem {
  product: any
  productTitle: string
  quantity: number
}

interface Order {
  _id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: OrderItem[]
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders")
      setOrders(data)
    } catch (err) {
      console.error("Failed to fetch orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus })
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      ))
    } catch (err) {
      console.error("Failed to update order:", err)
    } finally {
      setUpdating(null)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return
    
    try {
      await api.delete(`/orders/${orderId}`)
      setOrders(orders.filter(order => order._id !== orderId))
    } catch (err) {
      console.error("Failed to delete order:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-accent flex items-center gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-primary uppercase tracking-wider">Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-border p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary mb-2">No Orders Yet</h2>
            <p className="text-sm text-muted-foreground">Orders from customers will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon
              return (
                <div key={order._id} className="bg-white border border-border p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 text-xs font-bold uppercase flex items-center gap-1 ${statusConfig[order.status].color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[order.status].label}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-primary mb-2">{order.customerName}</h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 hover:text-accent">
                          <Phone className="w-4 h-4" />
                          {order.customerPhone}
                        </a>
                        {order.customerEmail && (
                          <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-1 hover:text-accent">
                            <Mail className="w-4 h-4" />
                            {order.customerEmail}
                          </a>
                        )}
                      </div>

                      {/* Items */}
                      <div className="border-t border-border pt-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Items Ordered</span>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <span className="text-sm font-medium text-primary">{item.productTitle}</span>
                            <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="mt-4 p-3 bg-muted/50 text-sm text-muted-foreground italic">
                          Note: {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        disabled={updating === order._id}
                        className="w-full px-3 py-2 border border-border text-sm focus:border-accent focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="w-full px-3 py-2 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
