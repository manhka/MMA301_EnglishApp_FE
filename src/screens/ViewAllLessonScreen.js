import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";

export default function AllLessonsScreen() {
  const navigation = useNavigation();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [skillFilter, setSkillFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

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
      Alert.alert("Lỗi", "Không thể tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert("Confirm, ", [
      { text: "Hủy" },
      {
        text: "Xóa",
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
      Alert.alert("Error", "Failed to delete lesson.");
    }
  };

  // ✅ Hàm xử lý điều hướng màn edit theo skill
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
        Alert.alert("Error", "Skill not supported.");
        return;
    }

    navigation.navigate(screenName, { id: item._id});
  };

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
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => confirmDelete(item._id)}
        >
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tất cả Lesson</Text>

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
          data={lessons}
          keyExtractor={(item) => item._id}
          renderItem={renderLesson}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F0FDF4",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
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
    height: 44,
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
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteBtn: {
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
