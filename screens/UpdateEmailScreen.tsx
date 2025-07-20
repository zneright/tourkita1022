import React, { useState } from "react";
import {
    SafeAreaView,
    Text,
    TextInput,
    Button,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { auth, db } from "../firebase";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateEmail,
    sendEmailVerification,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const UpdateEmailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [password, setPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdateEmail = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "No user is currently logged in.");
            return;
        }

        if (!password || !newEmail) {
            Alert.alert("Missing Fields", "Please enter both password and new email.");
            return;
        }

        setLoading(true);

        try {
            const credential = EmailAuthProvider.credential(user.email!, password);
            await reauthenticateWithCredential(user, credential); // Step 1: Re-auth
            // Step 2: Update Email

            await sendEmailVerification(user);                    // Step 3: Send to new email

            await updateEmail(user, newEmail);
            await updateDoc(doc(db, "users", user.uid), {
                email: newEmail,
            });                                                   // Step 4: Update Firestore

            Alert.alert(
                "Email Updated",
                "Your email has been updated. Please verify your new email before logging in again."
            );

            auth.signOut();                                       // Step 5: Sign out
            navigation.replace("Login");

        } catch (error: any) {
            console.error("Error updating email:", error);
            Alert.alert("Error", error.message || "Failed to update email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.label}>Enter your password to confirm:</Text>
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Text style={styles.label}>Enter your new email:</Text>
            <TextInput
                style={styles.input}
                placeholder="New Email"
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <Button title="Update Email" onPress={handleUpdateEmail} />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default UpdateEmailScreen;
