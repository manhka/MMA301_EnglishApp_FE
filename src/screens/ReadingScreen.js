import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar, // Import StatusBar
  Platform, // Import Platform for platform-specific styles
} from "react-native";

const mockReadingData = {
  passage:
    "Environmental pollution has become one of the biggest problems in many countries. It affects the air we breathe, the water we drink, and the food we eat. Addressing this complex issue requires a multi-faceted approach involving government policies, industrial innovations, and individual actions. Sustainable practices and a global commitment are crucial for safeguarding our planet for future generations.",
  questions: [
    {
      id: 1,
      question:
        "What essential elements are affected by environmental pollution?",
      options: [
        "Only the air we breathe",
        "Just water and the food we consume",
        "The air we breathe, the water we drink, and the food we eat",
        "None of the listed elements",
      ],
    },
    {
      id: 2,
      question: "Why has pollution become a major global concern?",
      options: [
        "It is often overlooked by authorities",
        "It significantly impacts critical natural resources",
        "It paradoxically stimulates economic growth",
        "It enhances the flavor profile of various foods",
      ],
    },
    {
      id: 3,
      question: "What is crucial for safeguarding our planet?",
      options: [
        "Ignoring the problem",
        "Individual actions only",
        "Sustainable practices and a global commitment",
        "Industrial innovations exclusively",
      ],
    },
  ],
};

export default function ReadingScreen() {
  const [answers, setAnswers] = useState({});

  const handleSelect = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = () => {
    console.log("User answers:", answers);
    // You could add navigation or evaluation logic here
    alert("Quiz Submitted! Check console for answers."); // Simple alert for demonstration
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header for the reading section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reading Passage</Text>
        </View>
        <View style={styles.passageContainer}>
          <Text style={styles.passage}>{mockReadingData.passage}</Text>
        </View>

        {/* Header for the questions section */}
        <View style={[styles.sectionHeader, styles.questionHeader]}>
          <Text style={styles.sectionTitle}>Questions</Text>
        </View>

        {mockReadingData.questions.map((q) => (
          <View key={q.id} style={styles.questionBlock}>
            <Text style={styles.questionNumber}>Question {q.id}.</Text>
            <Text style={styles.question}>{q.question}</Text>
            <View style={styles.optionsContainer}>
              {q.options.map((opt, idx) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(q.id, opt)}
                    activeOpacity={0.7} // Adds a subtle press effect
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Answers</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // A very light, almost white background
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === "android" ? 20 : 0, // Adjust for Android StatusBar
  },
  sectionHeader: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0", // Light gray line
    paddingBottom: 10,
  },
  questionHeader: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b", // Darker text for titles
  },
  passageContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  passage: {
    fontSize: 16,
    lineHeight: 25,
    color: "#334155", // Slightly softer black
    textAlign: "justify",
  },
  questionBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#64748b", // Muted gray
    marginBottom: 5,
  },
  question: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 15,
    color: "#1e293b",
    lineHeight: 24,
  },
  optionsContainer: {
    // No specific styles needed here, options handle their own spacing
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: "#f0fdf4", // Very light green for unselected options
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#d1fae5", // Lighter green border
    marginBottom: 10,
    flexDirection: "row", // To align text properly
    alignItems: "center",
    // Adding subtle shadow for a lifted effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  optionSelected: {
    backgroundColor: "#dcfce7", // A bit darker green for selected
    borderColor: "#059669", // Darker green border
    // Adding a more prominent shadow for selected state
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  optionText: {
    fontSize: 15,
    color: "#374151", // Standard text color
    flexShrink: 1, // Allows text to wrap
  },
  optionTextSelected: {
    color: "#047857", // Dark green for selected text
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: 30,
    backgroundColor: "#10b981", // Primary green
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    // Stronger shadow for the main action button
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5, // A little spacing for style
  },
});
