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
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import api from "../services/api";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function ListeningScreen() {
  const route = useRoute();
  const { lessonId } = route.params;
  const navigation = useNavigation();

  const [lesson, setLesson] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sound, setSound] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const userId = "664abc1234567890abcdef01";

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lesson/${lessonId}/listening`);
        const loadedLesson = res.data;
        setLesson(loadedLesson);
        setTimeLeft(loadedLesson.duration * 60);

        const now = new Date();
        const end = new Date(now.getTime() + loadedLesson.duration * 60000);
        setStartTime(now);
        setEndTime(end);
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

  const handlePlayAudio = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: lesson.media[0],
      });
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      console.error("Audio play error:", err);
      Alert.alert("Error", "Could not play audio.");
    }
  };

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

  const handleSubmit = () => {
    Alert.alert("Submit Answers", "Are you sure you want to submit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          setSubmitting(true);
          try {
            const res = await api.post("/result/submit", {
              userId,
              lessonId,
              skill: "listening",
              answers,
            });

            setTimeout(() => {
              setSubmitting(false);
              navigation.navigate("Result", { resultId: res.data.resultId });
            }, 1500);
          } catch (err) {
            setSubmitting(false);
            console.error("Submit failed", err);
            Alert.alert("Error", "Could not submit your answers.");
          }
        },
      },
    ]);
  };

  if (loading || submitting) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>
          {loading ? "Loading..." : "Submitting your answers..."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />

      <View style={styles.lessonHeader}>
        <Text style={styles.lessonTitle}>{lesson?.title}</Text>
        <Text style={styles.metaText}>
          🕒 Start: {startTime?.toLocaleTimeString()}
        </Text>
        <Text style={styles.metaText}>
          ⏰ End: {endTime?.toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.audioBox}>
        <TouchableOpacity style={styles.audioBtn} onPress={handlePlayAudio}>
          <Text style={styles.audioText}>▶️ Play Audio</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>⏳ {formatTime(timeLeft)}</Text>
      </View>

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
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
                <Text style={styles.questionType}>
                  [{isMultiple ? "Multiple Choice" : "Single Choice"}]
                </Text>
              </View>

              <Text style={styles.questionText}>{item.questionText}</Text>

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

const SCREEN_HEIGHT = Dimensions.get("window").height;
const FIXED_HEADER_HEIGHT = 220;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#6b7280", marginTop: 10 },
  lessonHeader: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#475569",
  },
  audioBox: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 1,
  },
  audioBtn: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  audioText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  timerText: {
    marginTop: 10,
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "600",
  },
  scrollArea: {
    height: SCREEN_HEIGHT - FIXED_HEADER_HEIGHT,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 10,
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
