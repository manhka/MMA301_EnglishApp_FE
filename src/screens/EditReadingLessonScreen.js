"use client";
import React, { useEffect, useState } from "react";
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
import api from "../services/api";

export default function EditReadingLessonScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { id } = params || {};
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [questions, setQuestions] = useState([]);

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
    onSubmit: async (values) => {
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
      try {
        const finalQuestions = questions.map((q) => ({
          _id: q._id,
          questionText: q.questionText,
          choices: q.choices,
          correctAnswers: q.correctAnswers,
          type: q.type,
          skill: "reading",
          level,
        }));

        await api.put(`/lessons/${id}`, {
          title: values.title,
          skill: "reading",
          level,
          content: values.content,
          duration: parseInt(values.duration),
          topicId: values.topicId,
          media: [],
          questions: finalQuestions,
        });

        Alert.alert("Success", "Lesson updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } catch (err) {
        console.error("Update failed", err.response?.data || err);
        Alert.alert("Error", "Failed to update lesson.");
      }
    },
  });
  const fetchTopics = async () => {
    try {
      const res = await api.get("/topic/all");
      setTopics(Array.isArray(res.data.topics) ? res.data.topics : []);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  };
  useEffect(() => {
    fetchLesson();
    fetchTopics();
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

    if (question.type === "single-choice" || question.type === "true-false") {
      question.correctAnswers = [cIndex];
    } else {
      question.correctAnswers = question.correctAnswers.includes(cIndex)
        ? question.correctAnswers.filter((i) => i !== cIndex)
        : [...question.correctAnswers, cIndex];
    }

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
            <Text style={styles.title}>Edit Reading Lesson</Text>
            <Text style={styles.subtitle}>Level: {level}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
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

          <Text style={styles.label}>Duration (minutes) *</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            value={formik.values.duration}
            onChangeText={formik.handleChange("duration")}
          />

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
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={q.type}
                  onValueChange={(value) =>
                    handleQuestionChange(index, "type", value)
                  }
                >
                  <Picker.Item label="Single Choice" value="single-choice" />
                  <Picker.Item
                    label="Multiple Choice"
                    value="multiple-choice"
                  />
                  <Picker.Item label="True/False" value="true-false" />
                </Picker>
              </View>
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
            onPress={formik.handleSubmit}
          >
            <Text style={styles.submitText}>Update Lesson</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
  textArea: { height: 100, textAlignVertical: "top", height: 200 },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
