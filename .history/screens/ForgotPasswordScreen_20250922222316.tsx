import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type RootStackParamList = {
    Login: undefined;
    ForgotPasswordScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState("");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendResetLink = async () => {
        if (!email) {
            return alert("Please enter your email address.");
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setIsEmailSent(true);
            alert("If this email is registered, a password reset link has been sent.");
        } catch (error: any) {
            alert(error.message || "Failed to send password reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Forgot Password</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.sendButton, loading && styles.disabledButton]}
                        onPress={handleSendResetLink}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.sendButtonText}>
                                {isEmailSent ? "Resend Email" : "Send Reset Link"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {isEmailSent ? (
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={styles.confirmButtonText}>Back to Login</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.footerText}>← Back to Login</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
               
            </KeyboardAvoidingView>
            
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    backButton: { marginRight: 12 },
    backText: { fontSize: 24, color: "#333" },
    headerText: { fontSize: 20, fontWeight: "600", color: "#333" },
    content: { padding: 20, paddingTop: 30, flexGrow: 1 },
    inputGroup: { marginBottom: 25 },
    label: { fontSize: 14, color: "#555", marginBottom: 6 },
    input: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: "#fafafa",
        fontSize: 14,
        color: "#333",
    },
    sendButton: {
        backgroundColor: "#8B5E3C",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 16,
    },
    sendButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    disabledButton: { opacity: 0.6 },
    confirmButton: {
        backgroundColor: "#8B5E3C",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 16,
    },
    confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    footerText: { color: "#6B5E5E", fontSize: 14, textAlign: "center" },
    forgotText: {
        color: "#8B5E3C",
        fontSize: 14,
        textAlign: "right",
        marginTop: -10,
        marginBottom: 20,
        fontWeight: "500",
    },

});
