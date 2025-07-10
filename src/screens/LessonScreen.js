import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import api from "../services/api";

const { width } = Dimensions.get("window");

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

const getLessonTypeIcon = (type) => {
  switch (type) {
    case "video":
      return "🎥";
    case "interactive":
      return "🎯";
    case "practice":
      return "⚡";
    default:
      return "📚";
  }
};

const ProgressBar = ({ current, total }) => {
  const percent = (current / total) * 100;
  const [animatedWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percent,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarBackground}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{Math.round(percent)}%</Text>
    </View>
  );
};

const LessonItem = ({ lesson, index, isLocked, navigation }) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!isLocked && navigation) {
      navigation.navigate("LessonDetails", {
        lessonId: lesson._id,
      });
    }
  };

  const isCompleted = lesson.completed;

  return (
    <Animated.View
      style={[
        styles.lessonItem,
        isCompleted ? styles.lessonCompleted : styles.lessonIncomplete,
        isLocked && styles.lessonLocked,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isLocked}
      >
        <View style={styles.lessonLeft}>
          <View style={styles.lessonStatus}>
            {isCompleted ? (
              <View style={styles.completedIcon}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            ) : (
              <View
                style={[
                  styles.lessonNumber,
                  isLocked && styles.lessonNumberLocked,
                ]}
              >
                <Text
                  style={[
                    styles.lessonNumberText,
                    isLocked && styles.lessonNumberTextLocked,
                  ]}
                >
                  {isLocked ? "🔒" : index + 1}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.lessonContent}>
            <View style={styles.lessonHeader}>
              <View style={styles.lessonTitleRow}>
                <Text style={styles.lessonTypeIcon}>
                  {getLessonTypeIcon(lesson.type)}
                </Text>
                <Text
                  style={[
                    styles.lessonTitle,
                    isCompleted && styles.lessonTitleCompleted,
                    isLocked && styles.lessonTitleLocked,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {lesson.title}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.lessonButton,
          isLocked && styles.lessonButtonLocked,
          isCompleted
            ? styles.lessonButtonCompleted
            : styles.lessonButtonDefault,
        ]}
        disabled={isLocked}
        onPress={handlePress}
      >
        <Text
          style={[
            styles.lessonButtonText,
            isCompleted && styles.lessonButtonTextCompleted,
            isLocked && styles.lessonButtonTextLocked,
          ]}
        >
          {isLocked ? "🔒" : isCompleted ? "Review" : "Start"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TopicCard = ({ topic, level, skill, navigation }) => {
  const [expanded, setExpanded] = useState(false);
  const [anim] = useState(new Animated.Value(0));
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = async () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);

    if (!expanded && lessons.length === 0) {
      setLoading(true);
      try {
        const res = await api.get(`/lessons/${topic._id}/${level}/${skill}`);
        setLessons(res.data.lessons || []);
      } catch (err) {
        console.error("Failed to fetch lessons", err);
      } finally {
        setLoading(false);
      }
    }

    Animated.timing(anim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const maxHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, lessons.length * 140 + 60],
  });

  const rotation = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const completedLessons = lessons.filter((lesson) => lesson.completed).length;
  const totalLessons = lessons.length;

  return (
    <View style={styles.topicCard}>
      <TouchableOpacity
        style={styles.topicHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.topicHeaderContent}>
          <View style={styles.topicTitleRow}>
            <Text style={styles.topicTitle}>{topic.name}</Text>
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
          </View>
          <Text style={styles.topicDescription}>{topic.description}</Text>
          {totalLessons > 0 && (
            <ProgressBar current={completedLessons} total={totalLessons} />
          )}
        </View>
        <Animated.View style={styles.expandIconContainer}>
          <Animated.Text
            style={[styles.expandIcon, { transform: [{ rotate: rotation }] }]}
          >
            ▼
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.lessonsContainer, { maxHeight, opacity }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading lessons...</Text>
          </View>
        ) : lessons.length > 0 ? (
          <View style={styles.lessonsWrapper}>
            {lessons.map((lesson, index) => {
              const isLocked = index > 0 && !lessons[index - 1].completed;
              return (
                <LessonItem
                  key={lesson._id}
                  lesson={lesson}
                  index={index}
                  isLocked={isLocked}
                  navigation={navigation}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.noLessonsContainer}>
            <Text style={styles.noLessonsText}>No lessons available</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default function LessonScreen({ navigation }) {
  const [topics, setTopics] = useState([]);
  const level = "Beginner";
  const skill = "reading";

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get("/topic/all");
        setTopics(res.data.topics);
      } catch (err) {
        Alert.alert("Error", "Failed to load topics");
      }
    };

    fetchTopics();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              📚 {skill.charAt(0).toUpperCase() + skill.slice(1)}
            </Text>
            <Text style={styles.headerSubtitle}>
              💪 Practice makes you perfect!
            </Text>
          </View>
        </View>

        {Array.isArray(topics) && topics.length > 0 ? (
          topics.map((topic, index) => (
            <TopicCard
              key={topic._id}
              topic={topic}
              level={level}
              skill={skill}
              navigation={navigation}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📖 No topics available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new content
            </Text>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  // Back Button Styles
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 85 : 65,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
    color: "#374151",
    fontWeight: "600",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  topicCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  topicHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  topicHeaderContent: {
    flex: 1,
  },
  topicTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginRight: 12,
    color: "#1e293b",
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  topicDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 12,
  },
  expandIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  expandIcon: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  lessonsContainer: {
    overflow: "hidden",
  },
  lessonsWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBarBackground: {
    flex: 1,
    backgroundColor: "#e2e8f0",
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 2,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  lessonLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  lessonStatus: {
    marginRight: 12,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  lessonNumberLocked: {
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  lessonNumberText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  lessonNumberTextLocked: {
    color: "#94a3b8",
    fontSize: 12,
  },
  completedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  lessonTypeIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    marginRight: 4,
    flexShrink: 1,
  },
  lessonTitleCompleted: {
    color: "#059669",
  },
  lessonTitleLocked: {
    color: "#94a3b8",
  },
  lessonDuration: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "500",
  },
  lessonDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  lessonDescriptionLocked: {
    color: "#cbd5e1",
  },
  lessonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  lessonButtonDefault: {
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonButtonCompleted: {
    backgroundColor: "#ecfdf5",
    borderColor: "#10b981",
    borderWidth: 1.5,
  },
  lessonButtonLocked: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },
  lessonButtonText: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
  },
  lessonButtonTextCompleted: {
    color: "#059669",
  },
  lessonButtonTextLocked: {
    color: "#94a3b8",
  },
  lessonCompleted: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  lessonIncomplete: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  lessonLocked: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    opacity: 0.7,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  noLessonsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noLessonsText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  lessonTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
});
