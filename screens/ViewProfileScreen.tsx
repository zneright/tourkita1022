import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopHeader from '../components/TopHeader';
import BottomFooter from '../components/BottomFooter';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation/types';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Maps'>;

export default function ViewProfileScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {

        const fetchUserData = async () => {
            try {
                const cached = await AsyncStorage.getItem('cachedUserData');
                if (cached) {
                    setUserData(JSON.parse(cached));
                    setLoading(false);
                }

                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (!currentUser) return;

                const q = query(collection(db, 'users'), where('email', '==', currentUser.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const data = querySnapshot.docs[0].data();
                    setUserData(data);
                    await AsyncStorage.setItem('cachedUserData', JSON.stringify(data));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();

        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#493628" style={styles.centered} />
            </SafeAreaView>
        );
    }

    if (!userData) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.centered}>No user data found.</Text>
            </SafeAreaView>
        );
    }

    const fullName = `${userData.firstName} ${userData.middleInitial || ''} ${userData.lastName}`.trim();

    const profileFields = [
        { label: 'Name', value: fullName },
        { label: 'Age', value: userData.age.toString() },
        { label: 'Contact Number', value: userData.contactNumber },
        { label: 'User Type', value: userData.userType },
        { label: 'Gender', value: userData.gender },
        { label: 'Email', value: userData.email },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader
                title="Profile"
                onBackPress={() => navigation.goBack()}
                onSupportPress={() => navigation.navigate('Support')}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    {profileFields.map((item, idx) => (
                        <View key={idx} style={styles.fieldCard}>
                            <Text style={styles.fieldLabel}>{item.label}</Text>
                            <Text style={styles.fieldValue}>{item.value}</Text>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingVertical: 30,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileSection: {
        backgroundColor: '#F9F7F4',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
    },
    fieldCard: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0DDD9',
        paddingBottom: 10,
    },
    fieldLabel: {
        fontSize: 14,
        color: '#6B5E5E',
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: 16,
        color: '#493628',
        fontWeight: '600',
    },
    editButton: {
        backgroundColor: '#493628',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 24,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
