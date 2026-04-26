import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { styles } from "../styles/common";

interface ListItemProps {
  children?: ReactNode;
  footer?: string;
  title: string;
  value?: string;
}

export function ListItem({ children, footer, title, value }: ListItemProps) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <View style={styles.listItemText}>
          <Text style={styles.listItemTitle}>{title}</Text>
          {footer && <Text style={styles.listItemFooter}>{footer}</Text>}
        </View>
        {value && <Text style={styles.listItemValue}>{value}</Text>}
      </View>
      {children}
    </View>
  );
}
