"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api"; // Import the api service

export default function Result2Screen({ route, navigation }) {
  // Get writingSubmissionId from route.params
  const { writingSubmissionId, isFromReview } = route.params;

  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!writingSubmissionId) {
        setError("Writing submission ID not found for details.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Call API using writingSubmissionId
        const response = await api.get(
          `/writing-submit/${writingSubmissionId}`
        );
        setSubmissionDetails(response.data); // Axios returns data in .data property
      } catch (err) {
        console.error("Error loading writing submission details:", err);
        setError(
          "Could not load writing submission details. Please try again."
        );
        Alert.alert(
          "Error",
          "Could not load writing submission details. Please check your connection and try again.",
          [
            {
              text: "Retry",
              onPress: () => fetchSubmissionDetails(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [writingSubmissionId]); // Dependency array to re-fetch when writingSubmissionId changes

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Yellow
    if (score >= 40) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>
          Loading writing submission details...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!submissionDetails) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
        <Ionicons name="information-circle-outline" size={48} color="#64748b" />
        <Text style={styles.emptyText}>No data found for this submission.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  const handleBack = () => {
    if (isFromReview) {
      navigation.goBack();
    } else {
      navigation.navigate("Dashboard");
    }
  };
  // Use data from submissionDetails
  const { content, aiScore, aiFeedback, submittedAt, submissionText } =
    submissionDetails;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎓 AI Evaluation Result</Text>
          <Text style={styles.headerSubtitle}>
            Your writing has been analyzed
          </Text>
        </View>
      </View>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Overall Score</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeText}>AI Evaluated</Text>
            </View>
          </View>
          <View style={styles.scoreContent}>
            <Text
              style={[styles.scoreValue, { color: getScoreColor(aiScore) }]}
            >
              {aiScore ?? "N/A"}
              {aiScore && <Text style={styles.scoreMax}>/100</Text>}
            </Text>
            {aiScore && (
              <Text
                style={[styles.scoreLabel, { color: getScoreColor(aiScore) }]}
              >
                {getScoreLabel(aiScore)}
              </Text>
            )}
          </View>
          {aiScore && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${aiScore}%`,
                      backgroundColor: getScoreColor(aiScore),
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Submitted Text Card (New) */}
        {submissionText && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.cardIcon}>✍️</Text>
              </View>
              <Text style={styles.cardTitle}>Your Submission</Text>
            </View>
            <Text style={styles.cardContent}>{submissionText}</Text>
          </View>
        )}

        {/* Prompt Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>📝</Text>
            </View>
            <Text style={styles.cardTitle}>Writing Prompt</Text>
          </View>
          <Text style={styles.cardContent}>{content}</Text>
        </View>

        {/* Feedback Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>🤖</Text>
            </View>
            <Text style={styles.cardTitle}>AI Feedback</Text>
          </View>
          <Text style={styles.feedbackText}>{aiFeedback}</Text>
        </View>

        {/* Submission Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>📅</Text>
            </View>
            <Text style={styles.cardTitle}>Submission Details</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted on:</Text>
            <Text style={styles.detailValue}>{formatDate(submittedAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Evaluation method:</Text>
            <Text style={styles.detailValue}>AI Analysis</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Dashboard")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>🏠 Back to Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : StatusBar.currentHeight + 25,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "600",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "500",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scoreCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  scoreBadge: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  scoreBadgeText: {
    fontSize: 12,
    color: "#0369a1",
    fontWeight: "600",
  },
  scoreContent: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "800",
    textAlign: "center",
  },
  scoreMax: {
    fontSize: 24,
    color: "#64748b",
    fontWeight: "600",
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: "#f0f9ff",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  cardContent: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
    fontWeight: "400",
  },
  feedbackText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    fontWeight: "400",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#6366f1",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  actionContainer: {
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
  // New styles for loading/error states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
