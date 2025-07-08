import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation, route }) {
  const userName = route.params?.userName || "Student";
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("recommendations");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const userId = await SecureStore.getItemAsync("userId");
        const level =
          (await SecureStore.getItemAsync("selectedLevel")) || "Beginner";

        if (!userId) {
          navigation.replace("Login");
          return;
        }

        const res = await api.get(`/${userId}/${level}/progress`);
        const { progress } = res.data;

        const skillsFormatted = [
          {
            id: 1,
            name: "Listening",
            icon: "🎧",
            color: "#10B981",
            progress: progress.skills.listening || 0,
          },
          {
            id: 2,
            name: "Reading",
            icon: "📖",
            color: "#3B82F6",
            progress: progress.skills.reading || 0,
          },
          {
            id: 3,
            name: "Speaking",
            icon: "🗣️",
            color: "#F59E0B",
            progress: progress.skills.speaking || 0,
          },
          {
            id: 4,
            name: "Writing",
            icon: "✍️",
            color: "#8B5CF6",
            progress: progress.skills.writing || 0,
          },
        ];

        setSkills(skillsFormatted);
        setLoading(false);
      } catch (err) {
        console.log("fetch progress error", err);
        Alert.alert("Error", "Could not load progress");
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("userToken");
          await SecureStore.deleteItemAsync("userId");
          await SecureStore.deleteItemAsync("userName");
          navigation.replace("Login");
        },
      },
    ]);
  };

  const renderSkill = (skill) => (
    <TouchableOpacity
      key={skill.id}
      style={[styles.skillCard, { borderColor: skill.color }]}
      onPress={() => navigation.navigate("Lesson", { skill: skill.name })}
    >
      <Text style={styles.skillIcon}>{skill.icon}</Text>
      <Text style={styles.skillTitle}>{skill.name}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${skill.progress}%`, backgroundColor: skill.color },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{skill.progress}%</Text>
    </TouchableOpacity>
  );

  const renderRecommended = () => (
    <>
      <Text style={styles.sectionTitle}>Recommended Lessons</Text>
      {[
        {
          id: 1,
          title: "Skimming Techniques",
          skill: "Reading",
          duration: "15 min",
          level: "Intermediate",
        },
        {
          id: 2,
          title: "Opinion Essays",
          skill: "Writing",
          duration: "20 min",
          level: "Beginner",
        },
      ].map((lesson) => (
        <View key={lesson.id} style={styles.lessonCard}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDetail}>
            {lesson.skill} • {lesson.duration} • {lesson.level}
          </Text>
        </View>
      ))}
    </>
  );

  const renderHistory = () => (
    <>
      <Text style={styles.sectionTitle}>Recent History</Text>
      {[
        {
          id: 1,
          title: "Reading Practice",
          skill: "Reading",
          date: "Yesterday",
          score: 80,
        },
        {
          id: 2,
          title: "Speaking Task 1",
          skill: "Speaking",
          date: "2 days ago",
          score: 75,
        },
      ].map((h) => (
        <View key={h.id} style={styles.lessonCard}>
          <Text style={styles.lessonTitle}>{h.title}</Text>
          <Text style={styles.lessonDetail}>
            {h.skill} • {h.date} • Score {h.score}%
          </Text>
        </View>
      ))}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileContainer}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <View style={styles.avatar}>
              <Text style={{ color: "#fff" }}>👤</Text>
            </View>
            <Text style={styles.userName}>{userName}</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown */}
        {showDropdown && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDropdown(false);
                setShowLearning(true);
              }}
            >
              <Text>📊 My Learning</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <Text>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Skills</Text>
          <View style={styles.skillsGrid}>{skills.map(renderSkill)}</View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "recommendations" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("recommendations")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "recommendations" && styles.activeTabText,
              ]}
            >
              Recommendations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "history" && styles.activeTab]}
            onPress={() => setSelectedTab("history")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "history" && styles.activeTabText,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic content */}
        <View style={styles.contentSection}>
          {selectedTab === "recommendations"
            ? renderRecommended()
            : renderHistory()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileContainer: { flexDirection: "row", alignItems: "center" },
  avatar: {
    backgroundColor: "#059669",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  userName: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  dropdownMenu: {
    position: "absolute",
    top: 120,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    width: 160,
    zIndex: 999,
  },

  dropdownItem: { padding: 12 },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skillCard: {
    width: (width - 64) / 2,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  skillIcon: { fontSize: 28, marginBottom: 8 },
  skillTitle: { fontSize: 16, fontWeight: "bold" },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginVertical: 4,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 12, color: "#6B7280" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 8,
  },
  tab: { flex: 1, padding: 12, alignItems: "center" },
  activeTab: { backgroundColor: "#059669" },
  tabText: { color: "#6B7280", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  contentSection: { paddingHorizontal: 20 },
  lessonCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lessonTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  lessonDetail: { fontSize: 12, color: "#6B7280", marginTop: 4 },
});
