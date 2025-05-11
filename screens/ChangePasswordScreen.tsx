import React from "react";
import { SafeAreaView, View, ScrollView, Text, Image, TextInput, TouchableOpacity } from "react-native";
import TopHeader from "../components/TopHeader";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Maps">;

const ChangePasswordScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <TopHeader
                title="Change Password"
                onSupportPress={() => navigation.navigate("Support")}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={{ alignItems: "center", marginVertical: 20 }}>
                    <Image
                        source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/z7e5t1ql_expires_30_days.png" }}
                        style={{ width: 200, height: 200 }}
                        resizeMode="contain"
                    />
                </View>

                {["Current Password", "New Password", "Confirm Password"].map((label, index) => (
                    <View key={index} style={{ marginHorizontal: 40, marginBottom: 15 }}>
                        <Text style={{ color: "#493628", fontSize: 13, marginBottom: 5 }}>
                            {label}
                        </Text>
                        <TextInput
                            secureTextEntry
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
                    onPress={() => alert("Pressed!")}
                >
                    <Text style={{ fontSize: 16, color: "#493628" }}>Save</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;
