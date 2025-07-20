import React, { useEffect } from "react";
import {
    SafeAreaView,
    Text,
    ActivityIndicator,
    Alert,
    StyleSheet,
    View,
} from "react-native";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "CurrentEmailVerification">;

const CurrentEmailVerificationScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        const intervalId = setInterval(async () => {
            const user = auth.currentUser;
            await user?.reload();
            if (user?.emailVerified) {
                clearInterval(intervalId);
                Alert.alert("Verified", "You may now enter a new email.");
                navigation.reset({ index: 0, routes: [{ name: "UpdateEmail" }] });
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>
                    Please verify your current email address
                </Text>
                <ActivityIndicator size="large" color="#603F26" />
                <Text style={styles.subtext}>Checking verification status...</Text>
            </View>
        </SafeAreaView>
    );
};

export default CurrentEmailVerificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        alignItems: "center",
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
        color: "#603F26",
        textAlign: "center",
    },
    subtext: {
        marginTop: 15,
        fontSize: 14,
        color: "#6B5E5E",
    },
});
