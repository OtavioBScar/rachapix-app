import { Text } from "react-native";

import { styles } from "../styles/common";

export function EmptyState({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}
