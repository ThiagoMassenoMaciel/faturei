import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeliveryQueue from "../screens/delivery/DeliveryQueue";
import DeliveryDetails from "../screens/delivery/DeliveryQueue";

const Stack = createNativeStackNavigator();

const DeliveryStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="DeliveryQueue"
      component={DeliveryQueue}
      options={{ title: "Prontos" }}
    />
    <Stack.Screen
      name="DeliveryDetails"
      component={DeliveryDetails}
      options={{ title: "Detalhes" }}
    />
  </Stack.Navigator>
);

export default DeliveryStack;
