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

export default function CreateLessonScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { adminName, skill, skillName, level } = params;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topicName, setTopicName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("10");

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      choices: ["", "", "", ""],
      correctAnswers: [0],
      type: "single-choice",
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
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

    if (question.type === "single-choice") {
      question.correctAnswers = [cIndex];
    } else {
      if (question.correctAnswers.includes(cIndex)) {
        question.correctAnswers = question.correctAnswers.filter((i) => i !== cIndex);
      } else {
        question.correctAnswers.push(cIndex);
      }
    }

    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!title || !content || !topicName || !description) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin lesson");
      return;
    }

    try {
      const finalQuestions = questions.map((q) => ({
        ...q,
        skill: skill,
        level: level,
      }));

      const res = await api.post("/lessons/full", {
        title,
        skill,
        level,
        content,
        duration: parseInt(duration),
        topic: {
          name: topicName,
          description,
        },
        media: [],
        questions: finalQuestions,
      });

      Alert.alert("Thành công", "Lesson đã được tạo", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error("Create failed", err.response?.data || err.message);
      Alert.alert("Lỗi", "Không thể tạo lesson");
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
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Tạo Lesson Reading ({level})</Text>

        <TextInput
          placeholder="Tiêu đề bài học"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Nội dung bài đọc"
          style={[styles.input, { height: 120 }]}
          multiline
          value={content}
          onChangeText={setContent}
        />
        <TextInput
          placeholder="Tên chủ đề"
          style={styles.input}
          value={topicName}
          onChangeText={setTopicName}
        />
        <TextInput
          placeholder="Mô tả chủ đề"
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          placeholder="Thời gian làm bài (phút)"
          style={styles.input}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        <Text style={styles.sectionTitle}>Danh sách câu hỏi</Text>
        {questions.map((q, index) => (
          <View key={index} style={styles.questionBlock}>
            <TextInput
              placeholder={`Câu hỏi ${index + 1}`}
              style={styles.input}
              value={q.questionText}
              onChangeText={(text) =>
                handleQuestionChange(index, "questionText", text)
              }
            />
            {q.choices.map((choice, cIndex) => (
              <View key={cIndex} style={styles.choiceRow}>
                <TextInput
                  placeholder={`Đáp án ${String.fromCharCode(65 + cIndex)}`}
                  style={[styles.input, { flex: 1 }]}
                  value={choice}
                  onChangeText={(text) =>
                    handleChoiceChange(index, cIndex, text)
                  }
                />
                <TouchableOpacity
                  style={[
                    styles.correctBtn,
                    q.correctAnswers.includes(cIndex) &&
                      styles.correctBtnActive,
                  ]}
                  onPress={() =>
                    handleCorrectAnswerChange(index, cIndex)
                  }
                >
                  <Text style={styles.correctText}>✔</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={handleAddQuestion}>
          <Text style={styles.addBtnText}>+ Thêm câu hỏi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Tạo Lesson</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  questionBlock: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  correctBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  correctBtnActive: {
    backgroundColor: "#10b981",
    borderColor: "#0f766e",
  },
  correctText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addBtn: {
    backgroundColor: "#f59e0b",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
  submitBtn: {
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
