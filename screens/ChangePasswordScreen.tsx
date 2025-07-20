import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    ScrollView,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    BackHandler,
} from "react-native";
import logo from "./components/TourkitaLogo.jpg";
import TopHeader from "../components/TopHeader";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";
import { auth } from "../firebase"; // Your initialized Firebase
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Maps">;

const ChangePasswordScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔙 Handle Android hardware back press
    useEffect(() => {
        const onBackPress = () => {
            Alert.alert(
                "Cancel Changes?",
                "Are you sure you want to discard your password changes?",
                [
                    { text: "No", style: "cancel" },
                    {
                        text: "Yes",
                        style: "destructive",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
            return true; // prevent default behavior
        };

        BackHandler.addEventListener("hardwareBackPress", onBackPress);

        return () => {
            BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        };
    }, []);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return Alert.alert("All fields are required.");
        }

        if (newPassword !== confirmPassword) {
            return Alert.alert("New password and confirmation do not match.");
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
            return Alert.alert("No user is currently signed in.");
        }

        setLoading(true);

        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            Alert.alert("Success", "Your password has been updated.");
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <TopHeader
                title="Change Password"
                onSupportPress={() => navigation.navigate("Support")}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={{ alignItems: "center", marginVertical: 20 }}>
                    <Image
                        source={{
                            uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/z7e5t1ql_expires_30_days.png",
                        }}
                        style={{ width: 200, height: 200 }}
                        resizeMode="contain"
                    />
                </View>

                {[
                    {
                        label: "Current Password",
                        value: currentPassword,
                        setter: setCurrentPassword,
                    },
                    {
                        label: "New Password",
                        value: newPassword,
                        setter: setNewPassword,
                    },
                    {
                        label: "Confirm Password",
                        value: confirmPassword,
                        setter: setConfirmPassword,
                    },
                ].map(({ label, value, setter }, index) => (
                    <View key={index} style={{ marginHorizontal: 40, marginBottom: 15 }}>
                        <Text style={{ color: "#493628", fontSize: 13, marginBottom: 5 }}>
                            {label}
                        </Text>
                        <TextInput
                            secureTextEntry
                            value={value}
                            onChangeText={setter}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            style={{
                                height: 45,
                                borderColor: "#603F26",
                                borderWidth: 1,
                                borderRadius: 15,
                                paddingHorizontal: 10,
                                backgroundColor: "#FFFFFF",
                            }}
                        />
                        {label === "Current Password" && (
                            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                                <Text
                                    style={{
                                        fontSize: 10,
                                        color: "#603F26",
                                        textAlign: "right",
                                        marginTop: 5,
                                    }}
                                >
                                    Forgot password
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <TouchableOpacity
                    style={{
                        marginHorizontal: 33,
                        backgroundColor: "#D9D9D9",
                        borderRadius: 10,
                        paddingVertical: 17,
                        alignItems: "center",
                        marginTop: 20,
                    }}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#493628" />
                    ) : (
                        <Text style={{ fontSize: 16, color: "#493628" }}>Save</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;
