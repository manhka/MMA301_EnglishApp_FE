import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

// Mock data
const skillsData = [
  { id: 1, name: "Listening", icon: "🎧", color: "#10B981", progress: 70 },
  { id: 2, name: "Reading", icon: "📖", color: "#3B82F6", progress: 60 },
  { id: 3, name: "Speaking", icon: "🗣️", color: "#F59E0B", progress: 40 },
  { id: 4, name: "Writing", icon: "✍️", color: "#8B5CF6", progress: 30 },
  { id: 5, name: "Vocabulary", icon: "📝", color: "#EF4444", progress: 50 },
];

const recommendedLessons = [
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
  {
    id: 3,
    title: "Note-taking Strategies",
    skill: "Listening",
    duration: "12 min",
    level: "Advanced",
  },
];

const history = [
  {
    id: 1,
    title: "Present Perfect Practice",
    skill: "Grammar",
    date: "2 days ago",
    score: 85,
  },
  {
    id: 2,
    title: "Speaking Part 1 Topics",
    skill: "Speaking",
    date: "1 day ago",
    score: 78,
  },
];

// Mock my learning data
const userStats = {
  totalLessons: 42,
  avgScores: { listening: 6.5, reading: 6, speaking: 6, writing: 5.5 },
  totalTime: "12h 30m",
  weakSkills: ["Writing", "Speaking"],
};

export default function DashboardScreen({ navigation, route }) {
  const userName = route.params?.userName || "Student";
  const [selectedTab, setSelectedTab] = useState("recommendations");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLearning, setShowLearning] = useState(false);

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("userToken");
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
      onPress={() => navigation.navigate("LessonList", { skill: skill.name })}
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

  const renderRecommended = () =>
    recommendedLessons.map((lesson) => (
      <TouchableOpacity key={lesson.id} style={styles.lessonCard}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDetail}>
          {lesson.skill} • {lesson.duration} • {lesson.level}
        </Text>
      </TouchableOpacity>
    ));

  const renderHistory = () =>
    history.map((item) => (
      <View key={item.id} style={styles.historyCard}>
        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historyDetail}>
          {item.skill} • {item.date}
        </Text>
        <Text style={styles.historyScore}>Score: {item.score}%</Text>
      </View>
    ));

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.profileContainer}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
            <Text style={styles.profileName}>{userName}</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown menu */}
        {showDropdown && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDropdown(false);
                setShowLearning(true);
              }}
            >
              <Text style={styles.dropdownIcon}>📊</Text>
              <Text style={styles.dropdownText}>My Learning</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <Text style={styles.dropdownIcon}>🔓</Text>
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.skillsGrid}>{skillsData.map(renderSkill)}</View>
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

        {/* Dynamic section */}
        <View style={styles.contentSection}>
          {selectedTab === "recommendations"
            ? renderRecommended()
            : renderHistory()}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MyLearning popup */}
      {showLearning && (
        <View style={styles.learningOverlay}>
          <View style={styles.learningBox}>
            <Text style={styles.learningTitle}>📊 My Learning</Text>
            <Text style={styles.learningItem}>
              Total lessons: {userStats.totalLessons}
            </Text>
            <Text style={styles.learningItem}>
              Listening: {userStats.avgScores.listening}
            </Text>
            <Text style={styles.learningItem}>
              Reading: {userStats.avgScores.reading}
            </Text>
            <Text style={styles.learningItem}>
              Speaking: {userStats.avgScores.speaking}
            </Text>
            <Text style={styles.learningItem}>
              Writing: {userStats.avgScores.writing}
            </Text>
            <Text style={styles.learningItem}>
              Total time: {userStats.totalTime}
            </Text>
            <Text style={styles.learningItem}>
              Weak skills: {userStats.weakSkills.join(", ")}
            </Text>
            <TouchableOpacity
              style={styles.learningClose}
              onPress={() => setShowLearning(false)}
            >
              <Text style={styles.learningCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    zIndex: 99,
  },
  profileContainer: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: "#059669",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarIcon: { fontSize: 20, color: "#fff" },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  dropdownMenu: {
    position: "absolute",
    top: 100,
    left: 20,
    backgroundColor: "#FFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    width: 160,
    zIndex: 999,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomColor: "#F3F4F6",
    borderBottomWidth: 1,
  },
  dropdownIcon: { fontSize: 18, marginRight: 8 },
  dropdownText: { fontSize: 14, fontWeight: "500", color: "#111827" },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  skillCard: {
    width: (width - 64) / 2,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  skillIcon: { fontSize: 28, marginBottom: 8 },
  skillTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  activeTab: { backgroundColor: "#059669" },
  tabText: { fontSize: 16, fontWeight: "600", color: "#6B7280" },
  activeTabText: { color: "#FFF" },
  contentSection: { paddingHorizontal: 20 },
  lessonCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lessonTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  lessonDetail: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  historyCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  historyDetail: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  historyScore: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginTop: 4,
  },
  learningOverlay: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    zIndex: 999,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  learningBox: {},
  learningTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  learningItem: { fontSize: 14, marginVertical: 4 },
  learningClose: {
    marginTop: 12,
    backgroundColor: "#059669",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  learningCloseText: { color: "#fff", fontWeight: "600" },
});
