"use client";

import { useState, useEffect } from "react";
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
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import api from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

export default function WritingScreen({ route, navigation }) {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync("userId");
        if (id) {
          setUserId(id);
        } else {
          Alert.alert("Error", "User not found. Please login again.");
          navigation.navigate("Login");
        }
      } catch (err) {
        console.error("Failed to get userId", err);
      }
    };
    fetchUserId();
  }, []);

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

    // Automatically submit when time runs out
    if (timeLeft === 0 && !submitting && lesson) {
      handleSubmit(true); // Pass true to indicate auto-submission
    }

    return () => clearInterval(timer);
  }, [timeLeft, submitting, lesson, answer]); // Added answer to dependencies for word count update

  useEffect(() => {
    const words = answer
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 300) return "#10b981"; // Green
    if (timeLeft > 60) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  const handleBack = () => {
    if (answer.trim()) {
      Alert.alert(
        "⚠️ Unsaved Changes",
        "You have unsaved writing. Are you sure you want to go back? Your progress will be lost.",
        [
          {
            text: "Stay Here",
            style: "cancel",
          },
          {
            text: "Go Back",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const performSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/submit/writing", {
        userId,
        lessonId,
        question: lesson.content,
        text: answer,
      });
      const { submissionId } = res.data;
      navigation.navigate("Result2", {
        writingSubmissionId: submissionId,
      });
    } catch (err) {
      console.error("Submit failed", err);
      Alert.alert("Error", "Could not submit or evaluate your writing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (autoSubmit = false) => {
    // Added autoSubmit parameter
    if (!answer.trim() && !autoSubmit) {
      // Only show this alert if it's a manual submission and answer is empty
      Alert.alert(
        "✍️ Empty Answer",
        "Please write your answer before submitting."
      );
      return;
    }

    if (autoSubmit) {
      performSubmit(); // Directly submit if autoSubmit is true
    } else {
      Alert.alert(
        "📤 Submit Writing",
        `Are you sure you want to submit your writing?\n\nWord count: ${wordCount} words\nTime remaining: ${formatTime(
          timeLeft
        )}`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Submit",
            style: "default",
            onPress: performSubmit,
          },
        ]
      );
    }
  };

  if (loading || submitting) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>
            {loading ? "Loading lesson..." : "Submitting your work..."}
          </Text>
          {submitting && (
            <Text style={styles.loadingSubtext}>
              AI is evaluating your writing
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>✍️ Writing Practice</Text>
          <Text style={styles.subtitle}>{lesson.title}</Text>
          <View style={styles.statsRow}>
            <View
              style={[styles.statCard, { borderLeftColor: getTimeColor() }]}
            >
              <Text style={[styles.statValue, { color: getTimeColor() }]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={styles.statLabel}>Time Left</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#10b981" }]}>
              <Text style={[styles.statValue, { color: "#10b981" }]}>
                {wordCount}
              </Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <View style={styles.promptIconContainer}>
                <Text style={styles.promptIcon}>📝</Text>
              </View>
              <Text style={styles.promptTitle}>Writing Task</Text>
            </View>
            <Text style={styles.promptText}>{lesson.content}</Text>
          </View>
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Your Response</Text>
              <View style={styles.wordCounterContainer}>
                <Text style={styles.wordCounter}>{wordCount} words</Text>
              </View>
            </View>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Start writing your response here..."
                placeholderTextColor="#9ca3af"
                multiline
                value={answer}
                onChangeText={setAnswer}
                textAlignVertical="top"
                autoFocus={false}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !answer.trim() && styles.submitButtonDisabled,
            ]}
            onPress={() => handleSubmit(false)} // Explicitly pass false for manual submission
            disabled={!answer.trim() || submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Submitting..." : "📤 Submit Writing"}
            </Text>
          </TouchableOpacity>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#ffffff", // Changed from "#6366f1" to white
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : StatusBar.currentHeight + 25,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Changed to dark semi-transparent
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)", // Changed to dark border
  },
  backButtonText: {
    color: "#1e293b", // Changed from white to dark
    fontSize: 16,
    fontWeight: "600",
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b", // Changed from white to dark
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b", // Changed from light blue to gray
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statCard: {
    backgroundColor: "rgba(0, 0, 0, 0.05)", // Changed to light gray
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    minWidth: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b", // Changed from light blue to gray
    fontWeight: "500",
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexGrow: 1,
  },
  promptCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  promptIconContainer: {
    backgroundColor: "#f0f9ff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  promptIcon: {
    fontSize: 18,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  promptText: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 24,
    fontWeight: "400",
  },
  inputSection: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  wordCounterContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  wordCounter: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  textInputContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  textArea: {
    minHeight: 200,
    padding: 20,
    fontSize: 16,
    lineHeight: 24,
    color: "#1e293b",
    fontWeight: "400",
  },
  submitButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowColor: "#9ca3af",
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  bottomSpacer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingCard: {
    backgroundColor: "#ffffff",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    marginHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});
