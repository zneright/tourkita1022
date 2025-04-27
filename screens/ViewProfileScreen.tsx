import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TextInput,
    Image,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import TopHeader from '../components/TopHeader';
import BottomFooter from '../components/BottomFooter';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Maps">;

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function ViewProfileScreen() {

    const navigation = useNavigation<NavigationProp>();

    const userData = {
        name: "TourKita",
        age: "25",
        contact: "09123456789",
        email: "tourkita@gmail.com",
        gender: "Female",
        userType: "Tourist",
        avatar: "",
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.flexContainer}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TopHeader title="Profile" onSupportPress={() => navigation.navigate('Support')} />

                    <View style={styles.profileSection}>
                        <View style={styles.avatarPlaceholder}>
                            <Image
                                source={{ uri: userData.avatar || DEFAULT_AVATAR }}
                                style={styles.avatar}
                            />
                        </View>
                    </View>

                    <View style={styles.form}>
                        {[
                            { label: 'Name', value: userData.name },
                            { label: 'Age', value: userData.age },
                            { label: 'Contact Number', value: userData.contact },
                            { label: 'User Type', value: userData.userType },
                            { label: 'Gender', value: userData.gender },
                            { label: 'Email', value: userData.email },
                        ].map((item, idx) => (
                            <View key={idx} style={styles.inputGroup}>
                                <Text style={styles.label}>{item.label}</Text>
                                <TextInput
                                    value={item.value}
                                    editable={false}
                                    style={styles.input}
                                />
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

                <BottomFooter active="Profile" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    flexContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    form: {
        paddingHorizontal: 30,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        marginBottom: 4,
        fontSize: 14,
        color: '#493628',
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#493628',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#493628',
        backgroundColor: '#F5F5F5',
    },
    editButton: {
        backgroundColor: '#493628',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});