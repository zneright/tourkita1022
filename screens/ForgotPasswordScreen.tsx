import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Login: undefined;
    ForgotPasswordScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);

    const handleSendCode = () => {
        if (!email) {
            alert("Please enter your email.");
            return;
        }
        setIsCodeSent(true);
        alert("Verification code sent to your email!");
    };

    const handleReset = () => {
        if (email && code.length === 4) {
            alert("Password reset link sent!");
            navigation.navigate("Login");
        } else {
            alert("Please enter your email and the 4-digit code.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Forgot Password</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                />
                {!isCodeSent ? (
                    <TouchableOpacity style={styles.sendCodeButton} onPress={handleSendCode}>
                        <Text style={styles.sendCodeText}>Send Code</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TextInput
                            style={[styles.input, styles.codeInput]}
                            keyboardType="numeric"
                            maxLength={4}
                            value={code}
                            onChangeText={setCode}
                            placeholder="1234"
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity onPress={() => alert("Code resent!")}>
                            <Text style={styles.resendCodeText}>Resend Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={handleReset}>
                            <Text style={styles.confirmText}>Reset Password</Text>
                        </TouchableOpacity>
                    </>
                )}
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.footerText}>Back to Login</Text>
                </TouchableOpacity>
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
    codeInput: {
        textAlign: "center",
        fontSize: 18,
    },
    sendCodeButton: {
        width: "100%",
        backgroundColor: "#603F26",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 24,
    },
    sendCodeText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    resendCodeText: {
        color: "#6B5E5E",
        fontSize: 14,
        marginBottom: 24,
    },
    confirmButton: {
        width: "100%",
        backgroundColor: "#603F26",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 16,
    },
    confirmText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    footerText: {
        color: "#6B5E5E",
        fontSize: 14,
        textAlign: "center",
    },
});
