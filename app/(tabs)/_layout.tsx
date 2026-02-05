import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/src/i18n/use-translation";

const TAB_ICON_SIZE = 26;
const ACTIVE_CIRCLE_SIZE = 44;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const activeColor = theme.tabIconSelected;
  const inactiveColor = theme.tabIconDefault;
  const activeBg = theme.tabActiveBackground;
  const { t } = useTranslation();

  const wrapIcon = (focused: boolean, icon: React.ReactNode) => {
    if (!focused) return icon;
    return (
      <View
        style={{
          width: ACTIVE_CIRCLE_SIZE,
          height: ACTIVE_CIRCLE_SIZE,
          borderRadius: ACTIVE_CIRCLE_SIZE / 2,
          backgroundColor: activeBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, focused }) =>
            wrapIcon(
              focused,
              <IconSymbol
                size={28}
                name="house.fill"
                color={focused ? activeColor : color}
              />,
            ),
        }}
      />
      <Tabs.Screen
        name="providers"
        options={{
          title: t("tabs.providers"),
          tabBarIcon: ({ color, focused }) =>
            wrapIcon(
              focused,
              <MaterialIcons
                name="people"
                size={TAB_ICON_SIZE}
                color={focused ? activeColor : color}
              />,
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, focused }) =>
            wrapIcon(
              focused,
              <MaterialIcons
                name="person"
                size={TAB_ICON_SIZE}
                color={focused ? activeColor : color}
              />,
            ),
        }}
      />
      <Tabs.Screen
        name="home-sessions"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
