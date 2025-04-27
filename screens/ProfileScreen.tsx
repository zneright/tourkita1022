import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../services/types';
import TopHeader from '../components/TopHeader';
import BottomFooter from '../components/BottomFooter';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function ProfileScreen() {

    const navigation = useNavigation<NavigationProp>();

    const profileImage = "";

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Profile" onSupportPress={() => navigation.navigate('Support')} />

            <View style={styles.profileSection}>
                <Image
                    source={{ uri: profileImage || DEFAULT_AVATAR }}
                    style={styles.avatar}
                />
                <Text style={styles.username}>TourKita</Text>
            </View>

            <View style={styles.menuContainer}>
                {[
                    { title: 'View Profile', onPress: () => navigation.navigate('ViewProfile') },
                    { title: 'Change Password', onPress: () => navigation.navigate('ChangePassword') },
                    { title: 'Terms', onPress: () => navigation.navigate('Terms') },
                ].map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.onPress}>
                        <Text style={styles.menuText}>{item.title}</Text>
                        <Feather name="chevron-right" size={20} color="#493628" />
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.menuItem, styles.dangerItem]} onPress={() => console.log('Delete Account')}>
                    <Text style={[styles.menuText, styles.dangerText]}>Delete Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuItem, styles.dangerItem]}
                    onPress={() => {
                        Alert.alert(
                            "Log Out",
                            "Are you sure you want to log out?",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Log Out",
                                    style: "destructive",
                                    onPress: () => navigation.replace('Login'),
                                }
                            ],
                            { cancelable: true }
                        );
                    }}
                >
                    <Text style={[styles.menuText, styles.dangerText]}>Log Out</Text>
                </TouchableOpacity>

            </View>

            <BottomFooter active="Profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#493628',
    },
    menuContainer: {
        paddingHorizontal: 30,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 12,
    },
    menuText: {
        fontSize: 16,
        color: '#493628',
    },
    dangerItem: {
        backgroundColor: '#D9D9D9',
    },
    dangerText: {
        color: 'red',
    },
});