"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingCart, Check, Loader2 } from "lucide-react"
import api from "@/lib/api"

interface OrderFormProps {
  productId: string
  productTitle: string
  onClose?: () => void
}

export function OrderForm({ productId, productTitle, onClose }: OrderFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    quantity: 1,
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await api.post("/orders", {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        items: [{
          product: productId,
          productTitle: productTitle,
          quantity: formData.quantity
        }],
        notes: formData.notes
      })

      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        setFormData({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          quantity: 1,
          notes: ""
        })
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 bg-accent text-white font-bold uppercase tracking-widest text-xs hover:bg-accent/90 transition-colors flex items-center justify-center gap-3"
      >
        <ShoppingCart className="w-4 h-4" />
        Place Order Now
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !loading && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md p-6 sm:p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => !loading && setIsOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Order Placed!</h3>
                  <p className="text-sm text-muted-foreground">We'll contact you shortly to confirm your order.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-primary uppercase tracking-wider mb-2">Place Order</h2>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-1">{productTitle}</p>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm border border-red-200">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none text-sm"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none text-sm"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                          className="w-12 h-12 flex items-center justify-center text-primary hover:bg-muted transition-colors text-xl font-bold"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center text-lg font-bold text-primary">
                          {formData.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                          className="w-12 h-12 flex items-center justify-center text-primary hover:bg-muted transition-colors text-xl font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none text-sm resize-none"
                        rows={3}
                        placeholder="Any special requirements..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-accent text-white font-bold uppercase tracking-widest text-xs hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Submit Order"
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
