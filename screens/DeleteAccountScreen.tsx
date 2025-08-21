import React, { useState, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    BackHandler
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const DeleteAccountScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('Profile');
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation])
    );

    const handleDeleteAccount = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) return;
        if (!password) {
            setError('Password is required.');
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            const credential = EmailAuthProvider.credential(currentUser.email!, password);
            await reauthenticateWithCredential(currentUser, credential);

            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', currentUser.email));
            const querySnap = await getDocs(q);

            if (querySnap.empty) {
                setError('No user document found for this account.');
                return;
            }

            for (const userDoc of querySnap.docs) {
                const userData = userDoc.data();

                const archivedRef = doc(db, 'archived_Users', userDoc.id);
                try {
                    await setDoc(archivedRef, {
                        ...userData,
                        archivedAt: new Date().toISOString(),
                    });
                    console.log('User data archived successfully.');
                } catch (archiveErr) {
                    console.error('Failed to archive user:', archiveErr);
                    setError('Failed to archive your data. Account not deleted.');
                    return;
                }

                await deleteDoc(doc(db, 'users', userDoc.id));
                console.log('User document deleted from users collection.');
            }

            await deleteUser(currentUser);
            console.log('Firebase Auth user deleted.');

            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
            navigation.replace('Login');

        } catch (err: any) {
            console.error('Delete account error:', err);
            setError(err.message || 'Failed to delete account.');
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Delete Account</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.instructions}>
                        Are you sure you want to delete your account? Enter your password to continue.
                    </Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <MaterialCommunityIcons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color="#8B5E3C"
                            />
                        </TouchableOpacity>
                    </View>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    {isDeleting && <ActivityIndicator size="large" color="#FF0000" style={{ marginVertical: 20 }} />}

                    <TouchableOpacity
                        style={[styles.deleteButton, isDeleting && styles.disabledButton]}
                        onPress={handleDeleteAccount}
                        disabled={isDeleting}
                    >
                        <Text style={styles.deleteButtonText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    headerText: { fontSize: 20, fontWeight: '600', color: '#333', marginLeft: 12 },
    content: { padding: 20, paddingTop: 30 },
    instructions: { fontSize: 16, color: '#493628', marginBottom: 20, textAlign: 'center' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fafafa', marginBottom: 10 },
    input: { flex: 1, height: 48, fontSize: 14, color: '#333' },
    errorText: { color: '#FF0000', fontSize: 13, marginBottom: 8 },
    deleteButton: { backgroundColor: '#FF0000', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    disabledButton: { opacity: 0.6 },
});

export default DeleteAccountScreen;
