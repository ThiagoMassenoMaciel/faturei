/*
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CreateOrder from "../screens/attendant/CreateOrder";

const Stack = createNativeStackNavigator();

const AttendantStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="CreateOrder"
      component={CreateOrder}
      options={{ title: "Novo Pedido" }}
    />
    //{Outras telas como lista de pedidos podem ser adicionadas}
  </Stack.Navigator>
);

*/

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrdersList from "../screens/attendant/OrdersList";
import CreateOrder from "../screens/attendant/CreateOrder";

const Stack = createNativeStackNavigator();

const AttendantStack = () => (
  <Stack.Navigator initialRouteName="OrdersList">
    <Stack.Screen
      name="OrdersList"
      component={OrdersList}
      options={{ title: "Pedidos Hoje" }}
    />
    <Stack.Screen
      name="CreateOrder"
      component={CreateOrder}
      options={{ title: "Novo Pedido" }}
    />
  </Stack.Navigator>
);

export default AttendantStack;
