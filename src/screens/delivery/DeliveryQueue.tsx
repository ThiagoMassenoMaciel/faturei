import React from "react";
import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { supabase } from "../../api/supabase";
import { Order } from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";

import { SafeAreaView } from "react-native-safe-area-context";

const DeliveryQueue = ({ navigation }: any) => {
  const { profile } = useAuth();
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);

  const fetchReady = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("status", "feito")
      .order("created_at", { ascending: true });
    if (data) setReadyOrders(data);
  };

  useEffect(() => {
    fetchReady();
    const channel = supabase
      .channel("delivery-queue")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: "status=eq.feito",
        },
        fetchReady,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const acceptDelivery = async (orderId: number) => {
    // Verifica se o pedido já foi pego por outro motoboy
    const { data: existing } = await supabase
      .from("deliveries")
      .select("motoboy_id")
      .eq("order_id", orderId)
      .single();

    if (existing?.motoboy_id) {
      Alert.alert("Já foi pego", "Outro motoboy aceitou essa entrega.");
      fetchReady();
      return;
    }

    // Inserir ou atualizar (upsert) a tabela deliveries
    const { error } = await supabase.from("deliveries").upsert(
      {
        order_id: orderId,
        motoboy_id: profile?.id,
        accepted_at: new Date().toISOString(),
      },
      { onConflict: "order_id" },
    );
    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }

    // Atualizar status do pedido para em_entrega
    await supabase
      .from("orders")
      .update({ status: "em_entrega" })
      .eq("id", orderId);

    Alert.alert("Sucesso", "Você pegou a entrega!");
    navigation.navigate("DeliveryDetails", { orderId });
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <Text style={styles.orderNumber}>#{item.order_number}</Text>
      <Text>{item.customer?.name}</Text>
      <Text>{item.customer?.address}</Text>
      <Text>Valor: R$ {item.total_value.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.acceptBtn}
        onPress={() => acceptDelivery(item.id)}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Pegar Entrega</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <FlatList
          data={readyOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  card: { borderWidth: 1, padding: 15, marginBottom: 10, borderRadius: 8 },
  orderNumber: { fontSize: 20, fontWeight: "bold" },
  acceptBtn: {
    backgroundColor: "green",
    padding: 10,
    marginTop: 10,
    alignItems: "center",
    borderRadius: 5,
  },
});

export default DeliveryQueue;
