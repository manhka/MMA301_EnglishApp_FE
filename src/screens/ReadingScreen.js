import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import api from "../services/api";
import { useNavigation, useRoute } from "@react-navigation/native";
export default function ReadingScreen() {
  const route = useRoute();
  const { lessonId } = route.params;
  const navigation = useNavigation();
  const [lesson, setLesson] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lesson/${lessonId}/details`);
        setLesson(res.data.lesson);
        setTimeLeft(res.data.lesson.duration * 60);
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

  const handleSelect = (qId, index, type) => {
    const key = String(qId);
    setAnswers((prev) => {
      if (type === "multiple-choice") {
        const current = prev[key] || [];
        const updated = current.includes(index)
          ? current.filter((i) => i !== index)
          : [...current, index];
        return { ...prev, [key]: updated };
      } else {
        return { ...prev, [key]: index };
      }
    });
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSubmit = () => {
    navigation.navigate("Result");
  };

  if (loading || !lesson) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />

      {/* Header cố định */}
      <View style={styles.fixedHeader}>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>⏳ {formatTime(timeLeft)}</Text>
        </View>
        <View style={styles.passageContainer}>
          <ScrollView style={styles.passageScroll} nestedScrollEnabled>
            <Text style={styles.passage}>{lesson.content}</Text>
          </ScrollView>
        </View>
      </View>

      {/* Nội dung cuộn */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        {lesson.questions.map((item, index) => {
          const qId = String(item._id);
          const isMultiple = item.type === "multiple-choice";

          const userAnswer = Object.prototype.hasOwnProperty.call(answers, qId)
            ? answers[qId]
            : isMultiple
            ? []
            : null;

          return (
            <View key={qId} style={styles.questionBlock}>
              {/* Tiêu đề câu hỏi + loại */}
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
                <Text style={styles.questionType}>
                  [{isMultiple ? "Multiple Choice" : "Single Choice"}]
                </Text>
              </View>

              {/* Nội dung câu hỏi */}
              <Text style={styles.questionText}>{item.questionText}</Text>

              {/* Danh sách đáp án */}
              {item.choices.map((choice, i) => {
                const selected = isMultiple
                  ? userAnswer.includes(i)
                  : userAnswer === i;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => handleSelect(qId, i, item.type)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionRow}>
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {choice}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Answers</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Lấy chiều cao màn hình để xác định chiều cao còn lại
const SCREEN_HEIGHT = Dimensions.get("window").height;
const FIXED_HEADER_HEIGHT = 220;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#6b7280" },

  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 30 : 10,
    backgroundColor: "#F0FDF4",
  },
  timerBox: { alignItems: "flex-end", marginBottom: 8 },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
    marginTop: 5,
  },
  passageContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    maxHeight: 160,
    marginBottom: 10,
  },
  passageScroll: { maxHeight: 130 },
  passage: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    textAlign: "justify",
  },

  scrollArea: {
    height: SCREEN_HEIGHT - FIXED_HEADER_HEIGHT,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 10,
  },
  questionBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  questionNumber: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  questionType: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  option: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#000000",
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: "#d1d5db",
    borderColor: "#000000",
  },
  optionText: {
    fontSize: 15,
    color: "#111827",
  },
  optionTextSelected: {
    fontWeight: "700",
    color: "#111827",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  submitBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 50,
    elevation: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
