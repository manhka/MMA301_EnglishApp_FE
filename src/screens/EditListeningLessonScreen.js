"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFormik } from "formik";
import * as Yup from "yup";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { BASE_URL } from "../constants/constants";
import api from "../services/api";
import * as SecureStore from "expo-secure-store";

export default function EditListeningLessonScreen() {
  const formatAudioTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  const { params } = useRoute();
  const navigation = useNavigation();
  const { id } = params || {};
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [audioFile, setAudioFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [level, setLevel] = useState("");
  const [topics, setTopics] = useState([]);
  const soundRef = useRef(null);
  const getTokenFromSecureStore = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      return token;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  };
  const handleSubmit = async (values) => {
    const selectedTopic = topics.find((t) => t._id === values.topicId);
    if (!selectedTopic) {
      Alert.alert("Error", "Selected topic not found.");
      return;
    }
    const invalidQuestionIndex = questions.findIndex(
      (q) =>
        !q.questionText.trim() ||
        q.choices.some((c) => !c.trim()) ||
        q.correctAnswers.length === 0
    );

    if (invalidQuestionIndex !== -1) {
      Alert.alert(
        "Invalid Question",
        `Please complete all fields and select at least one correct answer for question ${
          invalidQuestionIndex + 1
        }.`
      );
      return;
    }

    const finalQuestions = questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      choices: q.choices,
      correctAnswers: q.correctAnswers,
      type: q.type,
      skill: "listening",
      level,
    }));

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("skill", "listening");
    formData.append("level", level);
    formData.append("content", values.content);
    formData.append("topicId", values.topicId);
    formData.append("duration", values.duration);
    formData.append("questions", JSON.stringify(finalQuestions));

    if (audioFile?.uri?.startsWith("file://")) {
      formData.append("media", {
        uri: audioFile.uri,
        name: audioFile.name,
        type: audioFile.type,
      });
    }

    try {
      const token = await getTokenFromSecureStore();
      const res = await fetch(`${BASE_URL}/api/lessons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Server error");

      Alert.alert("Success", "Lesson updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to update lesson.");
    }
  };
  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
      topicId: "",
      duration: "10",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      content: Yup.string().required("Content is required"),
      topicId: Yup.string().required("Please select a topic"),
      duration: Yup.number().min(1).required("Duration is required"),
    }),
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    fetchLesson();
    fetchTopics();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/lessons/${id}`);
      const lesson = res.data;
      formik.setValues({
        title: lesson.title || "",
        content: lesson.content || "",
        topicId: lesson.topicId?._id || "",
        duration: String(lesson.duration || "10"),
      });
      setLevel(lesson.level || "");

      if (lesson.media?.length > 0) {
        setAudioFile({
          uri: `${BASE_URL}/uploads/${lesson.media}`,
          name: lesson.media[0].split("/").pop(),
          type: "audio/mpeg",
        });
      }

      const mappedQuestions = (lesson.questions || []).map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        choices:
          q.type === "true-false"
            ? ["True", "False"]
            : q.choices?.length
            ? q.choices
            : ["", "", "", ""],
        correctAnswers: q.correctAnswers || [],
        type: q.type || "single-choice",
      }));

      setQuestions(mappedQuestions);
    } catch (err) {
      Alert.alert("Error", "Failed to load lesson");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await api.get("/topic/all");
      setTopics(res.data.topics || []);
    } catch (err) {
      Alert.alert("Error", "Could not load topic list.");
    }
  };
  const handlePlayAudio = async () => {
    try {
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
      console.log("🎧 Playing audio from URI:", audioFile?.uri);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioFile.uri },
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
      Alert.alert("Error", "Cannot play audio.");
    }
  };

  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets?.length > 0) {
        const file = res.assets[0];
        setAudioFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "audio/mpeg",
        });
      }
    } catch {
      Alert.alert("Error", "Failed to pick audio file.");
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;

    if (field === "type") {
      if (value === "true-false") {
        updated[index].choices = ["True", "False"];
        updated[index].correctAnswers = [0];
      } else if (questions[index].type === "true-false") {
        updated[index].choices = ["", "", "", ""];
        updated[index].correctAnswers = [];
      }
    }

    setQuestions(updated);
  };

  const handleChoiceChange = (qIndex, cIndex, value) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, cIndex) => {
    const updated = [...questions];
    const question = updated[qIndex];

    if (["single-choice", "true-false"].includes(question.type)) {
      question.correctAnswers = [cIndex];
    } else {
      question.correctAnswers = question.correctAnswers.includes(cIndex)
        ? question.correctAnswers.filter((i) => i !== cIndex)
        : [...question.correctAnswers, cIndex];
    }

    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        choices: ["", "", "", ""],
        correctAnswers: [],
        type: "single-choice",
      },
    ]);
  };

  const handleDeleteQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0FDF4" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Edit Listening Lesson</Text>
            <Text style={styles.subtitle}>Level: {level}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Title */}
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formik.values.title}
            onChangeText={formik.handleChange("title")}
            onBlur={formik.handleBlur("title")}
          />
          {formik.touched.title && formik.errors.title && (
            <Text style={styles.errorText}>{formik.errors.title}</Text>
          )}

          {/* Content */}
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={formik.values.content}
            onChangeText={formik.handleChange("content")}
            onBlur={formik.handleBlur("content")}
          />
          {formik.touched.content && formik.errors.content && (
            <Text style={styles.errorText}>{formik.errors.content}</Text>
          )}

          {/* Audio */}
          {/* Audio Player Section - Modern UI */}
          <View style={styles.audioSection}>
            <Text style={styles.sectionHeading}>🎧 Listening Audio</Text>

            {/* Player Card */}
            <View style={styles.audioCard}>
              <TouchableOpacity
                style={[styles.audioBtn, isPlaying && styles.audioBtnActive]}
                onPress={handlePlayAudio}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>

              <View style={styles.audioDetails}>
                <Text style={styles.audioStatusText}>
                  {isPlaying ? "Playing..." : "Tap to Play"}
                </Text>

                {playbackDuration > 0 && (
                  <>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${
                              (playbackPosition / playbackDuration) * 100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.audioTime}>
                      {formatAudioTime(playbackPosition)} /{" "}
                      {formatAudioTime(playbackDuration)}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Timing Info */}
            <View style={styles.sessionRow}>
              <Ionicons name="play-circle-outline" size={16} color="#10b981" />
              <Text style={styles.sessionText}>
                {/* Start: {startTime?.toLocaleTimeString()} */}
              </Text>
            </View>
            <View style={styles.sessionRow}>
              <Ionicons name="stop-circle-outline" size={16} color="#ef4444" />
              <Text style={styles.sessionText}>
                {/* End: {endTime?.toLocaleTimeString()} */}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.fileBtn} onPress={handlePickFile}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.fileBtnText}>
              {audioFile ? audioFile.name : "Pick Audio File"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Topic *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formik.values.topicId}
              onValueChange={(value) => formik.setFieldValue("topicId", value)}
            >
              <Picker.Item label="-- Select Topic --" value="" />
              {topics.map((topic) => (
                <Picker.Item
                  key={topic._id}
                  label={topic.name}
                  value={topic._id}
                />
              ))}
            </Picker>
          </View>
          {formik.touched.topicId && formik.errors.topicId && (
            <Text style={styles.errorText}>{formik.errors.topicId}</Text>
          )}

          {/* Duration */}
          <Text style={styles.label}>Duration (minutes) *</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            value={formik.values.duration}
            onChangeText={formik.handleChange("duration")}
          />

          {/* Questions */}
          <Text style={styles.subHeader}>Questions</Text>
          {questions.map((q, index) => (
            <View key={index} style={styles.questionBlock}>
              <View style={styles.questionHeader}>
                <Text style={{ fontWeight: "600" }}>Question {index + 1}</Text>
                <TouchableOpacity onPress={() => handleDeleteQuestion(index)}>
                  <Text style={{ color: "#ef4444", fontWeight: "600" }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Question Text"
                style={styles.input}
                value={q.questionText}
                onChangeText={(text) =>
                  handleQuestionChange(index, "questionText", text)
                }
              />
              {topics.length === 0 ? (
                <Text style={{ fontStyle: "italic", color: "#64748b" }}>
                  Loading topics...
                </Text>
              ) : (
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formik.values.topicId}
                    onValueChange={(value) =>
                      formik.setFieldValue("topicId", value)
                    }
                  >
                    <Picker.Item label="-- Select Topic --" value="" />
                    {topics.map((topic) => (
                      <Picker.Item
                        key={topic._id}
                        label={topic.name}
                        value={topic._id}
                      />
                    ))}
                  </Picker>
                </View>
              )}

              {q.choices.map((choice, cIndex) => (
                <View key={cIndex} style={styles.choiceRow}>
                  {q.type !== "true-false" ? (
                    <TextInput
                      placeholder={`Choice ${String.fromCharCode(65 + cIndex)}`}
                      style={[styles.input, { flex: 1 }]}
                      value={choice}
                      onChangeText={(text) =>
                        handleChoiceChange(index, cIndex, text)
                      }
                    />
                  ) : (
                    <Text style={{ flex: 1 }}>{choice}</Text>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.correctBtn,
                      q.correctAnswers.includes(cIndex) &&
                        styles.correctBtnActive,
                    ]}
                    onPress={() => handleCorrectAnswerChange(index, cIndex)}
                  >
                    <Text
                      style={{
                        color: q.correctAnswers.includes(cIndex)
                          ? "#fff"
                          : "#374151",
                      }}
                    >
                      ✓
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}

          <TouchableOpacity
            style={styles.addQuestionBtn}
            onPress={handleAddQuestion}
          >
            <Text style={styles.addQuestionText}>+ Add Question</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => {
              console.log("👉 Button pressed");
              formik.handleSubmit();
            }}
          >
            <Text style={styles.submitText}>Update Lesson</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    height: 160,
  },
  fileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  fileBtnText: { color: "#fff", marginLeft: 8 },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginTop: 20,
    marginBottom: 8,
  },
  questionBlock: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  correctBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
  correctBtnActive: {
    backgroundColor: "#10b981",
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  addQuestionBtn: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  addQuestionText: {
    color: "#fff",
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 2,
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
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },

  audioCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },

  audioBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  audioBtnActive: {
    backgroundColor: "#059669",
  },

  audioDetails: {
    flex: 1,
  },

  audioStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  progressBarContainer: {
    height: 5,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#10b981",
  },

  audioTime: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },

  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  sessionText: {
    fontSize: 14,
    color: "#475569",
    marginLeft: 8,
    fontWeight: "500",
  },
});
