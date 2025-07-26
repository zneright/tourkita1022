import React, { useState, useCallback } from 'react';
import {
    SafeAreaView,
    Text,
    StyleSheet,
    Alert,
    View,
    TextInput,
    ActivityIndicator,
    TouchableOpacity,
    BackHandler
} from 'react-native';
import { getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { FirebaseError } from 'firebase/app';
import { useFocusEffect } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function DeleteAccountScreen() {
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigation = useNavigation<NavigationProp>();

    const handleDeleteAccount = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
            try {
                setIsDeleting(true);
                setError(null);

                if (!password) {
                    setIsPasswordValid(false);
                    setIsDeleting(false);
                    return;
                }

                const credential = EmailAuthProvider.credential(currentUser.email!, password);
                await reauthenticateWithCredential(currentUser, credential);

                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();

                    const archivedRef = doc(db, 'archived', currentUser.uid);
                    await setDoc(archivedRef, {
                        ...userData,
                        archivedAt: new Date().toISOString(), // Optional: timestamp of archiving
                    });

                    await setDoc(userRef, {}); // Optional: clear before deletion
                    await deleteDoc(userRef); // Delete from users collection

                    await deleteUser(currentUser); // Firebase auth account deletion

                    Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
                    navigation.replace('Login');
                }
            } catch (error: any) {
                setIsDeleting(false);
                if ((error as FirebaseError).code === 'auth/requires-recent-login') {
                    setError('Please re-enter your password to proceed.');
                } else {
                    setError('Failed to delete account. Please check your password and try again.');
                }
            }
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.goBack();
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [navigation])
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Delete Account</Text>
            <Text style={styles.instructions}>
                Are you sure you want to delete your account? Enter your password to continue.
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

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancel}
                    disabled={isDeleting}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleDeleteAccount}
                    disabled={isDeleting}
                >
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        backgroundColor: '#F2F2F2',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#493628',
    },
    instructions: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#493628',
    },
    input: {
        backgroundColor: '#FFF',
        borderColor: '#493628',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    inputError: {
        borderColor: '#FF0000',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 13,
        marginBottom: 8,
    },
    loader: {
        marginVertical: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    deleteButton: {
        backgroundColor: '#FF0000',
    },
    cancelButton: {
        backgroundColor: '#D9D9D9',
    },
    deleteText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelText: {
        color: '#493628',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
