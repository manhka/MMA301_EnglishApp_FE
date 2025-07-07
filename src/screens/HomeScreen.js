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

const motivationalQuotes = [
  "Every expert was once a beginner. Start your IELTS journey today! 🌟",
  "Success is the sum of small efforts repeated day in and day out. 💪",
  "Your future self will thank you for starting today! 🚀",
  "The best time to plant a tree was 20 years ago. The second best time is now! 🌱",
  "Dream big, work hard, stay focused. Your IELTS goal is within reach! 🎯",
  "Progress, not perfection. Every step counts! ✨",
];

export default function HomeScreen({ navigation, route }) {
  const userName = route.params?.userName || "Student";
  const [selectedLevel, setSelectedLevel] = useState(null);

  const [currentQuote, setCurrentQuote] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (!selectedLevel) {
      Alert.alert(
        "Missing Level",
        "Please select a level before starting!",
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
      return;
    }
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace("Dashboard", { level: selectedLevel, userName });
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
            <Text style={styles.logoText}>📚</Text>
          </View>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.userName}>{userName} 👋</Text>
        </View>

        {/* Select Level */}
        <View style={styles.levelContainer}>
          <Text style={styles.levelTitle}>Choose your level</Text>
          <View style={styles.levelOptions}>
            <TouchableOpacity
              style={[
                styles.levelButton,
                selectedLevel === "beginner" && styles.levelButtonSelected,
              ]}
              onPress={() => setSelectedLevel("beginner")}
            >
              <Text style={styles.levelIcon}>🌱</Text>
              <Text style={styles.levelText}>Beginner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.levelButton,
                selectedLevel === "intermediate" && styles.levelButtonSelected,
              ]}
              onPress={() => setSelectedLevel("intermediate")}
            >
              <Text style={styles.levelIcon}>🚀</Text>
              <Text style={styles.levelText}>Intermediate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.levelButton,
                selectedLevel === "advanced" && styles.levelButtonSelected,
              ]}
              onPress={() => setSelectedLevel("advanced")}
            >
              <Text style={styles.levelIcon}>🏆</Text>
              <Text style={styles.levelText}>Advanced</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quotes */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteTitle}>Daily Motivation 💡</Text>
          <Animated.View style={[styles.quoteBox, { opacity: fadeAnim }]}>
            <Text style={styles.quoteText}>
              {motivationalQuotes[currentQuote]}
            </Text>
          </Animated.View>
          <View style={styles.quoteIndicators}>
            {motivationalQuotes.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentQuote === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Ready Button */}
        <Animated.View
          style={[styles.readyContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <TouchableOpacity
            style={styles.readyButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <View style={styles.readyButtonContent}>
              <Text style={styles.readyButtonText}>I’m Ready!</Text>
              <Text style={styles.readyButtonSubtext}>
                Start Learning as {selectedLevel || "..."}
              </Text>
            </View>
            <View style={styles.readyButtonIcon}>
              <Text style={styles.arrowText}>🚀</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementTitle}>Remember:</Text>
          <View style={styles.encouragementList}>
            <Text style={styles.encouragementItem}>
              🎯 Consistency beats perfection
            </Text>
            <Text style={styles.encouragementItem}>
              📈 Every practice session counts
            </Text>
            <Text style={styles.encouragementItem}>
              💪 You're capable of achieving your goal
            </Text>
            <Text style={styles.encouragementItem}>
              🌟 Success is a journey, not a destination
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "The expert in anything was once a beginner who refused to give up."
          </Text>
          <Text style={styles.footerAuthor}>- Helen Hayes</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // giữ nguyên styles cũ
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 30 },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#059669",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: { fontSize: 32 },
  welcomeText: { fontSize: 24, color: "#6B7280", fontWeight: "400" },
  userName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },

  // level select
  levelContainer: { marginBottom: 30 },
  levelTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  levelOptions: { flexDirection: "row", justifyContent: "space-around" },
  levelButton: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    width: "30%",
  },
  levelButtonSelected: { borderColor: "#059669", backgroundColor: "#D1FAE5" },
  levelIcon: { fontSize: 24, marginBottom: 4 },
  levelText: { fontSize: 14, fontWeight: "600", color: "#111827" },

  quoteContainer: { marginBottom: 30 },
  quoteTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  quoteBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#059669",
  },
  quoteText: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    color: "#374151",
  },
  quoteIndicators: { flexDirection: "row", justifyContent: "center", gap: 8 },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  activeIndicator: { backgroundColor: "#059669" },

  readyContainer: { marginBottom: 30 },
  readyButton: {
    backgroundColor: "#059669",
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readyButtonContent: { flex: 1 },
  readyButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  readyButtonSubtext: { fontSize: 14, color: "#D1FAE5" },
  readyButtonIcon: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: { fontSize: 24 },

  encouragementContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  encouragementList: { gap: 12 },
  encouragementItem: { fontSize: 16, lineHeight: 24, color: "#374151" },
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
