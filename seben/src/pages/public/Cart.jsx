// src/pages/CartPage.jsx
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContex'

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto mb-6 text-seben-black/20" />
          <h1 className="text-3xl font-serif mb-4">Your Bag is Empty</h1>
          <p className="text-seben-black/60 mb-8">
            Discover our collections and add something beautiful to your bag.
          </p>
          <Link to="/shop" className="btn-luxury inline-block">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-12"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <h1 className="text-4xl font-serif text-center mb-12">Shopping Bag</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.cartId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex gap-6 p-6 bg-seben-cream-dark"
                >
                  {/* Image */}
                  <Link to={`/product/${item.id}`} className="shrink-0">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-28 h-36 object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-serif text-lg hover:text-seben-gold transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-seben-black/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-seben-black/60 text-sm capitalize mb-1">
                      {item.category}
                    </p>

                    {item.size && (
                      <p className="text-seben-black/60 text-sm mb-auto">
                        Size: {item.size}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-seben-black/20">
                        <button
                          onClick={() => updateQuantity(item.cartId, Math.max(1, item.quantity - 1))}
                          className="p-2 hover:bg-seben-cream transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="p-2 hover:bg-seben-cream transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={clearCart}
              className="text-sm text-seben-black/60 hover:text-red-500 transition-colors"
            >
              Clear All Items
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-seben-charcoal text-seben-cream p-8">
              <h2 className="text-xl font-serif mb-8">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-seben-cream/60">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-seben-cream/60">Shipping</span>
                  <span>{cartTotal >= 500 ? 'Complimentary' : formatPrice(25)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-seben-cream/60">Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-seben-cream/20 pt-4 mb-8">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal + (cartTotal >= 500 ? 0 : 25))}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full btn-gold flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/shop"
                className="block text-center mt-4 text-sm text-seben-cream/60 hover:text-seben-cream transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartPage