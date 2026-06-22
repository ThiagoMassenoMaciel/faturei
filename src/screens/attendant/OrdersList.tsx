import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../api/supabase";
import { Order } from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";

const OrdersList = ({ navigation }: any) => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  // Buscar pedidos do dia corrente
  const fetchTodayOrders = async () => {
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    const { data, error } = await supabase
      .from("orders")
      .select("*, customer:customers(name)")
      .eq("attendant_id", profile?.id)
      .gte("created_at", today) // maior ou igual ao início do dia
      .order("created_at", { ascending: false });
    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }
    if (data) setOrders(data);
  };

  // Atualizar ao focar a tela (quando voltar de CreateOrder)
  useFocusEffect(
    useCallback(() => {
      fetchTodayOrders();
    }, [profile]),
  );

  // Realtime: escutar mudanças nos pedidos para atualizar status
  useEffect(() => {
    const channel = supabase
      .channel("attendant-orders")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const updatedOrder = payload.new as Order;
          // Atualiza localmente se o pedido já estiver na lista
          setOrders((prev) =>
            prev.map((o) =>
              o.id === updatedOrder.id
                ? { ...o, status: updatedOrder.status }
                : o,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Mapeamento de cores para cada status
  const statusColor: Record<string, string> = {
    nao_feito: "#FF6B6B", // vermelho
    fazendo: "#FFD93D", // amarelo
    feito: "#6BCB77", // verde
    em_entrega: "#4D96FF", // azul
    entregue: "#B2B2B2", // cinza
    cancelado: "#FF0000",
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>#{item.order_number}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor[item.status] || "#ccc" },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text>Cliente: {item.customer?.name}</Text>
      <Text>Total: R$ {item.total_value?.toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.newOrderButton}
          onPress={() => navigation.navigate("CreateOrder")}
        >
          <Text style={styles.newOrderButtonText}>+ Novo Pedido</Text>
        </TouchableOpacity>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 70 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum pedido hoje ainda.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  newOrderButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  newOrderButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  orderNumber: { fontSize: 18, fontWeight: "bold" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  empty: { textAlign: "center", marginTop: 20, color: "#888" },
});

export default OrdersList;
