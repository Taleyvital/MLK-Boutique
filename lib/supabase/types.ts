export interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  category_id: string | null
  images: string[]
  sizes: string[]
  stock: number
  is_active: boolean
  is_new: boolean
  created_at: string
  categories?: Category
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  items: OrderItem[]
  total: number
  payment_method: 'mobile_money' | 'whatsapp'
  payment_status: 'pending' | 'paid' | 'failed'
  fedapay_transaction_id: string | null
  status: 'nouvelle' | 'confirmée' | 'livrée' | 'annulée'
  created_at: string
}

export interface OrderItem {
  id: string
  name: string
  price: number
  image: string
  size: string
  qty: number
  slug: string
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
    }
  }
}
