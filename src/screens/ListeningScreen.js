import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Audio } from "expo-av"; // Chỉ hoạt động nếu dùng Expo

export default function ListeningScreen({ route }) {
  const { lessonId } = route.params;

  // Mock data
  const audioUrl =
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const questions = [
    {
      id: "q1",
      question: "What is the main topic of the audio?",
      options: ["Weather", "Music", "Technology", "Education"],
      correct: 2,
    },
    {
      id: "q2",
      question: "What does the speaker suggest?",
      options: [
        "Taking notes",
        "Buying a ticket",
        "Reading a book",
        "Visiting a museum",
      ],
      correct: 0,
    },
  ];

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [sound, setSound] = useState(null);

  const playAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error("Error playing audio", err);
      Alert.alert("Error", "Cannot play audio.");
    }
  };

  const selectAnswer = (questionId, index) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎧 Listening Practice</Text>

      <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
        <Text style={styles.audioButtonText}>▶️ Play Audio</Text>
      </TouchableOpacity>

      {questions.map((q, qIndex) => (
        <View key={q.id} style={styles.questionBox}>
          <Text style={styles.questionText}>
            {qIndex + 1}. {q.question}
          </Text>
          {q.options.map((opt, idx) => {
            const isSelected = selectedAnswers[q.id] === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionSelected,
                ]}
                onPress={() => selectAnswer(q.id, idx)}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  audioButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  audioButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  questionBox: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: "#dbeafe",
  },
  optionText: {
    fontSize: 14,
    color: "#1e293b",
  },
  optionTextSelected: {
    fontWeight: "600",
    color: "#1d4ed8",
  },
});
