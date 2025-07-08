"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../services/api";

export default function LessonDetailScreen() {
  const route = useRoute();
  const { lessonId } = route.params;
  const navigation = useNavigation();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lesson/${lessonId}/details`);
        setLesson(res.data.lesson);
      } catch (error) {
        console.error("Error loading lesson", error);
        Alert.alert("Error", "Failed to load lesson details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleStartLesson = () => {
    if (lesson) {
      Alert.alert("🚀 Start Lesson", `Starting "${lesson.title}" now...`);
      navigation.navigate("Speaking", { lessonId: lesson._id });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Oops! Lesson not found.</Text>
        <Text style={styles.errorSubText}>Please try again later.</Text>
      </View>
    );
  }

  const { title, level, skill, topicId, content, media, questions, duration } =
    lesson;

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return {
          backgroundColor: "#dcfce7",
          color: "#166534",
          borderColor: "#86efac",
        };
      case "Intermediate":
        return {
          backgroundColor: "#fef3c7",
          color: "#92400e",
          borderColor: "#fbbf24",
        };
      case "Advanced":
        return {
          backgroundColor: "#fecaca",
          color: "#991b1b",
          borderColor: "#f87171",
        };
      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#374151",
          borderColor: "#d1d5db",
        };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metaContainer}>
          <View
            style={[
              styles.difficultyBadge,
              getDifficultyStyle(level),
              {
                borderWidth: 1,
                borderColor: getDifficultyStyle(level).borderColor,
              },
            ]}
          >
            <Text
              style={{
                color: getDifficultyStyle(level).color,
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              {level}
            </Text>
          </View>
          <Text style={styles.skillText}>
            📚 {skill.charAt(0).toUpperCase() + skill.slice(1)}
          </Text>
        </View>
        <Text style={styles.topic}>🔖 Topic: {topicId?.name || "N/A"}</Text>
        <Text style={styles.duration}>
          ⏰ Estimated time: {duration || "N/A"} minutes
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Content</Text>
        <Text style={styles.content}>{content || "No content available."}</Text>
      </View>

      {media && media.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎬 Media</Text>
          {media.map((url, idx) => (
            <Text key={idx} style={styles.mediaLink}>
              {url}
            </Text>
          ))}
        </View>
      )}

      {questions && questions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Quiz Questions</Text>
          <Text style={styles.content}>
            This lesson includes {questions.length} question(s) to test your
            knowledge.
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartLesson}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>🚀 Start Lesson</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorSubText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingHorizontal: 25,
    paddingBottom: 25,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 10,
    lineHeight: 36,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
  },
  skillText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "500",
  },
  topic: {
    fontSize: 15,
    color: "#374151",
    marginTop: 6,
    fontWeight: "500",
  },
  duration: {
    fontSize: 15,
    color: "#059669",
    marginTop: 6,
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
    borderBottomWidth: 2,
    borderColor: "#e5e7eb",
    paddingBottom: 8,
  },
  content: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
    textAlign: "justify",
  },
  mediaLink: {
    fontSize: 15,
    color: "#3b82f6",
    textDecorationLine: "underline",
    marginTop: 8,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  startButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
});
