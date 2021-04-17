import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HangView from "./HangView";
import { NavigationContainer } from "@react-navigation/native";
import * as color from "../app/colors";

const Account = () => (
    <View>
        <Text>Account information!</Text>
    </View>
)

const Tab = createBottomTabNavigator();
const TabNavigator = () => (
    <Tab.Navigator tabBarOptions={{
        activeBackgroundColor: color.white,
        activeTintColor: color.black,
        inactiveTintColor: "#aaa",
        inactiveBackgroundColor: color.white
    }}>
        <Tab.Screen name="Record" component={HangView}></Tab.Screen>
        <Tab.Screen name="Account" component={Account}></Tab.Screen>
    </Tab.Navigator>
)

export default function TopScreen() {
  return (
      <NavigationContainer>
          <TabNavigator/>
      </NavigationContainer>
  );
}
