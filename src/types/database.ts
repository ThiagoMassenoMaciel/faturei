export type UserRole = "cozinheira" | "atendente" | "motoboy" | "admin";
export type OrderStatus =
  | "nao_feito"
  | "fazendo"
  | "feito"
  | "em_entrega"
  | "entregue"
  | "cancelado";

export interface Profile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  active: boolean;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  active: boolean;
}

export interface Order {
  id: number;
  order_number: number;
  customer_id: number;
  attendant_id: string;
  status: OrderStatus;
  notes?: string;
  payment_method: string;
  total_value: number;
  created_at: string;
  customer?: Customer;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
  is_altered: boolean;
  product?: Product;
}

export interface Delivery {
  id: number;
  order_id: number;
  motoboy_id?: string;
  accepted_at?: string;
  delivered_at?: string;
  delivery_fee: number;
  order?: Order;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  expense_date: string;
  category: string;
  created_by: string;
}
