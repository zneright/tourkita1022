import React, { useState } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Login: undefined;
    EmailVerificationScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EmailVerificationScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [code, setCode] = useState("");

    const handleConfirm = () => {
        if (code.length === 4) {
            navigation.navigate("Login");
        } else {
            alert("Please enter the 4-digit code.");
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <ScrollView contentContainerStyle={{ paddingVertical: 40, alignItems: "center" }}>
                <Image
                    source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/5bskn3a3_expires_30_days.png" }}
                    resizeMode="stretch"
                    style={{ width: 203, height: 203, borderRadius: 40, marginBottom: 54 }}
                />

                <Text style={{ color: "#603F26", fontSize: 20, marginBottom: 17 }}>Verify your Email</Text>
                <Text style={{ color: "#6B5E5E", fontSize: 13, marginBottom: 6 }}>Please enter the 4-digit code sent to your email</Text>

                <TextInput
                    style={{
                        width: 310,
                        height: 45,
                        borderColor: "#603F26",
                        borderRadius: 15,
                        borderWidth: 1,
                        textAlign: "center",
                        fontSize: 18,
                        marginBottom: 17,
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    value={code}
                    onChangeText={setCode}
                    placeholder="1234"
                    placeholderTextColor="#999"
                />

                <TouchableOpacity onPress={() => alert("Resend Code")} style={{ marginBottom: 17 }}>
                    <Text style={{ color: "#6B5E5E", fontSize: 13 }}>Resend Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        backgroundColor: "#603F26",
                        borderRadius: 5,
                        paddingVertical: 11,
                        marginBottom: 17,
                        alignItems: "center",
                    }}
                    onPress={handleConfirm}
                >
                    <Text style={{ color: "#FFFFFF", fontSize: 20 }}>Confirm Email</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={{ color: "#6B5E5E", fontSize: 13 }}>Change Email</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EmailVerificationScreen;
