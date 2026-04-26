import { Text, View } from "react-native";

import { styles } from "../styles/common";

export function InfoBox({ text, title }: { text: string; title: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text selectable style={styles.infoText}>
        {text}
      </Text>
    </View>
  );
}
