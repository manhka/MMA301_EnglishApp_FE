import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
export default function AllLessonsScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [skillFilter, setSkillFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  useEffect(() => {
    if (isFocused) {
      fetchLessons();
    }
  }, [isFocused]);
  useEffect(() => {
    fetchLessons();
  }, [skillFilter, levelFilter]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const query = [];
      if (skillFilter !== "all") query.push(`skill=${skillFilter}`);
      if (levelFilter !== "all") query.push(`level=${levelFilter}`);
      const queryString = query.length > 0 ? "?" + query.join("&") : "";

      const res = await api.get(`/lessons${queryString}`);
      setLessons(res.data);
    } catch (err) {
      console.error("Fetch lessons failed", err);
      Alert.alert("Error", "Failed to load lessons.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this lesson?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteLesson(id),
      },
    ]);
  };

  const deleteLesson = async (id) => {
    try {
      await api.delete(`/lessons/${id}`);
      setLessons((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      Alert.alert("Error", "Could not delete lesson.");
    }
  };

  const handleEditLesson = (item) => {
    let screenName = "";
    switch (item.skill) {
      case "reading":
        screenName = "EditReadingLessonScreen";
        break;
      case "listening":
        screenName = "EditListeningLessonScreen";
        break;
      case "writing":
        screenName = "EditWritingLessonScreen";
        break;
      default:
        Alert.alert("Error", "Invalid skill");
        return;
    }

    navigation.navigate(screenName, { id: item._id });
  };

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderLesson = ({ item }) => (
    <View style={styles.lessonItem}>
      <Text style={styles.lessonTitle}>{item.title}</Text>
      <Text style={styles.lessonInfo}>
        {item.skill.toUpperCase()} - {item.level}
      </Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => handleEditLesson(item)}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionText}> Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => confirmDelete(item._id)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionText}> Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0FDF4" }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>All Lessons</Text>
          <Text style={styles.subtitle}>
            Manage all reading, listening, and writing lessons
          </Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#6B7280" />
        <TextInput
          placeholder="Search by title..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterRow}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={skillFilter}
            onValueChange={setSkillFilter}
            style={styles.picker}
          >
            <Picker.Item label="All Skills" value="all" />
            <Picker.Item label="Reading" value="reading" />
            <Picker.Item label="Listening" value="listening" />
            <Picker.Item label="Writing" value="writing" />
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={levelFilter}
            onValueChange={setLevelFilter}
            style={styles.picker}
          >
            <Picker.Item label="All Levels" value="all" />
            <Picker.Item label="Beginner" value="Beginner" />
            <Picker.Item label="Intermediate" value="Intermediate" />
            <Picker.Item label="Advanced" value="Advanced" />
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" />
      ) : (
        <FlatList
          data={filteredLessons}
          keyExtractor={(item) => item._id}
          renderItem={renderLesson}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F0FDF4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginHorizontal: 12,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  picker: {
    width: "100%",
    height: 50,
  },
  lessonItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  lessonInfo: {
    color: "#6B7280",
    marginBottom: 12,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
