import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    BackHandler,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation/types';
import TopHeader from '../components/TopHeader';
import BottomFooter from '../components/BottomFooter';
import { useUser } from '../context/UserContext';
import { BlurView } from 'expo-blur';
import { setActiveStatus } from '../components/helper';
import GuestLockOverlay from '../components/guestLockOverlay';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [name, setName] = useState<string>('');
    const [profileImage, setProfileImage] = useState<string>('');
    const { isGuest } = useUser();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const currentUser = auth.currentUser;
                if (!currentUser) return setLoading(false);
                if (currentUser) {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const middle = data.middleInitial ? `${data.middleInitial}.` : '';
                        setName(`${data.firstName} ${middle} ${data.lastName}`.trim());
                        setProfileImage(data.profileImage || '');
                    }
                }
            } catch (err) {
                console.error(err);
                setName('Error loading name');
            } finally {
                setLoading(false);
            }
        }   

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
                        if (auth.currentUser) {
                            await setActiveStatus(auth.currentUser.uid, false); // set offline
                        }
                        await signOut(getAuth());
                        await AsyncStorage.removeItem('cachedUserName');
                        navigation.replace('Login');
                    },
                },
            ]
        );
    };

    const renderProfileImage = () => {
        if (profileImage)
            return <Image source={{ uri: profileImage }} style={styles.profileImage} />;
        const initials = name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        return (
            <View style={styles.profilePlaceholder}>
                <Text style={styles.initials}>{initials}</Text>
            </View>
        );
    };

    const renderMenuItem = (label: string, onPress?: () => void, danger?: boolean) => (
        <TouchableOpacity
            key={label}
            style={[styles.menuItem, danger && styles.menuItemDanger]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.menuText, danger && styles.dangerText]}>{label}</Text>
            <Text style={styles.chevron}>{'>'}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Profile" onSupportPress={() => navigation.navigate('Support')} />
            {isGuest &&  <GuestLockOverlay/>}
            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 80 }]}>
                <View style={styles.profileContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#8B5E3C" />
                    ) : (
                        <>
                            {renderProfileImage()}
                            <Text style={styles.username}>{isGuest ? 'Guest User' : name}</Text>
                            <Text style={styles.userRole}>{isGuest ? 'Limited Access' : 'Registered User'}</Text>
                        </>
                    )}
                </View>

                {/* Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    {renderMenuItem('View Profile', () => navigation.navigate('ViewProfile'))}
                    {renderMenuItem('Change Password', () => navigation.navigate('ChangePassword'))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Policies</Text>
                    {renderMenuItem('Terms and Privacy', () => navigation.navigate('Terms'))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    {renderMenuItem('Delete Account', () => navigation.navigate('DeleteAccount'), true)}
                    {renderMenuItem('Log Out', handleLogOut, true)}
                </View>

                
            </ScrollView>
            <BottomFooter active="Profile" />
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    content: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30 },
    profileContainer: { alignItems: 'center', marginBottom: 40 },
    profileImage: { width: 110, height: 110, borderRadius: 55, marginBottom: 12 },
    profilePlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#8B5E3C',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    initials: { fontSize: 32, color: '#fff', fontWeight: '700' },
    username: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 2 },
    userRole: { fontSize: 13, color: '#8C8C8C' },
    section: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
    sectionTitle: { fontSize: 13, color: '#8C8C8C', padding: 10, backgroundColor: '#F5F5F5' },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    menuItemDanger: {},
    menuText: { fontSize: 15, color: '#333' },
    dangerText: { color: '#FF4D4D', fontWeight: '600' },
    chevron: { fontSize: 16, color: '#C0C0C0' },
    
});
