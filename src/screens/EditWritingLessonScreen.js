import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import api from "../services/api";

export default function EditWritingLessonScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { id } = params;

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topicName, setTopicName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("20");
  const [level, setLevel] = useState("");

  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/lessons/${id}`);
      const lesson = res.data;
      setTitle(lesson.title || "");
      setContent(lesson.content || "");
      setDuration(String(lesson.duration || "20"));
      setLevel(lesson.level || "");
      setTopicName(lesson.topicId?.name || "");
      setDescription(lesson.topicId?.description || "");
    } catch (err) {
      console.error("Fetch lesson failed", err);
      Alert.alert("Lỗi", "Không thể tải dữ liệu bài học.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title || !content || !topicName || !description) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }

    try {
      await api.put(`/lessons/${id}`, {
        title,
        skill: "writing",
        level,
        content,
        duration: parseInt(duration),
        topic: { name: topicName, description },
      });

      Alert.alert("Success", "Lesson updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Update failed", err.response?.data || err);
      Alert.alert("Error", "Failed to update lesson.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Edit Writing Lesson</Text>

        <TextInput
          placeholder="Title *"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Writing Prompt *"
          style={[styles.input, styles.textArea]}
          multiline
          value={content}
          onChangeText={setContent}
        />
        <Text style={styles.subHeader}>Topic</Text>
        <TextInput
          placeholder="Topic Name"
          style={styles.input}
          value={topicName}
          onChangeText={setTopicName}
        />
        <TextInput
          placeholder="Topic Description"
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          placeholder="Duration (minutes)"
          style={styles.input}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
          <Text style={styles.submitText}>Update Lesson</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F0FDF4",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginTop: 20,
    marginBottom: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
