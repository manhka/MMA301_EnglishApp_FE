"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import api from "../services/api"; // Import the api service

const { width } = Dimensions.get("window");

export default function HistoryScreen({ navigation, route }) {
  const userName = route.params?.userName || "Student";
  const userLevel = route.params?.level || "Beginner";
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        // Get userId from SecureStore
        const userId = await SecureStore.getItemAsync("userId");

        if (!userId) {
          Alert.alert("Error", "User not found. Please login again.");
          navigation.replace("Login");
          return;
        }

        // Fetch history from API using the imported 'api' service
        const response = await api.get(`/history/${userId}`);
        const data = response.data; // Axios returns data directly in .data property

        // Assuming the API returns an array directly or { data: [...] }
        const historyData = Array.isArray(data) ? data : data.data || [];

        setTestHistory(historyData);
        setLoading(false);
      } catch (err) {
        console.log("fetch history error", err);
        Alert.alert(
          "Error",
          "Could not load test history. Please check your connection and try again.",
          [
            {
              text: "Retry",
              onPress: () => fetchHistory(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case "Reading":
        return "book-outline";
      case "Listening":
        return "headset-outline";
      case "Writing":
        return "create-outline";
      case "Speaking":
        return "mic-outline";
      default:
        return "document-outline";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Reading":
        return {
          bg: "#dbeafe",
          text: "#1e40af",
          border: "#93c5fd",
        };
      case "Listening":
        return {
          bg: "#dcfce7",
          text: "#166534",
          border: "#86efac",
        };
      case "Writing":
        return {
          bg: "#f3e8ff",
          text: "#7c3aed",
          border: "#c4b5fd",
        };
      case "Speaking":
        return {
          bg: "#fed7aa",
          text: "#ea580c",
          border: "#fdba74",
        };
      default:
        return {
          bg: "#f1f5f9",
          text: "#475569",
          border: "#cbd5e1",
        };
    }
  };

  const handleReview = (test) => {
    console.log("Review test:", test.id);
    const resultId = test.resultId;
    const writingSubmissionId = test.writingSubmissionId;

    if (resultId) {
      navigation.navigate("Result", {
        resultId,
        isFromReview: true,
      });
    } else if (writingSubmissionId) {
      navigation.navigate("Result2", {
        skill: test.type,
        writingSubmissionId,
        isFromReview: true,
      });
    }
  };

  const handleRefresh = () => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const userId = await SecureStore.getItemAsync("userId");
        if (!userId) {
          Alert.alert("Error", "User not found. Please login again.");
          navigation.replace("Login");
          return;
        }
        // Fetch history from API using the imported 'api' service
        const response = await api.get(`/history/${userId}`);
        const data = response.data; // Axios returns data directly in .data property
        const historyData = Array.isArray(data) ? data : data.data || [];
        setTestHistory(historyData);
        setLoading(false);
      } catch (err) {
        console.log("refresh history error", err);
        Alert.alert("Error", "Could not refresh test history.");
        setLoading(false);
      }
    };

    fetchHistory();
  };

  const filteredHistory = testHistory.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || test.type === filterType;
    return matchesSearch && matchesType;
  });

  const filterOptions = [
    { label: "All Tests", value: "all" },
    { label: "Reading", value: "Reading" },
    { label: "Listening", value: "Listening" },
    { label: "Writing", value: "Writing" },
    { label: "Speaking", value: "Speaking" },
    { label: "Full Test", value: "Full Test" },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading your test history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Test History</Text>
          <Text style={styles.headerSubtitle}>Track your IELTS progress</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={24} color="#10b981" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#64748b"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tests..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
            activeOpacity={0.7}
          >
            <Ionicons name="filter-outline" size={20} color="#10b981" />
            <Text style={styles.filterButtonText}>
              {filterOptions.find((option) => option.value === filterType)
                ?.label || "All Tests"}
            </Text>
            <Ionicons
              name={showFilterDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#10b981"
            />
          </TouchableOpacity>

          {showFilterDropdown && (
            <View style={styles.filterDropdown}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filterType === option.value && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilterType(option.value);
                    setShowFilterDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterType === option.value &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {filterType === option.value && (
                    <Ionicons name="checkmark" size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Test History List */}
        <View style={styles.historySection}>
          {filteredHistory.map((test) => {
            const typeColor = getTypeColor(test.type);
            return (
              <View key={test.id} style={styles.testCard}>
                <View style={styles.testCardHeader}>
                  <View style={styles.testCardLeft}>
                    <View
                      style={[
                        styles.testTypeIcon,
                        {
                          backgroundColor: typeColor.bg,
                          borderColor: typeColor.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={getTypeIcon(test.type)}
                        size={20}
                        color={typeColor.text}
                      />
                    </View>
                    <View style={styles.testInfo}>
                      <Text style={styles.testTitle}>{test.title}</Text>
                      <View style={styles.testMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#64748b"
                          />
                          <Text style={styles.metaText}>
                            {new Date(test.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#64748b"
                          />
                          <Text style={styles.metaText}>{test.duration}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <View
                            style={[
                              styles.statusBadge,
                              test.status === "completed"
                                ? styles.completedBadge
                                : styles.inProgressBadge,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                test.status === "completed"
                                  ? styles.completedText
                                  : styles.inProgressText,
                              ]}
                            >
                              {test.status === "completed"
                                ? "Completed"
                                : "In Progress"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => handleReview(test)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="eye-outline" size={16} color="#10b981" />
                    <Text style={styles.reviewButtonText}>Review</Text>
                  </TouchableOpacity>
                </View>

                {test.correct !== null && (
                  <View style={styles.testCardFooter}>
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressText}>
                        {test.correct}/{test.questions} correct
                      </Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${
                                (test.correct / test.questions) * 100
                              }%`,
                              backgroundColor: "#10b981",
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                )}

                <View
                  style={[
                    styles.testTypeBadge,
                    {
                      backgroundColor: typeColor.bg,
                      borderColor: typeColor.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.testTypeBadgeText,
                      { color: typeColor.text },
                    ]}
                  >
                    {test.type}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {filteredHistory.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyStateTitle}>No tests found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? `No tests match "${searchQuery}"`
                : filterType === "all"
                ? "You haven't taken any tests yet"
                : `No ${filterType} tests found`}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    // marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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
  scrollContainer: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 20 : 60,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },

  // Search
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  clearButton: {
    marginLeft: 8,
  },

  // Filter
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    position: "relative",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8,
    flex: 1,
  },
  filterDropdown: {
    position: "absolute",
    top: 62,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterOptionActive: {
    backgroundColor: "#f0fdf4",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  filterOptionTextActive: {
    color: "#10b981",
    fontWeight: "600",
  },

  // History
  historySection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  testCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  testCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  testCardLeft: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  testTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },
  testMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  completedBadge: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  inProgressBadge: {
    backgroundColor: "#fef3c7",
    borderColor: "#fbbf24",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  completedText: {
    color: "#166534",
  },
  inProgressText: {
    color: "#92400e",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86efac",
    marginTop: 40,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    marginLeft: 4,
  },
  testCardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  testTypeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  testTypeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
