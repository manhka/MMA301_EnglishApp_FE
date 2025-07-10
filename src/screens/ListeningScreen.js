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
  Animated,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BASE_URL } from "../constants/constants";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
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

  // Pulse animation for playing audio
  useEffect(() => {
    if (isPlaying) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isPlaying) pulse();
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const formatAudioTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayAudio = async () => {
    try {
      const audioUrl = `${BASE_URL}/uploads/audio1.mp3`;

      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying);
        }
      });
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

  const getAnswerStats = () => {
    if (!lesson?.questions) return { answered: 0, total: 0, unanswered: 0 };

    const total = lesson.questions.length;
    let answered = 0;

    lesson.questions.forEach((question) => {
      const qId = String(question._id);
      const userAnswer = answers[qId];

      if (question.type === "multiple-choice") {
        if (Array.isArray(userAnswer) && userAnswer.length > 0) {
          answered++;
        }
      } else {
        if (userAnswer !== null && userAnswer !== undefined) {
          answered++;
        }
      }
    });

    return {
      answered,
      total,
      unanswered: total - answered,
    };
  };

  const handleBack = () => {
    Alert.alert(
      "Leave Listening Test",
      "Are you sure you want to leave? Your progress will be lost.",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            if (sound) {
              sound.unloadAsync();
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSubmit = () => {
    const stats = getAnswerStats();
    const message =
      stats.unanswered > 0
        ? `You have ${stats.unanswered} unanswered questions. Are you sure you want to submit?`
        : "Are you sure you want to submit your answers?";

    Alert.alert("Submit Answers", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: async () => {
          setSubmitting(true);
          try {
            if (sound) {
              await sound.unloadAsync();
            }
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
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>
            {loading ? "Loading lesson..." : "Submitting your answers..."}
          </Text>
          {submitting && (
            <Text style={styles.loadingSubText}>
              Please wait while we process your submission
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />

      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Listening Test</Text>
          <Text style={styles.subtitle}>
            {lesson?.title || `Lesson ${lessonId}`}
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <View style={styles.timerBox}>
            <Ionicons name="time-outline" size={16} color="#dc2626" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
      </View>

      {/* Audio Player Section */}
      <View style={styles.audioSection}>
        <View style={styles.audioHeader}>
          <View style={styles.audioIconContainer}>
            <Ionicons name="headset-outline" size={24} color="#10b981" />
          </View>
          <Text style={styles.audioTitle}>Audio Player</Text>
        </View>

        <View style={styles.audioPlayerContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
              onPress={handlePlayAudio}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={32}
                color="#fff"
              />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.audioInfo}>
            <Text style={styles.audioStatus}>
              {isPlaying ? "Playing..." : "Ready to play"}
            </Text>
            {playbackDuration > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (playbackPosition / playbackDuration) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.timeDisplay}>
                  {formatAudioTime(playbackPosition)} /{" "}
                  {formatAudioTime(playbackDuration)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sessionInfo}>
          <View style={styles.sessionItem}>
            <Ionicons name="play-circle-outline" size={16} color="#059669" />
            <Text style={styles.sessionText}>
              Started: {startTime?.toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.sessionItem}>
            <Ionicons name="stop-circle-outline" size={16} color="#dc2626" />
            <Text style={styles.sessionText}>
              Ends: {endTime?.toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Questions Section */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.questionsHeader}>
          <Text style={styles.questionsTitle}>Questions</Text>
          <Text style={styles.questionsCount}>
            {lesson?.questions?.length || 0} questions
          </Text>
        </View>

        {lesson?.questions?.map((item, index) => {
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
                <View style={styles.questionNumberContainer}>
                  <Text style={styles.questionNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.questionType}>
                  {isMultiple ? "Multiple Choice" : "Single Choice"}
                </Text>
              </View>

              <Text style={styles.questionText}>{item.questionText}</Text>

              <View style={styles.optionsContainer}>
                {item.choices?.map((choice, i) => {
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
                      <View style={styles.optionContent}>
                        <View
                          style={[
                            styles.optionIndicator,
                            selected && styles.optionIndicatorSelected,
                          ]}
                        >
                          <Text style={styles.optionLetter}>
                            {String.fromCharCode(65 + i)}
                          </Text>
                        </View>
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
            </View>
          );
        })}

        {(() => {
          const answerStats = getAnswerStats();
          const allAnswered = answerStats.unanswered === 0;

          return (
            <View style={styles.submitSection}>
              <View style={styles.answerStatsContainer}>
                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statIndicator,
                      { backgroundColor: "#10b981" },
                    ]}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                  <Text style={styles.statText}>
                    {answerStats.answered} answered
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statIndicator,
                      { backgroundColor: "#f59e0b" },
                    ]}
                  >
                    <Ionicons name="help" size={16} color="#fff" />
                  </View>
                  <Text style={styles.statText}>
                    {answerStats.unanswered} remaining
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  !allAnswered && styles.submitBtnIncomplete,
                ]}
                onPress={handleSubmit}
              >
                <View style={styles.submitContent}>
                  <Ionicons
                    name={allAnswered ? "checkmark-circle" : "warning"}
                    size={20}
                    color="#fff"
                  />
                  <View style={styles.submitTextContainer}>
                    <Text style={styles.submitText}>
                      {allAnswered ? "Submit All Answers" : "Submit Answers"}
                    </Text>
                    <Text style={styles.submitSubText}>
                      {answerStats.answered}/{answerStats.total} questions
                      completed
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {!allAnswered && (
                <View style={styles.warningContainer}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#f59e0b"
                  />
                  <Text style={styles.warningText}>
                    You have {answerStats.unanswered} unanswered question
                    {answerStats.unanswered !== 1 ? "s" : ""}. You can still
                    submit, but consider reviewing them first.
                  </Text>
                </View>
              )}
            </View>
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    fontSize: 18,
    color: "#475569",
    marginTop: 16,
    fontWeight: "600",
  },

  loadingSubText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },

  // Enhanced Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 15,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },

  timerContainer: {
    alignItems: "flex-end",
  },

  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  timerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#dc2626",
    marginLeft: 4,
  },

  // Audio Section Styles
  audioSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F0FDF4",
  },

  audioHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  audioIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  audioTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },

  audioPlayerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },

  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  playButtonActive: {
    backgroundColor: "#059669",
  },

  audioInfo: {
    flex: 1,
  },

  audioStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },

  progressContainer: {
    marginTop: 8,
  },

  progressBar: {
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    marginBottom: 8,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 2,
  },

  timeDisplay: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },

  sessionInfo: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  sessionText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
    fontWeight: "500",
  },

  // Questions Section Styles
  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingBottom: 100,
    paddingTop: 16,
  },

  questionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  questionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },

  questionsCount: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },

  questionBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  questionNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },

  questionNumber: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
  },

  questionType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  questionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
    lineHeight: 24,
  },

  optionsContainer: {
    gap: 12,
  },

  option: {
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },

  optionSelected: {
    backgroundColor: "#ecfdf5",
    borderColor: "#10b981",
  },

  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  optionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  optionIndicatorSelected: {
    backgroundColor: "#10b981",
  },

  optionLetter: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },

  optionText: {
    fontSize: 16,
    color: "#334155",
    flex: 1,
    lineHeight: 22,
  },

  optionTextSelected: {
    fontWeight: "600",
    color: "#1e293b",
  },

  // Submit Section Styles
  submitSection: {
    marginTop: 30,
    marginBottom: 20,
  },

  answerStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  statIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  statText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  submitTextContainer: {
    marginLeft: 8,
    alignItems: "center",
  },

  submitSubText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  submitBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 0,
    marginBottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

  submitBtnIncomplete: {
    backgroundColor: "#f59e0b",
  },

  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },

  warningText: {
    fontSize: 13,
    color: "#92400e",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
