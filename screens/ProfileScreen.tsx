import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation/types';
import TopHeader from '../components/TopHeader';
import BottomFooter from '../components/BottomFooter';
import { useUser } from '../context/UserContext';
import { BlurView } from 'expo-blur';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [name, setName] = useState<string>('');
    const { isGuest } = useUser();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const cachedName = await AsyncStorage.getItem('cachedUserName');
                if (cachedName) setName(cachedName);

                const auth = getAuth();
                const currentUser = auth.currentUser;

                if (currentUser && !isGuest) {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        const fullName = `${data.firstName} ${data.middleInitial || ''} ${data.lastName}`.trim();
                        setName(fullName);
                        await AsyncStorage.setItem('cachedUserName', fullName);
                    }
                }
            } catch (error) {
                console.error('Error loading name:', error);
            }
        };

        fetchUserData();
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, [isGuest]);

    const handleLogOut = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut(getAuth());
                            await AsyncStorage.removeItem('cachedUserName');
                            navigation.replace('Login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'An error occurred while logging out.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderMenuItem = (label: string, onPress?: () => void, danger?: boolean) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            disabled={isGuest}
        >
            <Text style={[styles.menuText, danger && styles.dangerText]}>{label}</Text>
            <Feather
                name={danger ? 'log-out' : 'chevron-right'}
                size={20}
                color={danger ? '#ef4444' : '#493628'}
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Profile" onSupportPress={() => navigation.navigate('Support')} />

            <View style={styles.profileSection}>
                <Text style={styles.username}>{isGuest ? 'Guest User' : name}</Text>
            </View>

            <View style={styles.menuContainer}>
                {renderMenuItem('View Profile', () => navigation.navigate('ViewProfile'))}
                {renderMenuItem('Terms and Privacy', () => navigation.navigate('Terms'))}
                {renderMenuItem('Change Password', () => navigation.navigate('ChangePassword'))}
                {renderMenuItem('Delete Account', () => navigation.navigate('DeleteAccount'))}
                {renderMenuItem('Log Out', handleLogOut, true)}

                {isGuest && (
                    <>
                        <BlurView
                            intensity={90}
                            tint="light"
                            style={StyleSheet.absoluteFill}
                            pointerEvents="none"
                        />
                        <View style={styles.overlayContent} pointerEvents="auto">
                            <Text style={styles.modalTitle}>Sign Up to Unlock Features</Text>
                            <Text style={styles.modalText}>
                                Create an account to view your profile, change your password, and more!
                            </Text>
                            <TouchableOpacity
                                style={styles.signUpButton}
                                onPress={() => navigation.navigate('SignUp')}
                            >
                                <Text style={styles.signUpText}>Sign Up</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.logOutButton, { marginTop: 10 }]}
                                onPress={handleLogOut}
                            >
                                <Text style={styles.logOutText}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            <BottomFooter active="Profile" />
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    username: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#493628',
    },
    menuContainer: {
        paddingHorizontal: 24,
        gap: 12,
        position: 'relative',
        justifyContent: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
    },
    menuText: {
        fontSize: 16,
        color: '#493628',
    },
    dangerText: {
        color: 'red',
        fontWeight: '600',
    },
    overlayContent: {
        position: 'absolute',
        top: '40%',
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#493628',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 14,
        color: '#6B5E5E',
        marginBottom: 12,
        textAlign: 'center',
    },
    signUpButton: {
        backgroundColor: '#4C372B',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    signUpText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logOutButton: {
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    logOutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
