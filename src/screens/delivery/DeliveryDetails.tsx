import React from "react";
import { useEffect, useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { supabase } from "../../api/supabase";
import { Order } from "../../types/database";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { SafeAreaView } from "react-native-safe-area-context";

const DeliveryDetails = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const [order, setOrder] = useState<Order | null>(null);
  const orderId = route.params?.orderId;

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, customer:customers(*), deliveries(*)")
      .eq("id", orderId)
      .single();
    setOrder(data);
  };

  const openMap = () => {
    if (!order?.customer?.address) return;
    const address = encodeURIComponent(order.customer.address);
    // Abre Google Maps; funciona no iOS e Android
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${address}`,
    );
  };

  const finishDelivery = async () => {
    const { error } = await supabase
      .from("deliveries")
      .update({ delivered_at: new Date().toISOString() })
      .eq("order_id", orderId);
    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }
    await supabase
      .from("orders")
      .update({ status: "entregue" })
      .eq("id", orderId);
    Alert.alert("Entrega finalizada", "Obrigado!");
    navigation.goBack();
  };

  if (!order) return <Text>Carregando...</Text>;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Pedido #{order.order_number}</Text>
        <Text>Cliente: {order.customer?.name}</Text>
        <Text>Endereço: {order.customer?.address}</Text>
        <Text>Pagamento: {order.payment_method}</Text>
        <Text>Total: R$ {order.total_value.toFixed(2)}</Text>
        <View style={{ marginVertical: 10 }}>
          <Button title="Abrir no Google Maps" onPress={openMap} />
        </View>
        <Button
          title="Finalizar Entrega"
          onPress={finishDelivery}
          color="green"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});

export default DeliveryDetails;
