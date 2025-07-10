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
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation, route }) {
  const userName = route.params?.userName || "Student";
  const userLevel = route.params?.level || "Beginner";
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
          userLevel ||
          (await SecureStore.getItemAsync("selectedLevel")) ||
          "Beginner";

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
            color: "#059669",
            progress: progress.skills.reading || 0,
          },
          {
            id: 3,
            name: "Speaking",
            icon: "🗣️",
            color: "#047857",
            progress: progress.skills.speaking || 0,
          },
          {
            id: 4,
            name: "Writing",
            icon: "✍️",
            color: "#065f46",
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
  }, [userLevel]);

  const getLevelStyle = (level) => {
    switch (level) {
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

  const handleBack = async () => {
    try {
      await SecureStore.setItemAsync("level", "Beginner");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Failed to store secure item:", error);
    }
  };

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
      onPress={() =>
        navigation.navigate("Lesson", {
          level: userLevel,
          skill: skill.name.toLowerCase(),
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.skillHeader}>
        <Text style={styles.skillIcon}>{skill.icon}</Text>
        <View style={[styles.skillBadge, { backgroundColor: skill.color }]}>
          <Text style={styles.skillBadgeText}>{skill.progress}%</Text>
        </View>
      </View>
      <Text style={styles.skillTitle}>{skill.name}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${skill.progress}%`, backgroundColor: skill.color },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>Progress</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecommended = () => (
    <>
      <View style={styles.sectionHeader}>
        <Ionicons name="star-outline" size={24} color="#10b981" />
        <Text style={styles.sectionTitle}>Recommended for You</Text>
      </View>
      {[
        {
          id: 1,
          title: "Skimming Techniques",
          skill: "Reading",
          duration: "15 min",
          level: "Intermediate",
          difficulty: "Medium",
        },
        {
          id: 2,
          title: "Opinion Essays",
          skill: "Writing",
          duration: "20 min",
          level: "Beginner",
          difficulty: "Easy",
        },
        {
          id: 3,
          title: "Listening for Details",
          skill: "Listening",
          duration: "12 min",
          level: userLevel,
          difficulty: "Medium",
        },
      ].map((lesson) => (
        <TouchableOpacity
          key={lesson.id}
          style={styles.lessonCard}
          activeOpacity={0.7}
        >
          <View style={styles.lessonHeader}>
            <View style={styles.lessonTitleContainer}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <View style={[styles.levelBadge, getLevelStyle(lesson.level)]}>
                <Text
                  style={[
                    styles.levelBadgeText,
                    { color: getLevelStyle(lesson.level).color },
                  ]}
                >
                  {lesson.level}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#10b981" />
          </View>
          <View style={styles.lessonMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={16} color="#64748b" />
              <Text style={styles.lessonDetail}>{lesson.skill}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text style={styles.lessonDetail}>{lesson.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="trending-up-outline" size={16} color="#64748b" />
              <Text style={styles.lessonDetail}>{lesson.difficulty}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );

  const renderHistory = () => (
    <>
      <View style={styles.sectionHeader}>
        <Ionicons name="time-outline" size={24} color="#10b981" />
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </View>
      {[
        {
          id: 1,
          title: "Reading Practice",
          skill: "Reading",
          date: "Yesterday",
          score: 80,
          status: "completed",
        },
        {
          id: 2,
          title: "Speaking Task 1",
          skill: "Speaking",
          date: "2 days ago",
          score: 75,
          status: "completed",
        },
        {
          id: 3,
          title: "Listening Exercise",
          skill: "Listening",
          date: "3 days ago",
          score: 90,
          status: "completed",
        },
      ].map((h) => (
        <TouchableOpacity
          key={h.id}
          style={styles.historyCard}
          activeOpacity={0.7}
        >
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleContainer}>
              <Text style={styles.historyTitle}>{h.title}</Text>
              <View style={styles.scoreContainer}>
                <Ionicons name="trophy-outline" size={16} color="#f59e0b" />
                <Text style={styles.scoreText}>{h.score}%</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, styles.completedBadge]}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>
          <View style={styles.historyMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={16} color="#64748b" />
              <Text style={styles.lessonDetail}>{h.skill}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text style={styles.lessonDetail}>{h.date}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <View style={[styles.levelBadge, getLevelStyle(userLevel)]}>
                  <Text
                    style={[
                      styles.levelBadgeText,
                      { color: getLevelStyle(userLevel).color },
                    ]}
                  >
                    {userLevel}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color="#fff" />
              </View>
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
                activeOpacity={0.7}
              >
                <Ionicons name="analytics-outline" size={20} color="#64748b" />
                <Text style={styles.dropdownText}>My Learning</Text>
              </TouchableOpacity>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={[styles.dropdownText, { color: "#ef4444" }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Skills Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="library-outline" size={24} color="#10b981" />
              <Text style={styles.sectionTitle}>Your Skills</Text>
            </View>
            <View style={styles.skillsGrid}>{skills.map(renderSkill)}</View>
          </View>

          {/* Tabs */}
          <View style={styles.tabSection}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "recommendations" && styles.activeTab,
                ]}
                onPress={() => setSelectedTab("recommendations")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="star-outline"
                  size={20}
                  color={selectedTab === "recommendations" ? "#fff" : "#64748b"}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "recommendations" && styles.activeTabText,
                  ]}
                >
                  Recommended
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "history" && styles.activeTab,
                ]}
                onPress={() => setSelectedTab("history")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={selectedTab === "history" ? "#fff" : "#64748b"}
                />
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
          </View>

          {/* Dynamic content */}
          <View style={styles.contentSection}>
            {selectedTab === "recommendations"
              ? renderRecommended()
              : renderHistory()}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  scrollContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 12,
    fontWeight: "500",
  },

  // Enhanced Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 20 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  welcomeText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginRight: 8,
  },

  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },

  levelBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  profileButton: {
    width: 40,
    height: 40,
  },

  avatar: {
    backgroundColor: "#10b981",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Dropdown
  dropdownMenu: {
    position: "absolute",
    top: 120,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    width: 180,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  dropdownText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    fontWeight: "500",
  },

  dropdownDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 16,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginLeft: 8,
  },

  // Skills Grid
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  skillIcon: {
    fontSize: 32,
  },

  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  skillBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  skillTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },

  progressContainer: {
    marginTop: 8,
  },

  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 4,
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  progressLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },

  // Tabs
  tabSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  activeTab: {
    backgroundColor: "#10b981",
  },

  tabText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },

  activeTabText: {
    color: "#fff",
  },

  // Content
  contentSection: {
    paddingHorizontal: 20,
  },

  // Lesson Cards
  lessonCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  lessonTitleContainer: {
    flex: 1,
    marginRight: 12,
  },

  lessonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },

  lessonMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  lessonDetail: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 4,
    fontWeight: "500",
  },

  // History Cards
  historyCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  historyTitleContainer: {
    flex: 1,
    marginRight: 12,
  },

  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },

  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  scoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f59e0b",
    marginLeft: 4,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  completedBadge: {
    backgroundColor: "#ecfdf5",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },

  historyMeta: {
    flexDirection: "row",
    gap: 16,
  },
});
