import React from "react";
import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../../api/supabase";
import { Order, OrderStatus } from "../../types/database";
import { useAudioPlayer } from "expo-audio";

const KitchenPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Carrega o áudio de alerta
  const alertSource = require("../../../assets/alert.mp3");
  const player = useAudioPlayer(alertSource);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(
        "*, customer:customers(name), items:order_items(*, product:products(name))",
      )
      .in("status", ["nao_feito", "fazendo"])
      .order("created_at", { ascending: true });
    if (data) setOrders(data);
  };

  const playAlert = () => {
    if (player) {
      // Reinicia o áudio do zero: substitui a fonte pela mesma e toca
      player.replace(alertSource);
      player.play();
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          fetchOrders();
          playAlert();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as Order;
          if (updated.status === "cancelado") {
            Alert.alert(
              "Pedido Cancelado",
              `O pedido #${updated.order_number} foi cancelado.`,
            );
            fetchOrders();
          } else if (updated.status === "nao_feito") {
            fetchOrders();
            playAlert();
          } else {
            fetchOrders();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (orderId: number, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) Alert.alert("Erro", error.message);
    fetchOrders();
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const statusColor = item.status === "nao_feito" ? "red" : "orange";
    return (
      <View style={[styles.card, { borderLeftColor: statusColor }]}>
        <Text style={styles.orderNumber}>#{item.order_number}</Text>
        <Text>Cliente: {item.customer?.name}</Text>
        {item.items?.map((oi) => (
          <Text key={oi.id}>
            - {oi.product?.name} x{oi.quantity}
          </Text>
        ))}
        {item.notes ? <Text>Obs: {item.notes}</Text> : null}
        <View style={styles.buttons}>
          {item.status === "nao_feito" && (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => updateStatus(item.id, "fazendo")}
            >
              <Text>Iniciar</Text>
            </TouchableOpacity>
          )}
          {item.status === "fazendo" && (
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => updateStatus(item.id, "feito")}
            >
              <Text>Concluir (Anote #{item.order_number})</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos Ativos</Text>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    padding: 10,
    borderWidth: 1,
    borderLeftWidth: 10,
    marginBottom: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  orderNumber: { fontSize: 24, fontWeight: "bold" },
  buttons: { flexDirection: "row", marginTop: 10 },
  startBtn: {
    backgroundColor: "#FFD700",
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  doneBtn: { backgroundColor: "#98FB98", padding: 8, borderRadius: 5 },
});

export default KitchenPanel;
