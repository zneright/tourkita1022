import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Button, Alert, View, TextInput, ActivityIndicator } from 'react-native';
import { getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { FirebaseError } from 'firebase/app';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function DeleteAccountScreen() {
    const [password, setPassword] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation<NavigationProp>();

    const handleDeleteAccount = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
            try {
                setIsDeleting(true);
                setError(null);

                // Check if tama ang pass
                if (!password) {
                    setIsPasswordValid(false);
                    setIsDeleting(false);
                    return;
                }

                // Reauthenticate the user with the entered password
                const credential = EmailAuthProvider.credential(currentUser.email!, password);
                await reauthenticateWithCredential(currentUser, credential);

                // Get user data
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();

                    // Move data to 'archived'
                    const archivedRef = collection(db, 'archived');
                    await setDoc(doc(archivedRef, currentUser.uid), userData);

                    // Delete data from 'users' collection and Firebase Auth
                    await deleteUser(currentUser);

                    Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
                    navigation.replace('Login');
                }
            } catch (error: any) {
                console.error('Error deleting account:', error);
                setIsDeleting(false);

                if ((error as FirebaseError).code === 'auth/requires-recent-login') {
                    setError('Please re-enter your password to proceed.');
                } else {
                    setError('Failed to delete account. Please check your password and try again.');
                }
            }

        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Delete Account</Text>
            <Text style={styles.instructions}>
                Are you sure you want to delete your account? Please enter your password to proceed.
            </Text>

            <TextInput
                style={[styles.input, !isPasswordValid && styles.inputError]}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            {!isPasswordValid && <Text style={styles.errorText}>Password is required.</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {isDeleting && <ActivityIndicator size="large" color="#FF0000" style={styles.loader} />}

            <View style={styles.buttonContainer}>
                <Button
                    title="Delete Account"
                    onPress={handleDeleteAccount}
                    color="#FF0000"
                    disabled={isDeleting}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F2F2F2',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#493628',
    },
    instructions: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#493628',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },
    loader: {
        marginVertical: 20,
    },
    input: {
        width: '100%',
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#493628',
        borderRadius: 5,
    },
    inputError: {
        borderColor: '#FF0000',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 12,
    },
});
