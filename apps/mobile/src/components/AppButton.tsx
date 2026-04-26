import { ActivityIndicator, Pressable, Text } from "react-native";

import { styles } from "../styles/common";

interface ButtonProps {
  label: string;
  loading?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ label, loading, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      disabled={loading || disabled}  // <-- combine os dois
      onPress={onPress}
      style={[styles.primaryButton, (loading || disabled) && styles.buttonDisabled]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{label}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function DangerButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.dangerButton}>
      <Text style={styles.dangerButtonText}>{label}</Text>
    </Pressable>
  );
}
