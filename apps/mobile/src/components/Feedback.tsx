import { Text, View } from "react-native";

import { styles } from "../styles/common";

interface FeedbackProps {
  error: string | null;
  message: string | null;
}

export function Feedback({ error, message }: FeedbackProps) {
  if (!error && !message) {
    return null;
  }

  return (
    <View style={[styles.feedback, error ? styles.feedbackError : styles.feedbackSuccess]}>
      <Text style={[styles.feedbackText, error ? styles.feedbackErrorText : styles.feedbackSuccessText]}>
        {error ?? message}
      </Text>
    </View>
  );
}
