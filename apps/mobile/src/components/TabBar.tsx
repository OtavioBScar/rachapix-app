import { Pressable, Text, View } from "react-native";

import { styles } from "../styles/common";

export type AppTab = "charges" | "expenses" | "friends" | "profile";

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: "charges", label: "Cobrar" },
  { id: "expenses", label: "Despesas" },
  { id: "friends", label: "Amigos" },
  { id: "profile", label: "Perfil" },
];

export function TabBar({ activeTab, onChange }: { activeTab: AppTab; onChange: (tab: AppTab) => void }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onChange(tab.id)}
          style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
