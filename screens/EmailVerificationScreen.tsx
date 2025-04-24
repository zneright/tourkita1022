import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    ScrollView,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
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
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingVertical: 40,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 40,
                    shadowColor: "#00000040",
                    shadowOpacity: 0.3,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 23,
                    elevation: 23,
                }}
            >
                <View style={{ alignItems: "center", marginBottom: 54 }}>
                    <Image
                        source={{
                            uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/5bskn3a3_expires_30_days.png",
                        }}
                        resizeMode="stretch"
                        style={{ borderRadius: 40, width: 203, height: 203 }}
                    />
                </View>

                <Text style={{ color: "#603F26", fontSize: 20, marginLeft: 48, marginBottom: 17 }}>
                    Verify your Email
                </Text>

                <Text style={{ color: "#6B5E5E", fontSize: 13, marginHorizontal: 52, marginBottom: 6 }}>
                    Please enter the 4 digit code sent to your email
                </Text>

                <View style={{ alignItems: "center", marginBottom: 17 }}>
                    <TextInput
                        style={{
                            width: 310,
                            height: 45,
                            backgroundColor: "#FFFFFF",
                            borderColor: "#603F26",
                            borderRadius: 15,
                            borderWidth: 1,
                            textAlign: "center",
                            fontSize: 18,
                        }}
                        keyboardType="numeric"
                        maxLength={4}
                        value={code}
                        onChangeText={setCode}
                        placeholder="1234"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={{ alignItems: "center", marginBottom: 17 }}>
                    <TouchableOpacity onPress={() => alert("Resend Code")}>
                        <Text style={{ color: "#6B5E5E", fontSize: 13 }}>Resend Code</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={{
                        alignItems: "center",
                        backgroundColor: "#603F26",
                        borderRadius: 5,
                        paddingVertical: 11,
                        marginHorizontal: 48,
                        marginBottom: 17,
                        shadowColor: "#00000040",
                        shadowOpacity: 0.3,
                        shadowOffset: { width: 0, height: 0 },
                        shadowRadius: 4,
                        elevation: 4,
                    }}
                    onPress={handleConfirm}
                >
                    <Text style={{ color: "#FFFFFF", fontSize: 20 }}>Confirm Email</Text>
                </TouchableOpacity>

                <View style={{ alignItems: "center", marginBottom: 50 }}>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={{ color: "#6B5E5E", fontSize: 13 }}>Change Email</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EmailVerificationScreen;
