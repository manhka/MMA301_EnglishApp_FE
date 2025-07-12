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
  { id: "speaking", name: "Speaking", icon: "🗣️" },
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

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSkillSelect = (skill) => {
  if (!selectedLevel) {
    Alert.alert("Chưa chọn Level", "Vui lòng chọn một level trước.");
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
      Alert.alert("Lỗi", "Kỹ năng chưa được hỗ trợ.");
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
          <Text style={styles.welcomeText}>Chào mừng, {adminName}!</Text>
          <Text style={styles.title}>Chọn Level và kỹ năng IELTS</Text>
        </View>

        {/* Level Selector */}
        <View style={styles.levelSelector}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelButton,
                selectedLevel === level.id && styles.levelButtonSelected,
              ]}
              onPress={() => setSelectedLevel(level.id)}
              activeOpacity={0.8}
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "Mỗi kỹ năng là một bước tiến tới sự thành thạo."
          </Text>
          <Text style={styles.footerAuthor}>- Đội ngũ Admin</Text>
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
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  levelButton: {
    borderWidth: 1,
    borderColor: "#DC2626",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  levelButtonSelected: {
    backgroundColor: "#DC2626",
  },
  levelText: {
    fontSize: 16,
    color: "#DC2626",
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
