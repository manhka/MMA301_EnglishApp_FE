"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import api from "../services/api";

export default function SpeakingScreen({ route, navigation }) {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [recording, setRecording] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Initialize audio mode
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Failed to initialize audio:", error);
      }
    };
    initializeAudio();
  }, []);

  // Fetch lesson from API
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lesson/${lessonId}/speaking`);
        const data = res.data;
        setLesson(data);
        setTimeLeft(data.duration * 60);
      } catch (err) {
        console.error("Failed to load speaking lesson", err);
        Alert.alert("Error", "Unable to load speaking prompt.");
        setLesson({
          title: "Speaking Practice",
          content:
            "Talk about your favorite holiday and explain why you like it.",
          duration: 2,
        });
        setTimeLeft(2 * 60);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  // Pulse animation for recording
  useEffect(() => {
    if (isRecording) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isRecording) pulse();
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Countdown logic
  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    if (timeLeft === 0 && isRecording) {
      stopRecording("⏰ Time's up!");
      submitAnswer(true);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      console.log("Starting recording...");

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant microphone permission to record audio."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recordingOptions = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions
      );
      setRecording(newRecording);
      setIsRecording(true);
      setRecorded(false);
      setTranscription("");
      setTimeLeft(lesson.duration * 60);

      Alert.alert("🎤 Recording Started", "Speak now...");
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async (message) => {
    try {
      console.log("Stopping recording...");

      if (!recording) return;

      setIsRecording(false);
      clearInterval(intervalRef.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecorded(true);
      setRecording(null);

      Alert.alert(
        "🛑 Recording Stopped",
        message || "Your answer has been saved."
      );

      // Start transcription process
      if (uri) {
        await transcribeAudio(uri);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording.");
    }
  };

  const transcribeAudio = async (audioUri) => {
    try {
      setIsTranscribing(true);

      // Simulate transcription process (replace with actual speech-to-text service)
      // You can integrate with services like Google Speech-to-Text, Azure Speech, etc.

      // For demo purposes, we'll simulate a transcription
      setTimeout(() => {
        const sampleTranscription =
          "This is a sample transcription of your speech. In a real implementation, this would be the actual transcribed text from your audio recording.";
        setTranscription(sampleTranscription);
        setIsTranscribing(false);

        Alert.alert(
          "✅ Transcription Complete",
          "Your speech has been converted to text. You can review it below."
        );
      }, 3000);

      // Real implementation would look like this:
      /*
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });
      
      const response = await fetch('YOUR_SPEECH_TO_TEXT_API_ENDPOINT', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = await response.json();
      setTranscription(result.transcription);
      setIsTranscribing(false);
      */
    } catch (error) {
      console.error("Transcription failed:", error);
      setIsTranscribing(false);
      Alert.alert("Transcription Error", "Failed to convert speech to text.");
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlayback = async () => {
    try {
      if (isPlaying) {
        if (sound) {
          await sound.pauseAsync();
          setIsPlaying(false);
        }
        return;
      }

      if (!recordingUri) {
        Alert.alert("No Recording", "No audio recording available to play.");
        return;
      }

      console.log("Playing recording from:", recordingUri);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Playback failed:", error);
      Alert.alert("Playback Error", "Failed to play recording.");
    }
  };

  const speakTranscription = () => {
    if (!transcription) {
      Alert.alert("No Text", "No transcription available to read aloud.");
      return;
    }

    Speech.speak(transcription, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.8,
      onStart: () => {
        console.log("Started speaking");
      },
      onDone: () => {
        console.log("Finished speaking");
      },
      onError: (error) => {
        console.error("Speech error:", error);
      },
    });
  };

  const submitAnswer = (auto = false) => {
    if (!recorded) {
      if (!auto) {
        Alert.alert("❗No Recording", "Please record your answer first.");
      }
      return;
    }

    // Submit both audio and transcription
    const submissionData = {
      audioUri: recordingUri,
      transcription: transcription,
      lessonId: lessonId,
      duration: lesson.duration * 60 - timeLeft,
    };

    console.log("Submitting:", submissionData);

    Alert.alert(
      "✅ Submitted",
      auto
        ? "Your response was automatically submitted."
        : "Your speaking response and transcription have been submitted."
    );
  };

  const handleSubmit = () => {
    submitAnswer(false);
  };

  const handleBack = () => {
    if (isRecording) {
      Alert.alert("Recording in Progress", "Stop recording before leaving?", [
        { text: "Continue Recording", style: "cancel" },
        {
          text: "Stop & Leave",
          style: "destructive",
          onPress: async () => {
            if (recording) {
              await recording.stopAndUnloadAsync();
            }
            setIsRecording(false);
            clearInterval(intervalRef.current);
            navigation.goBack();
          },
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  if (isLoading || !lesson) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading lesson...</Text>
          <Text style={styles.loadingSubText}>
            Preparing your speaking practice
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />

      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Speaking Practice</Text>
          <Text style={styles.subtitle}>
            {lesson?.title || `Lesson ${lessonId}`}
          </Text>
        </View>

        <View style={styles.durationContainer}>
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={16} color="#059669" />
            <Text style={styles.durationText}>{lesson.duration}m</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Prompt Section */}
        <View style={styles.promptSection}>
          <View style={styles.promptHeader}>
            <View style={styles.promptIconContainer}>
              <Ionicons name="chatbubble-outline" size={24} color="#10b981" />
            </View>
            <Text style={styles.promptTitle}>Speaking Prompt</Text>
          </View>
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>{lesson.content}</Text>
          </View>
        </View>

        {/* Recording Status */}
        {isRecording && (
          <View style={styles.recordingStatus}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording in progress...</Text>
            </View>
            <View style={styles.timerContainer}>
              <Ionicons name="timer-outline" size={20} color="#dc2626" />
              <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
            </View>
          </View>
        )}

        {/* Transcription Status */}
        {isTranscribing && (
          <View style={styles.transcriptionStatus}>
            <View style={styles.transcriptionIndicator}>
              <ActivityIndicator size="small" color="#10b981" />
              <Text style={styles.transcriptionText}>
                Converting speech to text...
              </Text>
            </View>
          </View>
        )}

        {/* Transcription Result */}
        {transcription && !isTranscribing && (
          <View style={styles.transcriptionSection}>
            <View style={styles.transcriptionHeader}>
              <View style={styles.transcriptionIconContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#10b981"
                />
              </View>
              <Text style={styles.transcriptionTitle}>
                Speech Transcription
              </Text>
              <TouchableOpacity
                style={styles.speakButton}
                onPress={speakTranscription}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="volume-high-outline"
                  size={20}
                  color="#10b981"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.transcriptionContainer}>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </View>
          </View>
        )}

        {/* Recording Controls */}
        <View style={styles.controlsSection}>
          <Text style={styles.controlsTitle}>Recording Controls</Text>

          {/* Main Record Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording ? styles.recordingButton : styles.readyButton,
              ]}
              onPress={handleRecord}
              activeOpacity={0.8}
            >
              <View style={styles.recordButtonContent}>
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={28}
                  color="#fff"
                />
                <Text style={styles.recordButtonText}>
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Secondary Controls */}
          <View style={styles.secondaryControls}>
            <TouchableOpacity
              style={[
                styles.playbackButton,
                !recorded && styles.disabledButton,
              ]}
              onPress={handlePlayback}
              disabled={!recorded}
              activeOpacity={0.7}
            >
              <Ionicons
                name={
                  isPlaying ? "pause-circle-outline" : "play-circle-outline"
                }
                size={20}
                color={recorded ? "#10b981" : "#9ca3af"}
              />
              <Text
                style={[styles.playbackText, !recorded && styles.disabledText]}
              >
                {isPlaying ? "Pause Recording" : "Play Recording"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Read the prompt carefully and think about your response
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Tap "Start Recording" and speak clearly into your device
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Review your recording and transcription, then submit when ready
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Section */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !recorded && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.9}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.submitText}>Submit Answer</Text>
          </TouchableOpacity>
          {!recorded && (
            <Text style={styles.submitHint}>
              Complete your recording to submit
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    fontSize: 18,
    color: "#475569",
    marginTop: 16,
    fontWeight: "600",
  },

  loadingSubText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 10 : 0,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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

  durationContainer: {
    alignItems: "flex-end",
  },

  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },

  durationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
    marginLeft: 4,
  },

  // Scroll Content
  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },

  // Prompt Section
  promptSection: {
    marginBottom: 24,
  },

  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  promptIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  promptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },

  promptContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  promptText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "justify",
  },

  // Recording Status
  recordingStatus: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#dc2626",
    marginRight: 8,
  },

  recordingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  timer: {
    fontSize: 24,
    fontWeight: "700",
    color: "#dc2626",
    marginLeft: 8,
  },

  // Transcription Status
  transcriptionStatus: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  transcriptionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  transcriptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginLeft: 8,
  },

  // Transcription Section
  transcriptionSection: {
    marginBottom: 24,
  },

  transcriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  transcriptionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  transcriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },

  speakButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },

  transcriptionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Controls Section
  controlsSection: {
    marginBottom: 24,
  },

  controlsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },

  recordButton: {
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  readyButton: {
    backgroundColor: "#10b981",
  },

  recordingButton: {
    backgroundColor: "#ef4444",
  },

  recordButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  recordButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },

  secondaryControls: {
    alignItems: "center",
  },

  playbackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },

  playbackText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
    marginLeft: 8,
  },

  disabledButton: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },

  disabledText: {
    color: "#9ca3af",
  },

  // Instructions Section
  instructionsSection: {
    marginBottom: 24,
  },

  instructionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },

  instructionsList: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },

  instructionNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  instructionText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    flex: 1,
  },

  // Submit Section
  submitSection: {
    alignItems: "center",
  },

  submitButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 200,
    justifyContent: "center",
  },

  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0.1,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  submitHint: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 12,
    textAlign: "center",
  },
});
