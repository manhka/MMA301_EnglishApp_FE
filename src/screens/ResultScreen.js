import React from "react";
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";

export default function ResultScreen() {
  // DỮ LIỆU MẪU
  const result = {
    score: 80,
    totalQuestions: 5,
    correctAnswers: 4,
    details: [
      { questionId: "q1", selected: 1, correct: true },
      { questionId: "q2", selected: [0, 3], correct: false },
      { questionId: "q3", selected: 1, correct: true },
      { questionId: "q4", selected: 2, correct: true },
      { questionId: "q5", selected: 0, correct: false },
    ],
  };

  const lesson = {
    questions: [
      {
        _id: "q1",
        questionText: "What gas do trees make for us to breathe?",
        choices: ["Nitrogen", "Oxygen", "Carbon dioxide", "Methane"],
        correctAnswers: 1,
        type: "true-false",
      },
      {
        _id: "q2",
        questionText: "How do trees help the air?",
        choices: [
          "Make it dirty",
          "Make it clean",
          "Do nothing",
          "Make it hot",
        ],
        correctAnswers: [1, 3],
        type: "multiple-choice",
      },
      {
        _id: "q3",
        questionText: "Is oxygen important to humans?",
        choices: ["False", "True"],
        correctAnswers: 1,
        type: "true-false",
      },
      {
        _id: "q4",
        questionText: "What should we do to protect the environment?",
        choices: ["Cut trees", "Burn trees", "Plant more trees", "Do nothing"],
        correctAnswers: 2,
        type: "multiple-choice",
      },
      {
        _id: "q5",
        questionText: "Trees need money and gold to grow. (T/F)",
        choices: ["True", "False"],
        correctAnswers: 1,
        type: "true-false",
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryBox}>
          <Text style={styles.scoreText}>🎯 Score: {result.score}%</Text>
          <Text style={styles.summaryText}>
            ✅ Correct: {result.correctAnswers} / {result.totalQuestions}
          </Text>
        </View>

        {lesson.questions.map((q, index) => {
          const r = result.details.find((d) => d.questionId === q._id);
          const isMultiple = q.type === "multiple-choice";

          // Bảo vệ kiểu dữ liệu
          const userSelected = isMultiple
            ? Array.isArray(r?.selected)
              ? r.selected
              : []
            : r?.selected ?? null;

          const correctAnswers = q.correctAnswers;
          const isCorrect = r?.correct;

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
                  ? userSelected.includes(i)
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
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
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
});
