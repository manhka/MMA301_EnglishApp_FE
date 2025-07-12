"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";

export default function CreateListeningLesson() {
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [content, setContent] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("single-choice");
  const [newChoices, setNewChoices] = useState([""]);

  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      console.log("PICK RESULT", res);
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setAudioFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "audio/mpeg",
        });
      } else {
        setAudioFile(null);
      }
    } catch (err) {
      console.error("File pick error:", err);
      Alert.alert("Error", "Failed to pick audio file.");
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionText || newChoices.some((c) => !c)) {
      Alert.alert("Validation", "Please complete question and choices.");
      return;
    }
    const newQ = {
      questionText: newQuestionText,
      type: newQuestionType,
      choices: [...newChoices],
      level: level || "Beginner", // Default level
      skill: "listening",
      correctAnswers: [0], // Default: first answer correct
    };
    setQuestions([...questions, newQ]);
    setNewQuestionText("");
    setNewChoices([""]);
    setAddingQuestion(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !audioFile || !audioFile.uri) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }

    const finalLevel = level || "Beginner";

    console.log("Questions to send:", questions);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("skill", "listening");
    formData.append("level", finalLevel);
    formData.append("content", content);
    formData.append(
      "topic",
      JSON.stringify({ name: topicName, description: topicDescription })
    );
    formData.append("questions", JSON.stringify(questions));
    formData.append("media", {
      uri: audioFile.uri,
      name: audioFile.name,
      type: audioFile.type || "audio/mpeg",
    });

    try {
      const response = await fetch(
        "http://192.168.1.65:9999/api/lessons/full",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Server error");
      }

      Alert.alert("Success", "Lesson created successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Failed to create lesson.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create Listening Lesson</Text>
      <TextInput
        style={styles.input}
        placeholder="Title *"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Level (Beginner/Intermediate/Advanced)"
        value={level}
        onChangeText={setLevel}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TouchableOpacity style={styles.fileBtn} onPress={handlePickFile}>
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        <Text style={styles.fileBtnText}>
          {audioFile ? audioFile.name : "Pick Audio File *"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>Topic</Text>
      <TextInput
        style={styles.input}
        placeholder="Topic Name *"
        value={topicName}
        onChangeText={setTopicName}
      />
      <TextInput
        style={styles.input}
        placeholder="Topic Description"
        value={topicDescription}
        onChangeText={setTopicDescription}
      />

      <Text style={styles.subHeader}>Questions</Text>
      {questions.map((q, idx) => (
        <View key={idx} style={styles.questionItem}>
          <Text style={styles.questionText}>{q.questionText}</Text>
          <Text style={styles.questionType}>{q.type}</Text>
        </View>
      ))}
      {addingQuestion ? (
        <View style={styles.newQuestionBlock}>
          <TextInput
            style={styles.input}
            placeholder="Question Text"
            value={newQuestionText}
            onChangeText={setNewQuestionText}
          />
          <TouchableOpacity
            onPress={() =>
              setNewQuestionType(
                newQuestionType === "single-choice"
                  ? "multiple-choice"
                  : "single-choice"
              )
            }
            style={styles.toggleType}
          >
            <Text style={styles.toggleTypeText}>
              {newQuestionType === "single-choice"
                ? "Switch to Multiple Choice"
                : "Switch to Single Choice"}
            </Text>
          </TouchableOpacity>
          {newChoices.map((choice, i) => (
            <TextInput
              key={i}
              style={styles.input}
              placeholder={`Choice ${i + 1}`}
              value={choice}
              onChangeText={(txt) => {
                const updated = [...newChoices];
                updated[i] = txt;
                setNewChoices(updated);
              }}
            />
          ))}
          <TouchableOpacity
            style={styles.addChoiceBtn}
            onPress={() => setNewChoices([...newChoices, ""])}
          >
            <Ionicons name="add-circle-outline" size={18} color="#10b981" />
            <Text style={styles.addChoiceText}>Add Choice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveQuestionBtn}
            onPress={handleAddQuestion}
          >
            <Text style={styles.saveQuestionText}>Save Question</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addQuestionBtn}
          onPress={() => setAddingQuestion(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addQuestionText}>Add Question</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Create Lesson</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    height: 80,
    textAlignVertical: "top",
  },
  fileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  fileBtnText: {
    color: "#fff",
    marginLeft: 8,
  },
  questionItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
  questionType: {
    fontSize: 12,
    color: "#64748b",
  },
  newQuestionBlock: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  toggleType: {
    marginBottom: 8,
  },
  toggleTypeText: {
    color: "#10b981",
    fontWeight: "500",
  },
  addChoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  addChoiceText: {
    color: "#10b981",
    marginLeft: 4,
  },
  saveQuestionBtn: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  saveQuestionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  addQuestionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  addQuestionText: {
    color: "#fff",
    marginLeft: 8,
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
