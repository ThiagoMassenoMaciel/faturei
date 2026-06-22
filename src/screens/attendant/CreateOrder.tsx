/*
import React from "react";
import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { supabase } from "../../api/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Product, Customer } from "../../types/database";


const CreateOrder = ({ navigation }: any) => {
  const { profile } = useAuth();
  const [customerPhone, setCustomerPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<
    { product: Product; quantity: number }[]
  >([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true);
    if (data) setProductsList(data);
  };

  const searchCustomer = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", customerPhone)
      .single();
    if (data) {
      setCustomer(data);
    } else {
      Alert.alert(
        "Cliente não encontrado",
        "Verifique o telefone ou cadastre primeiro.",
      );
    }
  };

  const addProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.product.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.product.id !== productId),
    );
  };

  const submitOrder = async () => {
    if (!customer || !profile) {
      Alert.alert("Selecione um cliente");
      return;
    }
    if (selectedProducts.length === 0) {
      Alert.alert("Adicione ao menos um produto");
      return;
    }

    const total = selectedProducts.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0,
    );

    // Inserir pedido
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        attendant_id: profile.id,
        total_value: total,
        notes: notes,
        payment_method: "dinheiro", // pode ser um picker
        status: "nao_feito",
        order_number: 0, // será atualizado depois
      })
      .select()
      .single();

    if (error) {
      Alert.alert("Erro ao criar pedido", error.message);
      return;
    }

    // Atribuir número do pedido igual ao ID (simples e sequencial)
    await supabase
      .from("orders")
      .update({ order_number: order.id })
      .eq("id", order.id);

    // Inserir itens
    const items = selectedProducts.map((p) => ({
      order_id: order.id,
      product_id: p.product.id,
      quantity: p.quantity,
      unit_price: p.product.price,
    }));
    const { error: itemError } = await supabase
      .from("order_items")
      .insert(items);
    if (itemError) {
      Alert.alert("Erro ao adicionar itens", itemError.message);
    }

    Alert.alert("Pedido enviado", `Nº ${order.id}`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cliente (telefone)</Text>
      <TextInput
        style={styles.input}
        value={customerPhone}
        onChangeText={setCustomerPhone}
        keyboardType="phone-pad"
      />
      <Button title="Buscar Cliente" onPress={searchCustomer} />
      {customer && <Text>Cliente: {customer.name}</Text>}

      <Text style={styles.label}>Produtos</Text>
      <FlatList
        data={productsList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productItem}
            onPress={() => addProduct(item)}
          >
            <Text>
              {item.name} - R$ {item.price.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.label}>Itens selecionados</Text>
      {selectedProducts.map((sp) => (
        <View key={sp.product.id} style={styles.selectedItem}>
          <Text>
            {sp.product.name} x{sp.quantity}
          </Text>
          <TouchableOpacity onPress={() => removeProduct(sp.product.id)}>
            <Text style={{ color: "red" }}>Remover</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TextInput
        style={styles.input}
        placeholder="Observações"
        value={notes}
        onChangeText={setNotes}
      />
      <Button title="Enviar Pedido" onPress={submitOrder} color="green" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, padding: 8, marginVertical: 5, borderRadius: 5 },
  productItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc" },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    backgroundColor: "#f0f0f0",
    marginVertical: 2,
  },
});

*/
import React from "react";
import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../api/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Product, Customer } from "../../types/database";

const CreateOrder = ({ navigation }: any) => {
  const { profile } = useAuth();

  // Estados para busca de cliente
  const [searchQuery, setSearchQuery] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  // Produtos e itens selecionados
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    { product: Product; quantity: number }[]
  >([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true);
    if (data) setProductsList(data);
  };

  // Buscar cliente de forma case-insensitive (nome ou telefone)
  const searchCustomer = async () => {
    const query = searchQuery.trim();
    if (!query) {
      Alert.alert("Digite nome ou telefone do cliente");
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(`phone.eq.${query},name.ilike.%${query}%`);

    if (error) {
      Alert.alert("Erro na busca", error.message);
      return;
    }

    if (data && data.length > 0) {
      setCustomer(data[0]);
      setShowNewCustomerForm(false);
      Alert.alert("Cliente encontrado", `Nome: ${data[0].name}`);
    } else {
      Alert.alert(
        "Cliente não encontrado",
        "Deseja cadastrar um novo cliente?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Cadastrar", onPress: () => setShowNewCustomerForm(true) },
        ],
      );
    }
  };

  // Cadastrar novo cliente
  const handleCreateCustomer = async () => {
    const name = newCustomerName.trim();
    const phone = newCustomerPhone.trim();
    if (!name || !phone) {
      Alert.alert("Preencha nome e telefone");
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        name,
        phone,
        created_by: profile?.id,
      })
      .select()
      .single();

    if (error) {
      Alert.alert("Erro ao cadastrar", error.message);
      return;
    }
    setCustomer(data);
    setShowNewCustomerForm(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    Alert.alert("Cliente cadastrado com sucesso!");
  };

  // Adicionar produto à seleção
  const addProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.product.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.product.id !== productId),
    );
  };

  // Enviar pedido
  const submitOrder = async () => {
    if (!customer || !profile) {
      Alert.alert("Selecione um cliente");
      return;
    }
    if (selectedProducts.length === 0) {
      Alert.alert("Adicione ao menos um produto");
      return;
    }

    const total = selectedProducts.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0,
    );

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        attendant_id: profile.id,
        total_value: total,
        notes,
        payment_method: "dinheiro",
        status: "nao_feito",
        order_number: 0,
      })
      .select()
      .single();

    if (error) {
      Alert.alert("Erro ao criar pedido", error.message);
      return;
    }

    // Atualizar número do pedido com o ID
    await supabase
      .from("orders")
      .update({ order_number: order.id })
      .eq("id", order.id);

    // Inserir itens
    const items = selectedProducts.map((p) => ({
      order_id: order.id,
      product_id: p.product.id,
      quantity: p.quantity,
      unit_price: p.product.price,
    }));
    const { error: itemError } = await supabase
      .from("order_items")
      .insert(items);
    if (itemError) {
      Alert.alert("Erro ao adicionar itens", itemError.message);
      return;
    }

    Alert.alert("Pedido enviado", `Nº ${order.id}`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        {/* Seção de cliente */}
        <Text style={styles.label}>Cliente</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome ou telefone do cliente"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button title="Buscar Cliente" onPress={searchCustomer} />
        {customer && (
          <Text style={styles.foundCustomer}>
            Cliente selecionado: {customer.name} ({customer.phone})
          </Text>
        )}

        {/* Formulário para novo cliente */}
        {showNewCustomerForm && (
          <View style={styles.newCustomerBox}>
            <Text>Cadastrar novo cliente</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={newCustomerName}
              onChangeText={setNewCustomerName}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={newCustomerPhone}
              onChangeText={setNewCustomerPhone}
              keyboardType="phone-pad"
            />
            <Button title="Salvar Cliente" onPress={handleCreateCustomer} />
            <Button
              title="Cancelar"
              color="red"
              onPress={() => setShowNewCustomerForm(false)}
            />
          </View>
        )}

        {/* Produtos */}
        <Text style={styles.label}>Produtos</Text>
        <FlatList
          data={productsList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productItem}
              onPress={() => addProduct(item)}
            >
              <Text>
                {item.name} - R$ {item.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.label}>Itens selecionados</Text>
        {selectedProducts.map((sp) => (
          <View key={sp.product.id} style={styles.selectedItem}>
            <Text>
              {sp.product.name} x{sp.quantity}
            </Text>
            <TouchableOpacity onPress={() => removeProduct(sp.product.id)}>
              <Text style={{ color: "red" }}>Remover</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TextInput
          style={styles.input}
          placeholder="Observações"
          value={notes}
          onChangeText={setNotes}
        />
        <Button title="Enviar Pedido" onPress={submitOrder} color="green" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
    paddingBottom: 70, // espaço extra para o botão não ser encoberto
  },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, padding: 8, marginVertical: 5, borderRadius: 5 },
  productItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc" },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    backgroundColor: "#f0f0f0",
    marginVertical: 2,
  },
  foundCustomer: { marginVertical: 5, fontStyle: "italic" },
  newCustomerBox: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default CreateOrder;
