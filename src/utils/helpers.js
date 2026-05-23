export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export const ORDER_STATUS = {
  pending: { label: 'Aguardando confirmação', color: 'bg-yellow-100 text-yellow-700', step: 0 },
  accepted: { label: 'Pedido aceito', color: 'bg-blue-100 text-blue-700', step: 1 },
  preparing: { label: 'Em preparo', color: 'bg-orange-100 text-orange-700', step: 2 },
  delivering: { label: 'Saiu para entrega', color: 'bg-purple-100 text-purple-700', step: 3 },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700', step: 4 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', step: -1 },
}

export const CATEGORY_COLORS = {
  tradicional: 'bg-amber-50 border-amber-200',
  especial: 'bg-orange-50 border-orange-200',
  premium: 'bg-purple-50 border-purple-200',
  doce: 'bg-pink-50 border-pink-200',
}

export const CATEGORY_LABELS = {
  tradicional: 'Tradicional',
  especial: 'Especial',
  premium: 'Premium',
  doce: 'Doce',
}

export const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: '💠' },
  { id: 'credito', label: 'Cartão de Crédito', icon: '💳' },
  { id: 'debito', label: 'Cartão de Débito', icon: '💳' },
  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
]

export const calcPizzaPrice = (flavor1, flavor2, sizeMultiplier) => {
  const basePrice = flavor2
    ? Math.max(flavor1.price, flavor2.price)
    : flavor1.price
  return Math.round(basePrice * sizeMultiplier * 100) / 100
}
