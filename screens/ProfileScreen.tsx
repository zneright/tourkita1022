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
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
    const [isLoadingName, setIsLoadingName] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoadingName(true);
            try {
                const currentUser = auth.currentUser;
                console.log('Current user:', currentUser);

                if (!currentUser) {
                    setIsLoadingName(false);
                    return;
                }

                const q = query(collection(db, 'users'), where('email', '==', currentUser.email));
                const querySnapshot = await getDocs(q);
                console.log('Query snapshot empty?', querySnapshot.empty);

                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data();
                    console.log('User doc data:', docData);
                    const middle = docData.middleInitial ? `${docData.middleInitial}.` : '';
                    const fullName = `${docData.firstName} ${middle} ${docData.lastName}`.replace(/\s+/g, ' ').trim();
                    setName(fullName);
                } else {
                    setName('No user data found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setName('Error loading name');
            } finally {
                setIsLoadingName(false);
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
                        } catch {
                            Alert.alert('Error', 'An error occurred while logging out.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    // Render menu item
    const renderMenuItem = (label: string, onPress?: () => void, danger?: boolean) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} key={label}>
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

            <View style={styles.contentWrapper}>
                <View style={styles.profileSection}>
                    {isLoadingName ? (
                        <Text>Loading Username...</Text>
                    ) : (
                        <>
                            <Text style={styles.username}>{isGuest ? 'Guest User' : name || 'No name available'}</Text>
                            <Text style={{ color: 'gray', marginTop: 10 }}>
                            </Text>
                        </>
                    )}
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Terms')}>
                        <Text style={styles.menuText}>Terms and Privacy</Text>
                        <Feather name="chevron-right" size={20} color="#493628" />
                    </TouchableOpacity>

                    {renderMenuItem('View Profile', () => navigation.navigate('ViewProfile'))}
                    {renderMenuItem('Change Password', () => navigation.navigate('ChangePassword'))}
                    {renderMenuItem('Delete Account', () => navigation.navigate('DeleteAccount'))}
                    {renderMenuItem('Log Out', handleLogOut, true)}
                </View>

                {/* Blur + modal overlay only if guest */}
                {isGuest && (
                    <>
                        <BlurView intensity={90} tint="light" style={styles.blurOverlay} />
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Sign Up to Unlock Features</Text>
                            <Text style={styles.modalText}>
                                Create an account to view your profile, change your password, and more!
                            </Text>
                            <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.signUpText}>Sign Up</Text>
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
        paddingHorizontal: 20,
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
        paddingHorizontal: 10,
        borderRadius: 14,
    },
    menuText: {
        fontSize: 16,
        color: '#493628',
    },
    dangerText: {
        color: 'red',
        fontWeight: '600',
    },
    contentWrapper: {
        flex: 1,
        position: 'relative',
        paddingHorizontal: 24,
        paddingTop: 20,
        marginBottom: 0,
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        borderRadius: 12,
        marginBottom: 70,
    },
    modalContainer: {
        position: 'absolute',
        top: '40%',
        left: 30,
        right: 30,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        zIndex: 11,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
});
