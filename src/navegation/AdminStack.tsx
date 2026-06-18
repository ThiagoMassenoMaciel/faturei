import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "../screens/admin/Dashboard"; //../screens/admin/Dashboard
import Expenses from "../screens/admin/Expenses";
import UserManagement from "../screens/admin/UserManagement";
import Reports from "../screens/admin/Reports";
import ProductsCRUD from "../screens/admin/ProductsCRUD";

const Stack = createNativeStackNavigator();

const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Dashboard"
      component={Dashboard}
      options={{ title: "Painel" }}
    />
    <Stack.Screen
      name="Expenses"
      component={Expenses}
      options={{ title: "Despesas" }}
    />
    <Stack.Screen
      name="UserManagement"
      component={UserManagement}
      options={{ title: "Usuários" }}
    />
    <Stack.Screen
      name="Reports"
      component={Reports}
      options={{ title: "Relatórios" }}
    />
    <Stack.Screen
      name="ProductsCRUD"
      component={ProductsCRUD}
      options={{ title: "Cardápio" }}
    />
  </Stack.Navigator>
);

export default AdminStack;
