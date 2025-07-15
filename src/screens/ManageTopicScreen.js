import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../services/api";

const topicSchema = Yup.object().shape({
  name: Yup.string().trim().required("Topic name is required"),
  description: Yup.string().trim().required("Description is required"),
});

export default function ManageTopicScreen({ navigation, route }) {
  const adminName = route.params?.adminName || "Admin";
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTopic, setEditingTopic] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get("/topic/all");
      setTopics(res.data.topics);
    } catch (err) {
      console.log("Failed to fetch topics");
    }
  };

  const filteredTopics = Array.isArray(topics)
    ? topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // ADD formik
  const addFormik = useFormik({
    initialValues: { name: "", description: "" },
    validationSchema: topicSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        console.log("Posting topic:", values);
        const res = await api.post("/topic/create", values);
        setTopics((prev) => [...prev, res.data]);
        await fetchTopics();
        resetForm();
      } catch (err) {
        Alert.alert("Error", err.response?.data?.message || "Add failed");
      }
    },
  });

  // EDIT formik
  const editFormik = useFormik({
    initialValues: {
      name: editingTopic?.name || "",
      description: editingTopic?.description || "",
    },
    validationSchema: topicSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await api.put(`/topic/edit/${editingTopic._id}`, values);
        const updated = res.data;
        setTopics((prev) =>
          prev.map((topic) => (topic._id === updated._id ? updated : topic))
        );
        setEditingTopic(null);
        resetForm();
      } catch (err) {
        Alert.alert("Error", err.response?.data?.message || "Update failed");
      }
    },
  });

  const startEditing = (topic) => {
    setEditingTopic(topic);
  };

  const handleCancelEdit = () => {
    setEditingTopic(null);
    editFormik.resetForm();
  };

  const renderTopicItem = ({ item }) => (
    <View style={styles.topicItem}>
      <View style={styles.topicTextContent}>
        <Text style={styles.topicName}>{item.name}</Text>
        <Text style={styles.topicDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={() => startEditing(item)}
      >
        <Text style={styles.actionButtonText}>✏️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Topic Management</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Add New Topic */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New Topic</Text>
            <TextInput
              style={styles.input}
              placeholder="Topic name"
              value={addFormik.values.name}
              onChangeText={addFormik.handleChange("name")}
              onBlur={addFormik.handleBlur("name")}
            />
            {addFormik.touched.name && addFormik.errors.name && (
              <Text style={styles.errorText}>{addFormik.errors.name}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Topic description"
              multiline
              numberOfLines={3}
              value={addFormik.values.description}
              onChangeText={addFormik.handleChange("description")}
              onBlur={addFormik.handleBlur("description")}
            />
            {addFormik.touched.description && addFormik.errors.description && (
              <Text style={styles.errorText}>
                {addFormik.errors.description}
              </Text>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={addFormik.handleSubmit}
            >
              <Text style={styles.addButtonText}>Add Topic</Text>
            </TouchableOpacity>
          </View>

          {/* Edit Topic */}
          {editingTopic && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Edit Topic</Text>
              <TextInput
                style={styles.input}
                placeholder="New name"
                value={editFormik.values.name}
                onChangeText={editFormik.handleChange("name")}
              />
              {editFormik.touched.name && editFormik.errors.name && (
                <Text style={styles.errorText}>{editFormik.errors.name}</Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="New description"
                multiline
                numberOfLines={3}
                value={editFormik.values.description}
                onChangeText={editFormik.handleChange("description")}
              />
              {editFormik.touched.description &&
                editFormik.errors.description && (
                  <Text style={styles.errorText}>
                    {editFormik.errors.description}
                  </Text>
                )}
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={editFormik.handleSubmit}
                >
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Search + List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Topics</Text>

            {Array.isArray(topics) && topics.length > 0 && (
              <TextInput
                style={styles.input}
                placeholder="Search by name"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            )}

            {/* Kiểm tra bằng Array.isArray */}
            {Array.isArray(topics) && topics.length > 0 ? (
              filteredTopics.length > 0 ? (
                <FlatList
                  data={filteredTopics}
                  keyExtractor={(item) => item._id}
                  renderItem={renderTopicItem}
                />
              ) : (
                <Text style={styles.noTopicsText}>
                  No topics match your search.
                </Text>
              )
            ) : (
              <Text style={styles.noTopicsText}>No topics available.</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  keyboardAvoidingView: { flex: 1 },
  scrollViewContent: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 10,
  },
  errorText: { color: "#EF4444", fontSize: 13, marginBottom: 8 },
  addButton: {
    backgroundColor: "#34D399",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  topicItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
    alignItems: "center",
  },
  topicTextContent: { flex: 1 },
  topicName: { fontSize: 16, fontWeight: "600", color: "#374151" },
  topicDescription: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: 10,
  },
  actionButtonText: { color: "#fff", fontSize: 16 },
  editButton: {
    height: 45,
    backgroundColor: "#60A5FA",
    justifyContent: "center",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  saveButton: { flex: 1, backgroundColor: "#34D399" },
  cancelButton: { flex: 1, backgroundColor: "#9CA3AF" },
  noTopicsText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
    fontStyle: "italic",
  },
});
