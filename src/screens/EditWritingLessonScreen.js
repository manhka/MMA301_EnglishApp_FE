import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
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

export default function EditWritingLessonScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { id } = params || {};

  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [topics, setTopics] = useState([]);

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
      topicId: "",
      duration: "20",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      content: Yup.string().required("Content is required"),
      topicId: Yup.string().required("Please select a topic"),
      duration: Yup.number()
        .required("Duration is required")
        .min(1, "Minimum 1 minute"),
    }),
    onSubmit: async (values) => {
      const selectedTopic = topics.find((t) => t._id === values.topicId);
      if (!selectedTopic) {
        Alert.alert("Error", "Selected topic not found.");
        return;
      }

      try {
        await api.put(`/lessons/${id}`, {
          title: values.title,
          skill: "writing",
          level,
          content: values.content,
          duration: parseInt(values.duration),
          topic: {
            name: selectedTopic.name,
            description: selectedTopic.description,
          },
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

  useEffect(() => {
    fetchLesson();
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

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/lessons/${id}`);
      const lesson = res.data;
      formik.setValues({
        title: lesson.title || "",
        content: lesson.content || "",
        topicId: lesson.topicId?._id || "",
        duration: String(lesson.duration || "20"),
      });
      setLevel(lesson.level || "");
    } catch (err) {
      Alert.alert("Error", "Failed to load lesson");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Edit Writing Lesson</Text>
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

          <Text style={styles.label}>Writing Prompt *</Text>
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
            onBlur={formik.handleBlur("duration")}
          />
          {formik.touched.duration && formik.errors.duration && (
            <Text style={styles.errorText}>{formik.errors.duration}</Text>
          )}

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
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  submitBtn: {
    backgroundColor: "#3b82f6",
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
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
