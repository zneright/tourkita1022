import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import Button from './Button';
export default function GuestLockOverlay() {
    const navigation = useNavigation();

    const handleSignUp = async () => {
        try {
            const uid = auth.currentUser?.uid;
            if (uid) {
                await setDoc(doc(db, 'guests', uid), { activeStatus: false }, { merge: true });
            }
        } catch (error) {
            console.error('Error updating guest status:', error);
        } finally {
            navigation.navigate('SignUp');
        }
    };

    return (
        <BlurView intensity={90} tint="light" style={styles.blurOverlay}>
            <Button />
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Sign Up to Unlock Features</Text>
                <Text style={styles.modalText}>
                    Create an account to access our advanced features!
                </Text>
                <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                    <Text style={styles.signUpText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    blurOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 10, justifyContent: 'center', alignItems: 'center' },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 22,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8, textAlign: 'center' },
    modalText: { fontSize: 14, color: '#6B5E5E', marginBottom: 14, textAlign: 'center' },
    signUpButton: { backgroundColor: '#8B5E3C', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
    signUpText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
