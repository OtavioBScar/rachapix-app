import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { styles } from "../styles/common";

export function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
