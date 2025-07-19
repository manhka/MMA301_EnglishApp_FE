"use client";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../services/api";

export default function CreateReadingLessonScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { level } = params;
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      choices: ["", "", "", ""],
      correctAnswers: [0],
      type: "single-choice",
    },
  ]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get("/topic/all");
      setTopics(Array.isArray(res.data.topics) ? res.data.topics : []);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
      topicId: "",
      duration: "10",
    },
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
      content: Yup.string().required("Required"),
      topicId: Yup.string().required("Please select a topic"),
      duration: Yup.number().required("Required").min(1, "Minimum 1 minute"),
    }),
    onSubmit: async (values) => {
      // Kiểm tra câu hỏi có bị thiếu questionText không
      const hasInvalid = questions.some(
        (q) => !q.questionText.trim() || q.choices.some((c) => !c.trim())
      );

      if (hasInvalid) {
        Alert.alert(
          "Invalid Question",
          "Each question must have text and all choices filled in."
        );
        return;
      }

      try {
        const selectedTopic = topics.find((t) => t._id === values.topicId);
        if (!selectedTopic) {
          Alert.alert("Error", "Selected topic not found.");
          return;
        }

        const finalQuestions = questions.map((q) => ({
          ...q,
          skill: "reading",
          level,
        }));

        await api.post("/lessons/full", {
          title: values.title,
          skill: "reading",
          level,
          content: values.content,
          duration: Number.parseInt(values.duration),
          topicId: values.topicId,
          media: [],
          questions: finalQuestions,
        });

        Alert.alert("Success", "Lesson created successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } catch (err) {
        console.error("Create failed:", err.response?.data || err.message);
        Alert.alert("Error", "Could not create lesson.");
      }
    },
  });

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        choices: ["", "", "", ""],
        correctAnswers: [0],
        type: "single-choice",
      },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    if (field === "type" && value === "true-false") {
      updated[index].choices = ["True", "False"];
      updated[index].correctAnswers = [0];
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
      if (question.correctAnswers.includes(cIndex)) {
        question.correctAnswers = question.correctAnswers.filter(
          (i) => i !== cIndex
        );
      } else {
        question.correctAnswers.push(cIndex);
      }
    }
    setQuestions(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0FDF4" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Reading Lesson</Text>
            <Text style={styles.subtitle}>Level: {level}</Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subHeader}>Topic *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formik.values.topicId}
              onValueChange={(itemValue) =>
                formik.setFieldValue("topicId", itemValue)
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
          {formik.touched.topicId && formik.errors.topicId && (
            <Text style={styles.errorText}>{formik.errors.topicId}</Text>
          )}
          <Text style={styles.label}>Title *</Text>

          <TextInput
            placeholder="Title *"
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
            placeholder="Reading Content *"
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            multiline
            value={formik.values.content}
            onChangeText={formik.handleChange("content")}
            onBlur={formik.handleBlur("content")}
          />
          {formik.touched.content && formik.errors.content && (
            <Text style={styles.errorText}>{formik.errors.content}</Text>
          )}

          <Text style={styles.label}>Duration (minutes) *</Text>
          <TextInput
            placeholder="Duration (minutes) *"
            keyboardType="numeric"
            style={styles.input}
            value={formik.values.duration}
            onChangeText={formik.handleChange("duration")}
            onBlur={formik.handleBlur("duration")}
          />
          {formik.touched.duration && formik.errors.duration && (
            <Text style={styles.errorText}>{formik.errors.duration}</Text>
          )}

          <Text style={styles.subHeader}>Questions</Text>
          {questions.map((q, index) => (
            <View key={index} style={styles.questionBlock}>
              <TextInput
                placeholder={`Question ${index + 1}`}
                style={styles.input}
                value={q.questionText}
                onChangeText={(text) =>
                  handleQuestionChange(index, "questionText", text)
                }
              />
              <View style={styles.pickerWrapper}>
                {" "}
                {/* Wrap Picker for consistent styling */}
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
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      value={choice}
                      onChangeText={(text) =>
                        handleChoiceChange(index, cIndex, text)
                      }
                    />
                  ) : (
                    <Text style={{ flex: 1, fontSize: 16 }}>
                      {" "}
                      {choice || ""}
                    </Text>
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
            <Text style={styles.submitText}>Create Lesson</Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 6,
    marginTop: 12,
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
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 16,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden", // Ensures the picker content respects border radius
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 5, // Added for alignment
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
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  correctBtn: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 16,
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
});
