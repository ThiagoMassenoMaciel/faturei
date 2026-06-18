import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import KitchenPanel from "../screens/kitchen/KitchenPanel";

const Stack = createNativeStackNavigator();

const KitchenStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="KitchenPanel"
      component={KitchenPanel}
      options={{ title: "Cozinha" }}
    />
  </Stack.Navigator>
);

export default KitchenStack;
