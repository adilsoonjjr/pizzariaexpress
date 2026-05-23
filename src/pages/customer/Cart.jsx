import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { formatCurrency } from '../../utils/helpers'
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react'

export default function Cart() {
  const { items, removeItem, updateItem, subtotal, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Seu carrinho está vazio</h2>
        <p className="text-gray-400 mt-2 mb-6">Adicione pizzas deliciosas para continuar</p>
        <Link to="/" className="btn-primary max-w-xs">Ver cardápio</Link>
      </div>
    )
  }

  return (
    <div className="pb-32">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Meu Carrinho</h1>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600">Limpar</button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {items.map((item) => (
          <div key={item.cartId} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center flex-none">
                🍕
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 leading-tight">{item.pizzaName}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {item.sizeLabel}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                    Massa {item.dough}
                  </span>
                  {item.crust && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      Borda {item.crustFlavor}
                    </span>
                  )}
                </div>
                {item.observations && (
                  <p className="text-xs text-gray-400 mt-1 italic">"{item.observations}"</p>
                )}
                <p className="text-brand-500 font-bold mt-2">{formatCurrency(item.unitPrice)}/un</p>
              </div>
              <button
                onClick={() => removeItem(item.cartId)}
                className="p-2 text-red-400 hover:text-red-600 flex-none"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => item.quantity > 1
                    ? updateItem(item.cartId, { quantity: item.quantity - 1 })
                    : removeItem(item.cartId)
                  }
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateItem(item.cartId, { quantity: item.quantity + 1 })}
                  className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>
              <p className="font-bold text-gray-800">{formatCurrency(item.unitPrice * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary card */}
      <div className="mx-4 card p-4 mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span>Frete</span>
          <span>Calculado no checkout</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-3">
          <span>Total parcial</span>
          <span className="text-brand-500">{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <div className="px-4">
        <Link to="/checkout" className="btn-primary block text-center py-4">
          Ir para o checkout →
        </Link>
      </div>
    </div>
  )
}
