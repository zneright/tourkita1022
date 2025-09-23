import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    BackHandler
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";
import { auth } from "../firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Maps">;

const ChangePasswordScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.goBack();
            return true;
        });

        return () => backHandler.remove();
    }, []);
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return alert("All fields are required.");
        }
        if (newPassword !== confirmPassword) {
            return alert("New password and confirmation do not match.");
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
            return alert("No user is currently signed in.");
        }

        setLoading(true);
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            alert("Password updated successfully!");
            navigation.goBack();
        } catch (error: any) {
            alert(error.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length >= 12) return "Strong";
        if (password.length >= 8) return "Medium";
        if (password.length > 0) return "Weak";
        return "";
    };

    const passwordFields = [
        { label: "Current Password", value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
        { label: "New Password", value: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
        { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Change Password</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {passwordFields.map(({ label, value, setter, show, toggle }, index) => (
                        <View key={index} style={styles.inputGroup}>
                            <Text style={styles.label}>{label}</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    secureTextEntry={!show}
                                    value={value}
                                    onChangeText={setter}
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    style={styles.input}
                                />
                                <TouchableOpacity onPress={toggle}>
                                    <MaterialCommunityIcons
                                        name={show ? "eye-off" : "eye"}
                                        size={20}
                                        color="#8B5E3C"
                                    />
                                </TouchableOpacity>
                            </View>
                            {label === "New Password" && value.length > 0 && (
                                <Text style={styles.passwordStrength}>{getPasswordStrength(value)}</Text>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
                    </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity onPress={() => navigation.navigate("ForgotPasswordScreen")}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

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
    headerText: { fontSize: 20, fontWeight: "600", color: "#333" },
    content: { padding: 20, paddingTop: 30 },
    inputGroup: { marginBottom: 25 },
    label: { fontSize: 14, color: "#555", marginBottom: 6 },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: "#fafafa",
    },
    input: { flex: 1, height: 48, fontSize: 14, color: "#333" },
    passwordStrength: { fontSize: 12, color: "#8B5E3C", marginTop: 4 },
    saveButton: { backgroundColor: "#8B5E3C", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 20 },
    disabledButton: { opacity: 0.6 },
    saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    forgotText: {
        color: "#8B5E3C",
        fontSize: 14,
        textAlign: "right",
        marginTop: -10,
        marginBottom: 20,
        fontWeight: "500",
    },

});

export default ChangePasswordScreen;
