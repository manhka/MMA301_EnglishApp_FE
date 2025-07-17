import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from "react-native";

const ieltsSkills = [
  { id: "listening", name: "Listening", icon: "🎧" },
  { id: "reading", name: "Reading", icon: "📖" },
  { id: "writing", name: "Writing", icon: "✍️" },
];

const levels = [
  { id: "Beginner", name: "Beginner" },
  { id: "Intermediate", name: "Intermediate" },
  { id: "Advanced", name: "Advanced" },
];

export default function AdminScreen({ navigation, route }) {
  const adminName = route.params?.userName || "Admin";
  const [selectedLevel, setSelectedLevel] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const levelScales = useRef(levels.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLevelPress = (level, index) => {
    setSelectedLevel(level.id);
    Animated.spring(levelScales[index], {
      toValue: 1.1,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(levelScales[index], {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSkillSelect = (skill) => {
    if (!selectedLevel) {
      Alert.alert("Level Not Selected", "Please select a level first.");
      return;
    }
    let screenName = "";
    switch (skill.id) {
      case "reading":
        screenName = "CreateReadingLessonScreen";
        break;
      case "listening":
        screenName = "CreateListeningLessonScreen";
        break;
      case "writing":
        screenName = "CreateWritingLessonScreen";
        break;
      default:
        Alert.alert("Error", "Skill not supported.");
        return;
    }
    navigation.navigate(screenName, {
      adminName,
      skill: skill.id,
      skillName: skill.name,
      level: selectedLevel,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>📝</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome, {adminName}!</Text>
          <Text style={styles.title}>Select Level and Skill</Text>
        </View>

        {/* Level Selector */}
        <View style={styles.levelSelector}>
          {levels.map((level, index) => (
            <Animated.View
              key={level.id}
              style={[
                styles.levelButtonWrapper,
                { transform: [{ scale: levelScales[index] }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.levelButton,
                  selectedLevel === level.id && styles.levelButtonSelected,
                ]}
                onPress={() => handleLevelPress(level, index)}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.levelText,
                    selectedLevel === level.id && styles.levelTextSelected,
                  ]}
                >
                  {level.name}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Skill Options */}
        <View style={styles.skillOptionsContainer}>
          {ieltsSkills.map((skill) => (
            <TouchableOpacity
              key={skill.id}
              style={styles.skillButton}
              onPress={() => handleSkillSelect(skill)}
              activeOpacity={0.8}
            >
              <Text style={styles.skillIcon}>{skill.icon}</Text>
              <Text style={styles.skillName}>{skill.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topic Management Button */}
        <TouchableOpacity
          style={styles.topicManagementButton}
          onPress={() => navigation.navigate("ManageTopic", { adminName })}
          activeOpacity={0.85}
        >
          <Text style={styles.topicManagementButtonText}>Manage Topics</Text>
        </TouchableOpacity>
        {/* View All Lessons Button */}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() =>
            navigation.navigate("ViewAllLessonScreen", { adminName })
          }
          activeOpacity={0.85}
        >
          <Text style={styles.viewAllButtonText}>View All Lessons</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "Each skill is a step towards mastery."
          </Text>
          <Text style={styles.footerAuthor}>- Admin Team</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 30 },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#DC2626",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: { fontSize: 32 },
  welcomeText: {
    fontSize: 20,
    color: "#6B7280",
    fontWeight: "400",
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  // Level
  levelSelector: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginBottom: 30,
  },
  levelButtonWrapper: {
    marginVertical: 6,
  },
  levelButton: {
    borderWidth: 1,
    borderColor: "#34D399",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    minWidth: 200,
    alignItems: "center",
  },
  levelButtonSelected: {
    backgroundColor: "#34D399",
  },
  levelText: {
    fontSize: 16,
    color: "#065F46",
    fontWeight: "600",
  },
  levelTextSelected: {
    color: "#FFF",
  },
  // Skills
  skillOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  skillButton: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: "45%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  skillIcon: { fontSize: 48, marginBottom: 10 },
  skillName: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34D399",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  viewAllButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  topicManagementButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#60A5FA", // A different color for distinction
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  topicManagementButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  // Footer
  footer: { alignItems: "center", paddingVertical: 20 },
  footerText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 8,
  },
  footerAuthor: { fontSize: 14, color: "#9CA3AF", fontWeight: "500" },
});
