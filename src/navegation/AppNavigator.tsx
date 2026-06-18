import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import Login from "../screens/auth/Login"; //------"../screens/auth/Login";
import KitchenStack from "./KitchenStack";
import AttendantStack from "./AttendantStack";
import DeliveryStack from "./DeliveryStack";
import AdminStack from "./AdminStack";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { session, profile, loading } = useAuth();

  if (loading) return null; // pode colocar uma splash screen

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Login" component={Login} />
        ) : profile?.role === "cozinheira" ? (
          <Stack.Screen name="KitchenRoot" component={KitchenStack} />
        ) : profile?.role === "atendente" ? (
          <Stack.Screen name="AttendantRoot" component={AttendantStack} />
        ) : profile?.role === "motoboy" ? (
          <Stack.Screen name="DeliveryRoot" component={DeliveryStack} />
        ) : (
          <Stack.Screen name="AdminRoot" component={AdminStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
