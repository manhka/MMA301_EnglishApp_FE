import React, { useState } from "react";
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
import { useRoute, useNavigation } from "@react-navigation/native";
import api from "../services/api";

export default function CreateLessonWritingScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { level } = params;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topicName, setTopicName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("20");

  const handleSubmit = async () => {
    if (!title || !content || !topicName || !description) {
      Alert.alert("Please fill all required fields.");
      return;
    }

    try {
      await api.post("/lessons/full", {
        title,
        skill: "writing",
        level,
        content,
        duration: parseInt(duration),
        topic: {
          name: topicName,
          description,
        },
        media: [],
        questions: [], // Writing không có câu hỏi
      });

      Alert.alert("Success", "Lesson created successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error("Create failed", err.response?.data || err.message);
      Alert.alert("Error", "Failed to create lesson.");
    }
  };

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
        <Text style={styles.header}>Create Writing Lesson ({level})</Text>

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

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Create Lesson</Text>
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
