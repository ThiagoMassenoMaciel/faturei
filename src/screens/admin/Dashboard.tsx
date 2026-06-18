import React from "react";
import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { supabase } from "../../api/supabase";

const Dashboard = () => {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const today = new Date().toISOString().split("T")[0];

    // Faturamento (pedidos entregues hoje)
    const { data: orders } = await supabase
      .from("orders")
      .select("total_value")
      .eq("status", "entregue")
      .gte("created_at", today);
    const sumRevenue = orders?.reduce((acc, o) => acc + o.total_value, 0) || 0;
    setRevenue(sumRevenue);

    // Despesas de hoje
    const { data: exp } = await supabase
      .from("expenses")
      .select("amount")
      .eq("expense_date", today);
    const sumExp = exp?.reduce((acc, e) => acc + e.amount, 0) || 0;
    setExpenses(sumExp);

    // Top 5 produtos (global)
    const { data: top } = await supabase
      .from("order_items")
      .select("product_id, quantity, product:products(name)")
      .order("quantity", { ascending: false })
      .limit(5);
    setTopProducts(top || []);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <View style={styles.card}>
        <Text>Faturamento hoje: R$ {revenue.toFixed(2)}</Text>
        <Text>Despesas hoje: R$ {expenses.toFixed(2)}</Text>
        <Text style={{ fontWeight: "bold" }}>
          Lucro Líquido: R$ {(revenue - expenses).toFixed(2)}
        </Text>
      </View>

      <Text style={styles.subheader}>Top 5 Produtos</Text>
      {topProducts.map((tp, idx) => (
        <Text key={idx}>
          {tp.product?.name}: {tp.quantity} unidades
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  subheader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});

export default Dashboard;
