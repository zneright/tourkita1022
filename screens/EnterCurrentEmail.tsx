import React, { useState } from "react";
import {
    SafeAreaView,
    Text,
    TextInput,
    Button,
    Alert,
    ActivityIndicator,
} from "react-native";
import { auth } from "../firebase";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/types";
import { useNavigation } from "@react-navigation/native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "EnterCurrentEmail">;

const EnterCurrentEmailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerifyEmail = async () => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Not Logged In", "You must be logged in to continue.");
            return;
        }

        if (user.email !== email) {
            Alert.alert("Email Mismatch", "The email you entered does not match your account.");
            return;
        }

        if (!user.emailVerified) {
            Alert.alert(
                "Email Not Verified",
                "Your email is not verified. Please verify your email before proceeding."
            );
            return;
        }

        // If email matches and is verified, allow proceeding to update email
        navigation.navigate("CurrentEmailVerification");
    };

    return (
        <SafeAreaView style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
                Confirm your current verified email:
            </Text>
            <TextInput
                placeholder="Current Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                    borderWidth: 1,
                    padding: 10,
                    marginBottom: 20,
                    borderRadius: 8,
                }}
            />
            {loading ? (
                <ActivityIndicator />
            ) : (
                <Button title="Verify and Continue" onPress={handleVerifyEmail} />
            )}
        </SafeAreaView>
    );
};

export default EnterCurrentEmailScreen;
