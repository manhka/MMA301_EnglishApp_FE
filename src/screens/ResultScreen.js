"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import api from "../services/api";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function ResultScreen() {
  const route = useRoute();
  const { resultId, isFromReview } = route.params;
  const navigation = useNavigation();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId) {
        setError("Result ID not found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/result/${resultId}`);
        setResult(res.data);
      } catch (err) {
        console.error("Failed to fetch result:", err);
        setError("Failed to load result. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  const handleBack = () => {
    if (isFromReview) {
      navigation.goBack();
    } else {
      navigation.navigate("Dashboard");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>Loading result...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleBack} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No result data available.</Text>
        <TouchableOpacity onPress={handleBack} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Header with Back Button and Centered Title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Test Result</Text>
          <Text style={styles.headerSubtitle}>
            Detailed breakdown of your performance
          </Text>
        </View>
        {/* Placeholder to balance the header and keep title centered */}
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <Text style={styles.lessonTitle}>{result.lessonId.title}</Text>
          <Text style={styles.metaText}>
            🕒 Duration: {result.lessonId.duration} mins
          </Text>
          <Text style={styles.metaText}>
            📅 Submitted At: {new Date(result.submittedAt).toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.scoreText}>🎯 Score: {result.score}%</Text>
          <Text style={styles.summaryText}>
            ✅ Correct: {result.details.filter((d) => d.correct).length} /{" "}
            {result.details.length}
          </Text>
        </View>
        {result.details.map((r, index) => {
          const q = r.questionId;
          const isMultiple = q.type === "multiple-choice";
          const userSelected = isMultiple
            ? Array.isArray(r.selected)
              ? r.selected
              : []
            : typeof r.selected === "number"
            ? r.selected
            : null;
          const correctAnswers = q.correctAnswers;
          const isCorrect = r.correct;
          return (
            <View key={q._id} style={styles.questionBox}>
              <Text style={styles.questionTitle}>
                Question {index + 1}: {q.questionText}
              </Text>
              {q.choices.map((choice, i) => {
                const isAnswerCorrect = Array.isArray(correctAnswers)
                  ? correctAnswers.includes(i)
                  : correctAnswers === i;
                const isSelected = isMultiple
                  ? Array.isArray(userSelected) && userSelected.includes(i)
                  : userSelected === i;
                return (
                  <View
                    key={i}
                    style={[
                      styles.choice,
                      isAnswerCorrect && styles.correctAnswer,
                      isSelected && !isAnswerCorrect && styles.wrongAnswer,
                      isSelected && styles.selectedAnswer,
                    ]}
                  >
                    <Text style={styles.choiceText}>
                      {isAnswerCorrect
                        ? "✅ "
                        : isSelected && !isAnswerCorrect
                        ? "❌ "
                        : "• "}
                      {choice}
                    </Text>
                  </View>
                );
              })}
              <Text
                style={{
                  color: isCorrect ? "#16a34a" : "#dc2626",
                  fontWeight: "600",
                  marginTop: 6,
                }}
              >
                {isCorrect ? "✔️ Correct" : "✖️ Incorrect"}
              </Text>
              {q.explanation && (
                <Text style={styles.explanation}>💡 {q.explanation}</Text>
              )}
            </View>
          );
        })}
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Dashboard")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>🏠 Back to Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "ios" ? 10 : StatusBar.currentHeight + 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40, // Fixed width for the button
    height: 40, // Fixed height for the button
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    // No absolute positioning needed
  },
  headerContent: {
    flex: 1, // Allows this view to take up available space
    alignItems: "center", // Centers the title and subtitle within its flexed space
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  backButtonPlaceholder: {
    width: 40, // Same width as backButton to balance the flex layout
    height: 40,
    // backgroundColor: 'transparent', // Can be used for debugging layout
  },
  headerBox: {
    backgroundColor: "#e0f2fe",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: "#475569",
  },
  summaryBox: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: "#334155",
  },
  questionBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  choice: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  choiceText: {
    fontSize: 15,
    color: "#1f2937",
  },
  correctAnswer: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  wrongAnswer: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
  },
  selectedAnswer: {
    borderWidth: 2,
  },
  explanation: {
    marginTop: 8,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 8,
  },
  actionContainer: {
    marginTop: 20,
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
