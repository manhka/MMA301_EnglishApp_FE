import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";

export default function SpeakingScreen({ route }) {
  const { lessonId } = route.params;

  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);

  // Placeholder speaking prompt
  const prompt =
    "Talk about your favorite holiday and explain why you like it.";

  const handleRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setRecorded(true);
      Alert.alert("🛑 Recording Stopped", "Your answer has been saved.");
    } else {
      // Start recording
      setIsRecording(true);
      setRecorded(false);
      Alert.alert("🎤 Recording Started", "Speak now...");
    }
  };

  const handlePlayback = () => {
    Alert.alert("🔊 Playback", "Playing your recorded answer... (placeholder)");
  };

  const handleSubmit = () => {
    if (!recorded) {
      Alert.alert("❗No Recording", "Please record your answer first.");
      return;
    }
    Alert.alert("✅ Submitted", "Your speaking response has been submitted.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗣️ Speaking Practice</Text>
      <Text style={styles.lessonId}>Lesson ID: {lessonId}</Text>

      <View style={styles.promptContainer}>
        <Text style={styles.promptTitle}>🎯 Prompt</Text>
        <Text style={styles.promptText}>{prompt}</Text>
      </View>

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
    marginBottom: 16,
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
});
