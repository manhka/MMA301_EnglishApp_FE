import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";
import { useRoute } from "@react-navigation/native";

export default function ResultScreen() {
  const route = useRoute();
  const { resultId } = route.params;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/result/${resultId}`);
        setResult(res.data);
      } catch (err) {
        console.error("Failed to fetch result:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading || !result) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>Loading result...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
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
});
