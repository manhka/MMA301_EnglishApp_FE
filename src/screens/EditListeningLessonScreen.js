import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function EditListeningLessonScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { id } = params || {};

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [addingQuestion, setAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("single-choice");
  const [newChoices, setNewChoices] = useState([""]);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`http://192.168.1.45:9999/api/lessons/${id}`);
      const lesson = await res.json();
      setTitle(lesson.title || "");
      setContent(lesson.content || "");
      setSkill(lesson.skill);
      setLevel(lesson.level);
      setTopicName(lesson.topic?.name || "");
      setTopicDescription(lesson.topic?.description || "");
      setQuestions(lesson.questions || []);
      if (lesson.media && lesson.media.url) {
        setAudioFile({
          uri: `http://192.168.1.45:9999/${lesson.media.url}`,
          name: lesson.media.filename || "audio.mp3",
          type: "audio/mpeg",
        });
      }
    } catch (err) {
      console.error("Fetch error", err);
      Alert.alert("Error", "Failed to load lesson data.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setAudioFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "audio/mpeg",
        });
      }
    } catch (err) {
      console.error("Pick file error:", err);
      Alert.alert("Error", "Failed to pick audio file.");
    }
  };

  const handleAddQuestion = () => {
    if (
      !newQuestionText ||
      newChoices.some((c) => !c) ||
      correctAnswers.length === 0
    ) {
      Alert.alert("Validation", "Please complete all fields.");
      return;
    }
    const newQ = {
      questionText: newQuestionText,
      type: newQuestionType,
      choices: [...newChoices],
      level,
      skill,
      correctAnswers,
    };
    setQuestions([...questions, newQ]);
    setNewQuestionText("");
    setNewChoices([""]);
    setCorrectAnswers([]);
    setAddingQuestion(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("skill", skill);
    formData.append("level", level);
    formData.append("content", content);
    formData.append(
      "topic",
      JSON.stringify({ name: topicName, description: topicDescription })
    );
    formData.append("questions", JSON.stringify(questions));
    if (audioFile && audioFile.uri && audioFile.uri.startsWith("file://")) {
      formData.append("media", {
        uri: audioFile.uri,
        name: audioFile.name,
        type: audioFile.type,
      });
    }

    try {
      const res = await fetch(`http://192.168.1.65:9999/api/lessons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });
      if (!res.ok) throw new Error("Server error");
      Alert.alert("Success", "Lesson updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Upload error:", err);
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Listening Lesson ({level})</Text>
      <TextInput
        style={styles.input}
        placeholder="Title *"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Content *"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TouchableOpacity style={styles.fileBtn} onPress={handlePickFile}>
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        <Text style={styles.fileBtnText}>
          {audioFile ? audioFile.name : "Pick Audio File"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>Topic</Text>
      <TextInput
        style={styles.input}
        placeholder="Topic Name"
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
            placeholder="Question Text *"
            value={newQuestionText}
            onChangeText={setNewQuestionText}
          />
          <TouchableOpacity
            onPress={() => {
              setNewQuestionType(
                newQuestionType === "single-choice"
                  ? "multiple-choice"
                  : "single-choice"
              );
              setCorrectAnswers([]);
            }}
            style={styles.toggleType}
          >
            <Text style={styles.toggleTypeText}>
              {newQuestionType === "single-choice"
                ? "Switch to Multiple Choice"
                : "Switch to Single Choice"}
            </Text>
          </TouchableOpacity>
          {newChoices.map((c, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={`Choice ${i + 1}`}
                value={c}
                onChangeText={(txt) => {
                  const updated = [...newChoices];
                  updated[i] = txt;
                  setNewChoices(updated);
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (newQuestionType === "single-choice") {
                    setCorrectAnswers([i]);
                  } else {
                    if (correctAnswers.includes(i)) {
                      setCorrectAnswers(correctAnswers.filter((idx) => idx !== i));
                    } else {
                      setCorrectAnswers([...correctAnswers, i]);
                    }
                  }
                }}
                style={{
                  marginLeft: 8,
                  padding: 6,
                  borderRadius: 4,
                  backgroundColor: correctAnswers.includes(i)
                    ? "#10b981"
                    : "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    color: correctAnswers.includes(i) ? "#fff" : "#374151",
                  }}
                >
                  ✓
                </Text>
              </TouchableOpacity>
            </View>
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
        <Text style={styles.submitText}>Update Lesson</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F0FDF4" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 22, fontWeight: "700", color: "#1e293b", marginBottom: 16 },
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
  textArea: { height: 80, textAlignVertical: "top" },
  fileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  fileBtnText: { color: "#fff", marginLeft: 8 },
  questionItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  questionText: { fontSize: 16, fontWeight: "500", color: "#1e293b" },
  questionType: { fontSize: 12, color: "#64748b" },
  newQuestionBlock: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  toggleType: { marginBottom: 8 },
  toggleTypeText: { color: "#10b981", fontWeight: "500" },
  addChoiceBtn: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  addChoiceText: { color: "#10b981", marginLeft: 4 },
  saveQuestionBtn: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  saveQuestionText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  addQuestionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  addQuestionText: { color: "#fff", marginLeft: 8 },
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
