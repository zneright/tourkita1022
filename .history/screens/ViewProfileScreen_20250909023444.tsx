
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import TopHeader from '../components/TopHeader';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Maps'>;

export default function ViewProfileScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.goBack();
            return true;
        });

        return () => backHandler.remove();
    }, []);
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

    const getInitials = () => {
        const names = fullName.split(' ');
        let initials = names[0][0];
        if (names.length > 1) initials += names[names.length - 1][0];
        return initials.toUpperCase();
    };

    const profileFields = [
        { label: 'Full Name', value: fullName },
        { label: 'Age', value: userData.age?.toString() || '-' },
        { label: 'Contact Number', value: userData.contactNumber || '-' },
        { label: 'User Type', value: userData.userType || '-' },
        { label: 'Gender', value: userData.gender || '-' },
        { label: 'Email', value: userData.email || '-' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader
                title="Profile"
                onBackPress={() => navigation.navigate("Profile")}
                onSupportPress={() => navigation.navigate('Support')}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    {userData.profileImage ? (
                        <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.profilePlaceholder}>
                            <Text style={styles.initials}>{getInitials()}</Text>
                        </View>
                    )}
                    <Text style={styles.name}>{fullName}</Text>
                    {userData.bio ? <Text style={styles.bio}>{userData.bio}</Text> : null}
                </View>

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
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 30 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    profileHeader: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
    profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
    profilePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#493628',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    initials: { fontSize: 36, color: '#FFF', fontWeight: 'bold' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#493628', marginBottom: 4 },
    bio: { fontSize: 14, color: '#6B5E5E', textAlign: 'center', paddingHorizontal: 20 },
    profileSection: {
        backgroundColor: '#F9F7F4',
        borderRadius: 14,
        padding: 22,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    fieldCard: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E0DDD9', paddingBottom: 10 },
    fieldLabel: { fontSize: 14, color: '#6B5E5E', marginBottom: 4 },
    fieldValue: { fontSize: 16, color: '#493628', fontWeight: '600' },
    editButton: {
        backgroundColor: '#493628',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 24,
        alignItems: 'center',
    },
    editButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
