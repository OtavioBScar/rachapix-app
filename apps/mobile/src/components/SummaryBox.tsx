import { Text, View } from "react-native";

import { styles } from "../styles/common";

export function SummaryBox({ label, tone, value }: { label: string; tone: "amber" | "green"; value: string }) {
  return (
    <View style={[styles.summaryBox, tone === "amber" ? styles.summaryAmber : styles.summaryGreen]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}
