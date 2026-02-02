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
import { Picker } from "@react-native-picker/picker";
import api from "../services/api";

export default function CreateReadingLessonScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { level } = params;

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
        question.correctAnswers = question.correctAnswers.filter((i) => i !== cIndex);
      } else {
        question.correctAnswers.push(cIndex);
      }
    }

    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!title || !content || !topicName || !description) {
      Alert.alert("Please fill all required fields.");
      return;
    }

    try {
      const finalQuestions = questions.map((q) => ({
        ...q,
        skill: "reading",
        level: level,
      }));

      await api.post("/lessons/full", {
        title,
        skill: "reading",
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

      Alert.alert("Lesson created successfully", [
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
        <Text style={styles.header}>Create Reading Lesson ({level})</Text>

        <TextInput
          placeholder="Title *"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Reading Content *"
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

        <Text style={styles.subHeader}>Questions</Text>
        {questions.map((q, index) => (
          <View key={index} style={styles.questionBlock}>
            <TextInput
              placeholder={`Question ${index + 1}`}
              style={styles.input}
              value={q.questionText}
              onChangeText={(text) => handleQuestionChange(index, "questionText", text)}
            />

            <Picker
              selectedValue={q.type}
              style={styles.picker}
              onValueChange={(value) => handleQuestionChange(index, "type", value)}
            >
              <Picker.Item label="Single Choice" value="single-choice" />
              <Picker.Item label="Multiple Choice" value="multiple-choice" />
              <Picker.Item label="True/False" value="true-false" />
            </Picker>

            {q.choices.map((choice, cIndex) => (
              <View key={cIndex} style={styles.choiceRow}>
                {q.type !== "true-false" ? (
                  <TextInput
                    placeholder={`Choice ${String.fromCharCode(65 + cIndex)}`}
                    style={[styles.input, { flex: 1 }]}
                    value={choice}
                    onChangeText={(text) => handleChoiceChange(index, cIndex, text)}
                  />
                ) : (
                  <Text style={{ flex: 1 }}>{choice}</Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.correctBtn,
                    q.correctAnswers.includes(cIndex) && styles.correctBtnActive,
                  ]}
                  onPress={() => handleCorrectAnswerChange(index, cIndex)}
                >
                  <Text
                    style={{
                      color: q.correctAnswers.includes(cIndex) ? "#fff" : "#374151",
                    }}
                  >
                    ✓
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.addQuestionBtn} onPress={handleAddQuestion}>
          <Text style={styles.addQuestionText}>+ Add Question</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Create Lesson</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F0FDF4" },
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
  questionBlock: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  picker: {
    marginBottom: 12,
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
