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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [name, setName] = useState<string>('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const cachedName = await AsyncStorage.getItem('cachedUserName');
                if (cachedName) {
                    setName(cachedName);
                }

                const auth = getAuth();
                const currentUser = auth.currentUser;

                if (currentUser) {
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

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });

        return () => backHandler.remove();
    }, []);

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
                        const auth = getAuth();
                        try {
                            await signOut(auth);
                            await AsyncStorage.removeItem('cachedUserName');
                            navigation.replace('Login');
                        } catch (error) {
                            console.error('Logout error: ', error);
                            Alert.alert('Error', 'An error occurred while logging out.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleDeleteAccount = () => {
        navigation.navigate('DeleteAccount');
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Profile" onSupportPress={() => navigation.navigate('Support')} />
            <View style={styles.profileSection}>
                <Text style={styles.username}>{name}</Text>
            </View>

            <View style={styles.menuContainer}>
                {[{
                    title: 'View Profile',
                    onPress: () => navigation.navigate('ViewProfile')
                }, {
                    title: 'Change Password',
                    onPress: () => navigation.navigate('ChangePassword')
                }, {
                    title: 'Terms',
                    onPress: () => navigation.navigate('Terms')
                }].map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.onPress}>
                        <Text style={styles.menuText}>{item.title}</Text>
                        <Feather name="chevron-right" size={20} color="#493628" />
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.menuItem]} onPress={handleDeleteAccount}>
                    <Text style={[styles.menuText, styles.dangerText]}>Delete Account</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem]} onPress={handleLogOut}>
                    <Text style={[styles.menuText, styles.dangerText]}>Log Out</Text>
                </TouchableOpacity>
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
        paddingTop: 10,
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    menuText: {
        fontSize: 16,
        color: '#493628',
    },
    dangerText: {
        color: 'red',
        fontWeight: '600',
    },
});
