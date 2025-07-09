import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";

export default function SpeakingScreen({ route }) {
  const { lessonId } = route.params;

  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const intervalRef = useRef(null);

  // Fetch lesson from API
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lesson/${lessonId}/speaking`);
        const data = res.data;

        setLesson(data);
        setTimeLeft(data.duration * 60); // convert mins → seconds
      } catch (err) {
        console.error("Failed to load speaking lesson", err);
        Alert.alert("Error", "Unable to load speaking prompt.");
        // fallback
        setLesson({
          title: "Speaking Practice",
          content:
            "Talk about your favorite holiday and explain why you like it.",
          duration: 2,
        });
        setTimeLeft(2 * 60);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // Countdown logic
  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isRecording) {
      stopRecording("⏰ Time's up!");
      submitAnswer(true);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRecording, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const stopRecording = (message) => {
    setIsRecording(false);
    setRecorded(true);
    clearInterval(intervalRef.current);
    Alert.alert(
      "🛑 Recording Stopped",
      message || "Your answer has been saved."
    );
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setIsRecording(true);
      setRecorded(false);
      setTimeLeft(lesson.duration * 60); // reset countdown
      Alert.alert("🎤 Recording Started", "Speak now...");
    }
  };

  const handlePlayback = () => {
    Alert.alert("🔊 Playback", "Playing your recorded answer... (placeholder)");
  };

  const submitAnswer = (auto = false) => {
    if (!recorded) {
      if (!auto) {
        Alert.alert("❗No Recording", "Please record your answer first.");
      }
      return;
    }

    Alert.alert(
      "✅ Submitted",
      auto
        ? "Your response was automatically submitted."
        : "Your speaking response has been submitted."
    );
  };

  const handleSubmit = () => {
    submitAnswer(false);
  };

  if (isLoading || !lesson) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: "#6b7280" }}>
          Loading lesson...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗣️ {lesson.title}</Text>
      <Text style={styles.lessonId}>Duration: {lesson.duration} mins</Text>

      <View style={styles.promptContainer}>
        <Text style={styles.promptTitle}>🎯 Prompt</Text>
        <Text style={styles.promptText}>{lesson.content}</Text>
      </View>

      {isRecording && (
        <Text style={styles.timer}>⏳ Time left: {formatTime(timeLeft)}</Text>
      )}

      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recording]}
        onPress={handleRecord}
        activeOpacity={0.8}
      >
        <Text style={styles.recordText}>
          {isRecording ? "🛑 Stop Recording" : "🎤 Start Recording"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.playbackButton,
          !recorded && { backgroundColor: "#d1d5db" },
        ]}
        onPress={handlePlayback}
        disabled={!recorded}
      >
        <Text style={styles.playbackText}>🔊 Play My Recording</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        activeOpacity={0.9}
      >
        <Text style={styles.submitText}>📤 Submit Answer</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6,
  },
  lessonId: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  promptContainer: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  promptText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  recordButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  recording: {
    backgroundColor: "#ef4444",
  },
  recordText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  timer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 12,
  },
  playbackButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 24,
  },
  playbackText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
});
