import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Colors } from "../constants/Colors";
import { useNotes } from "../context/NotesContext";

WebBrowser.maybeCompleteAuthSession();

// Configure your Google Cloud OAuth credentials in .env
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

interface UserInfo {
  email: string;
  name: string;
  picture?: string;
}

export function CalendarSettings() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { isCalendarConnected, connectCalendar, disconnectCalendar } =
    useNotes();
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Configure Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });

  // Handle OAuth response
  useEffect(() => {
    handleAuthResponse();
  }, [response]);

  const handleAuthResponse = async () => {
    if (response?.type === "success") {
      setIsLoading(true);
      const { authentication } = response;

      if (authentication?.accessToken) {
        try {
          // Fetch user info
          const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
              headers: {
                Authorization: `Bearer ${authentication.accessToken}`,
              },
            }
          );

          if (userInfoResponse.ok) {
            const userData = await userInfoResponse.json();
            setUserInfo({
              email: userData.email,
              name: userData.name,
              picture: userData.picture,
            });
          }

          // Connect calendar with the token
          await connectCalendar(authentication.accessToken);

          Alert.alert(
            "✅ Connected!",
            "Your Google Calendar is now connected. Meeting and event notes will automatically sync to your calendar.",
            [{ text: "Great!" }]
          );
        } catch (error) {
          console.error("Auth error:", error);
          Alert.alert("Error", "Failed to connect. Please try again.");
        }
      }
      setIsLoading(false);
    } else if (response?.type === "error") {
      Alert.alert("Error", response.error?.message || "Authentication failed");
    }
  };

  const handleSignIn = async () => {
    if (
      !GOOGLE_WEB_CLIENT_ID &&
      !GOOGLE_IOS_CLIENT_ID &&
      !GOOGLE_ANDROID_CLIENT_ID
    ) {
      Alert.alert(
        "Setup Required",
        "Google Calendar integration requires Google Cloud OAuth credentials.\n\nAdd these to your .env file:\n• EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID\n• EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID\n• EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error("Sign in error:", error);
    }
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnect Google Calendar",
      "Events will no longer sync automatically. You can reconnect anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await disconnectCalendar();
            setUserInfo(null);
          },
        },
      ]
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: "#4285F420" }]}>
          <Ionicons name="calendar" size={24} color="#4285F4" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Google Calendar Sync
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isCalendarConnected
              ? "Auto-sync enabled for meetings & events"
              : "Sign in to auto-create calendar events"}
          </Text>
        </View>
      </View>

      {/* Connected State */}
      {isCalendarConnected ? (
        <View style={styles.connectedSection}>
          {/* User Info */}
          {userInfo && (
            <View
              style={[styles.userCard, { backgroundColor: colors.background }]}
            >
              <View style={styles.userAvatar}>
                <Ionicons name="person-circle" size={40} color="#4285F4" />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {userInfo.name}
                </Text>
                <Text
                  style={[styles.userEmail, { color: colors.textSecondary }]}
                >
                  {userInfo.email}
                </Text>
              </View>
              <View style={styles.syncBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.syncText}>Synced</Text>
              </View>
            </View>
          )}

          {/* Disconnect Button */}
          <TouchableOpacity
            style={[styles.disconnectButton, { borderColor: colors.border }]}
            onPress={handleDisconnect}
          >
            <Ionicons
              name="log-out-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.disconnectText, { color: colors.textSecondary }]}
            >
              Disconnect Account
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Sign In Button */
        <TouchableOpacity
          style={[
            styles.signInButton,
            isLoading && styles.signInButtonDisabled,
          ]}
          onPress={handleSignIn}
          disabled={isLoading || !request}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.signInText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Info Box */}
      <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
        <Ionicons name="sparkles" size={18} color="#F59E0B" />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {isCalendarConnected
            ? 'Say "Meeting with John tomorrow at 3pm" and it\'ll appear in your calendar automatically!'
            : "Connect to automatically add meetings and events from your notes to Google Calendar."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  connectedSection: {
    gap: 12,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  syncText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  disconnectText: {
    fontSize: 14,
    fontWeight: "500",
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
  },
  signInText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
