import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

type RootStackParamList = {
    Login: undefined;
    ForgotPasswordScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState("");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendResetLink = async () => {
        if (!email) {
            Alert.alert("Missing Email", "Please enter your email address.");
            return;
        }

        if (isLoading) return; // prevent multiple submissions
        setIsLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setIsEmailSent(true);
            Alert.alert(
                "Email Sent",
                "If this email is registered, a password reset link has been sent."
            );
        } catch (error: any) {
            console.error("Reset email error:", error);
            Alert.alert("Error", error.message || "Failed to send password reset email.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Forgot Password</Text>

                <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                />

                <TouchableOpacity
                    style={[styles.sendCodeButton, isLoading && { opacity: 0.6 }]}
                    onPress={handleSendResetLink}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.sendCodeText}>
                            {isEmailSent ? "Resend Email" : "Send Reset Link"}
                        </Text>
                    )}
                </TouchableOpacity>

                {isEmailSent ? (
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={styles.confirmText}>Back to Login</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.footerText}>← Back to Login</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },
    title: {
        fontSize: 24,
        color: "#603F26",
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        width: "100%",
        height: 48,
        borderColor: "#603F26",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    sendCodeButton: {
        width: "100%",
        backgroundColor: "#603F26",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 16,
    },
    sendCodeText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    confirmButton: {
        width: "100%",
        backgroundColor: "#6B5E5E",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 16,
    },
    confirmText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    footerText: {
        color: "#6B5E5E",
        fontSize: 14,
        textAlign: "center",
    },
});
