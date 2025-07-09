import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";

export default function WritingScreen({ route, navigation }) {
  const { lessonId } = route.params;
  const userId = "664abc1234567890abcdef01"; // Replace with real user ID if available

  const [lesson, setLesson] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lesson/${lessonId}/writing`);
        setLesson(res.data);
        setTimeLeft(res.data.duration * 60);
      } catch (err) {
        console.error("Failed to load lesson", err);
        Alert.alert("Error", "Unable to load lesson.");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert(
        "✍️ Empty Answer",
        "Please write your answer before submitting."
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/result/submit", {
        userId,
        lessonId,
        skill: "writing",
        answers: { writing: answer },
      });
      Alert.alert("✅ Submitted", "Your writing has been saved for review.");
    } catch (err) {
      console.error("Submit failed", err);
      Alert.alert("Error", "Could not submit your writing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || submitting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>
          {loading ? "Loading..." : "Submitting..."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✍️ Writing Practice</Text>
        <Text style={styles.subtitle}>Lesson: {lesson.title}</Text>
        <Text style={styles.timer}>⏳ Time Left: {formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.promptBox}>
        <Text style={styles.promptTitle}>📝 Task</Text>
        <Text style={styles.promptText}>{lesson.content}</Text>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  timer: {
    fontSize: 14,
    color: "#dc2626",
    marginTop: 4,
    fontWeight: "600",
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
