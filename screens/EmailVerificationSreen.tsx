import React, { useEffect, useState, useRef } from "react";
import {
    SafeAreaView,
    ScrollView,
    Image,
    Text,
    View,
    ActivityIndicator,
    Alert,
    BackHandler,
} from "react-native";
import { useNavigation, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth } from "../firebase";
import { saveUserData } from "../utils/saveUserData";
import { RootStackParamList } from "../Navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;
type EmailVerificationRouteProp = RouteProp<RootStackParamList, "EmailVerification">;

const EmailVerificationScreen = ({ route }: { route: EmailVerificationRouteProp }) => {
    const navigation = useNavigation<NavigationProp>();
    const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { userData } = route.params;

    useEffect(() => {
        const checkEmailVerification = async () => {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    setIsEmailVerified(true);
                } else {
                    setIsEmailVerified(false);
                }
            }
        };

        const interval = setInterval(() => {
            checkEmailVerification();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        timeoutRef.current = setTimeout(async () => {
            const user = auth.currentUser;
            if (user && !user.emailVerified) {
                await user.delete();
                Alert.alert(
                    "Verification Unsuccesful"
                );
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            }
        }, 5 * 60 * 1000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const user = auth.currentUser;

        if (isEmailVerified && user) {
            const userDataWithCreatedAt = {
                ...userData,
                uid: user.uid,
                createdAt: new Date().toISOString(),
            };

            saveUserData(userDataWithCreatedAt)
                .then(() => {
                    Alert.alert("Email Verified", "Redirecting to login screen...");
                    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                })
                .catch((error) => {
                    console.error("Error saving user data:", error);
                });
        }
    }, [isEmailVerified]);

    useFocusEffect(() => {
        const onBackPress = () => {
            Alert.alert(
                "Cancel Email Verification",
                "Are you sure you want to go back? ",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "OK",
                        onPress: async () => {
                            const user = auth.currentUser;
                            if (user && !user.emailVerified) {
                                await user.delete();
                            }
                            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                        },
                    },
                ]
            );
            return true;
        };

        BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        };
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <ScrollView contentContainerStyle={{ paddingVertical: 40, alignItems: "center" }}>
                <Image
                    source={{
                        uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/5bskn3a3_expires_30_days.png",
                    }}
                    resizeMode="stretch"
                    style={{ width: 203, height: 203, borderRadius: 40, marginBottom: 54 }}
                />

                <Text style={{ color: "#603F26", fontSize: 20, marginBottom: 17 }}>
                    Verify your Email
                </Text>
                <Text style={{ color: "#6B5E5E", fontSize: 13, marginBottom: 6 }}>
                    Please check your email for the verification link.
                </Text>

                {checking && (
                    <View style={{ marginVertical: 20 }}>
                        <ActivityIndicator size="large" color="#603F26" />
                        <Text style={{ color: "#6B5E5E", marginTop: 10 }}>
                            Checking verification status...
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default EmailVerificationScreen;