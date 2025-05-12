import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    Button,
    ActivityIndicator,
    Alert,
    BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth, db } from "../firebase"; // Initialized Firebase auth and Firestore
import { RootStackParamList } from "../Navigation/types";
import {
    sendEmailVerification,
    updateEmail,
    fetchSignInMethodsForEmail,
} from "firebase/auth"; // Firebase auth methods
import { doc, updateDoc } from "firebase/firestore"; // Firestore modular imports

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const UpdateEmailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [newEmail, setNewEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Function to check if the email is already in use
    const checkEmailInUse = async (email: string) => {
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            return methods.length > 0;
        } catch (error) {
            return false;
        }
    };

    const sendVerificationEmail = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await sendEmailVerification(user);
                Alert.alert("Verification Sent", "A verification link has been sent to your email.");
            } catch (error: any) {
                setErrorMessage(error.message || "An error occurred while sending verification.");
            }
        } else {
            setErrorMessage("No user is logged in.");
        }
    };

    const handleUpdateEmail = async (user: any) => {
        if (!newEmail) {
            setErrorMessage("Please enter a valid email.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            await updateEmail(user, newEmail);

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { email: newEmail });

            Alert.alert("Email Updated", "Your email has been successfully updated.");
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        } catch (error: any) {
            setErrorMessage(error.message || "An error occurred while updating your email.");
        }

        setLoading(false);
    };

    const handleEmailUpdateProcess = async () => {
        if (!newEmail) {
            setErrorMessage("Please enter a valid email.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const isEmailInUse = await checkEmailInUse(newEmail);

            if (isEmailInUse) {
                setErrorMessage("This email is already in use. Please use a different email.");
                setLoading(false);
                return;
            }

            Alert.alert(
                "Confirm Email Change",
                `We will now send a verification link to ${newEmail}. You must confirm it before we update your account.`,
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => setLoading(false),
                    },
                    {
                        text: "Send Link",
                        onPress: async () => {
                            await auth.signOut();
                            navigation.reset({ index: 0, routes: [{ name: "Login" }] });

                            Alert.alert(
                                "Verify Your Email",
                                "A verification link has been sent to your new email. Please confirm to complete the process."
                            );

                            setLoading(false);
                        },
                    },
                ]
            );
        } catch (error: any) {
            setErrorMessage(error.message || "An error occurred during the process.");
            setLoading(false);
        }
    };


    const handleBackPress = () => {
        Alert.alert(
            "Cancel Email Update",
            "Are you sure you want to cancel the email update?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => navigation.goBack() },
            ]
        );
        return true;
    };

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBackPress);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
        };
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <ScrollView contentContainerStyle={{ paddingVertical: 40, alignItems: "center" }}>
                <Text style={{ color: "#603F26", fontSize: 20, marginBottom: 17 }}>
                    Update Your Email
                </Text>

                <TextInput
                    style={{
                        width: "80%",
                        height: 40,
                        borderColor: "#ddd",
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        marginBottom: 20,
                    }}
                    placeholder="Enter new email"
                    value={newEmail}
                    onChangeText={setNewEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {errorMessage ? (
                    <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text>
                ) : null}

                {loading ? (
                    <ActivityIndicator size="large" color="#603F26" />
                ) : (
                    <Button title="Check and Update Email" onPress={handleEmailUpdateProcess} />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default UpdateEmailScreen;
