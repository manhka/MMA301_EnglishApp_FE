import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";

export default function WritingScreen({ route }) {
  const { lessonId } = route.params;

  // Mock writing task content
  const prompt =
    "Write about your favorite hobby and explain why you enjoy it.";

  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (!answer.trim()) {
      Alert.alert(
        "✍️ Empty Answer",
        "Please write your answer before submitting."
      );
      return;
    }

    Alert.alert("✅ Submitted", "Your writing has been saved for review.");
    // Later: Send answer to backend or save in local
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✍️ Writing Practice</Text>
        <Text style={styles.subtitle}>Lesson ID: {lessonId}</Text>
      </View>

      <View style={styles.promptBox}>
        <Text style={styles.promptTitle}>📝 Task</Text>
        <Text style={styles.promptText}>{prompt}</Text>
      </View>

      <View style={styles.inputBox}>
        <Text style={styles.inputLabel}>Your Answer</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Type your response here..."
          multiline
          value={answer}
          onChangeText={setAnswer}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>📤 Submit Writing</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  promptBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    color: "#1f2937",
  },
  promptText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  inputBox: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 10,
    minHeight: 160,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  submitButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
