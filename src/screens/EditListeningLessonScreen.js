import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Audio } from "expo-av";
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
      setTopicName(lesson.topicId?.name || "");
      setTopicDescription(lesson.topicId?.description || "");
      if (lesson.media && lesson.media.length > 0) {
        setAudioFile({
          uri: `http://192.168.1.45:9999/${lesson.media[0]}`,
          name: lesson.media[0].split("/").pop(),
          type: "audio/mpeg",
        });
        console.log("CHECK");
      }

      const mappedQuestions = (lesson.questions || []).map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        type: q.type || "single-choice",
        choices:
          q.type === "true-false"
            ? ["True", "False"]
            : q.choices?.length
            ? q.choices
            : ["", "", "", ""],
        correctAnswers: q.correctAnswers || [],
      }));
      setQuestions(mappedQuestions);
    } catch (err) {
      console.error("Fetch error", err);
      Alert.alert("Error", "Failed to load lesson.");
      navigation.navigate("Admin");
    } finally {
      setLoading(false);
    }
  };
  // Tạo ref để lưu Audio.Sound instance
  const soundRef = useRef(null);

  const handlePlayAudio = async () => {
    try {
      // Nếu đang có audio đang phát, dừng và unload
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Tạo audio mới và play
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioFile.uri },
        { shouldPlay: true }
      );

      // Lưu sound vào ref để lần sau dừng được
      soundRef.current = sound;
    } catch (error) {
      console.error("Audio play error:", error);
      Alert.alert("Error", "Cannot play audio.");
    }
  };

  // Dọn dẹp audio khi unmount màn hình
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

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
      } else {
        if (questions[index].type === "true-false") {
          updated[index].choices = ["", "", "", ""];
          updated[index].correctAnswers = [];
        }
      }
    }

    setQuestions(updated);
  };

  const handleChoiceChange = (qIndex, cIndex, value) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex] = value;
    setQuestions(updated);
  };

  const handleAddChoice = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.push("");
    setQuestions(updated);
  };

  const handleRemoveChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.splice(cIndex, 1);
    updated[qIndex].correctAnswers = updated[qIndex].correctAnswers.filter(
      (i) => i !== cIndex
    );
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

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert("Validation", "Please fill all required fields.");
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
    formData.append("title", title);
    formData.append("skill", "listening");
    formData.append("level", level);
    formData.append("content", content);
    formData.append(
      "topic",
      JSON.stringify({ name: topicName, description: topicDescription })
    );
    formData.append("questions", JSON.stringify(finalQuestions));

    if (audioFile && audioFile.uri && audioFile.uri.startsWith("file://")) {
      formData.append("media", {
        uri: audioFile.uri,
        name: audioFile.name,
        type: audioFile.type,
      });
    }

    try {
      const res = await fetch(`http://192.168.1.45:9999/api/lessons/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Server error");
      Alert.alert("Success", "Lesson updated successfully.", [
        { text: "OK", onPress: () => navigation.navigate("Admin") },
      ]);
    } catch (err) {
      console.error("Update failed", err);
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
    <View style={{ flex: 1, backgroundColor: "#F0FDF4" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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

        <TouchableOpacity onPress={handlePlayAudio}>
          <Text style={{ color: "#2563eb", marginBottom: 8 }}>
            ▶️ Play Existing Audio
          </Text>
        </TouchableOpacity>

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
        {questions.map((q, index) => (
          <View key={index} style={styles.questionBlock}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
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
            <Picker
              selectedValue={q.type}
              style={styles.picker}
              onValueChange={(value) =>
                handleQuestionChange(index, "type", value)
              }
            >
              <Picker.Item label="Single Choice" value="single-choice" />
              <Picker.Item label="Multiple Choice" value="multiple-choice" />
              <Picker.Item label="True/False" value="true-false" />
            </Picker>
            {q.choices.map((choice, cIndex) => (
              <View key={cIndex} style={styles.choiceRow}>
                {q.type !== "true-false" ? (
                  <>
                    <TextInput
                      placeholder={`Choice ${String.fromCharCode(65 + cIndex)}`}
                      style={[styles.input, { flex: 1 }]}
                      value={choice}
                      onChangeText={(text) =>
                        handleChoiceChange(index, cIndex, text)
                      }
                    />
                    <TouchableOpacity
                      onPress={() => handleRemoveChoice(index, cIndex)}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={20}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </>
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
            {q.type !== "true-false" && (
              <TouchableOpacity onPress={() => handleAddChoice(index)}>
                <Text style={{ color: "#10b981", marginTop: 4 }}>
                  + Add Choice
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addQuestionBtn}
          onPress={handleAddQuestion}
        >
          <Text style={styles.addQuestionText}>+ Add Question</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Update Lesson</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F0FDF4" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  submitBtn: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
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
  questionBlock: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  picker: { marginBottom: 12 },
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
  correctBtnActive: { backgroundColor: "#10b981" },
  addQuestionBtn: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  addQuestionText: { color: "#fff", fontWeight: "600" },
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
