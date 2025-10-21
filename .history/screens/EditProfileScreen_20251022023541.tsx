import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    ActivityIndicator,
    Image,
    BackHandler,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDocs, updateDoc, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import TopHeader from '../components/TopHeader';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CLOUDINARY_UPLOAD_PRESET = "profile";
const CLOUDINARY_CLOUD_NAME = "dupjdmjha";

export default function EditProfileScreen() {
    const [formData, setFormData] = useState({
        firstName: "", middleInitial: "", lastName: "",
        contactNumber: "", age: "", userType: "", gender: "",
    });
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [password, setPassword] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [userRef, setUserRef] = useState<any>(null);

    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (!currentUser?.email) return;

                const q = query(collection(db, "users"), where("email", "==", currentUser.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    setUserRef(userDoc.ref);
                    const data = userDoc.data();
                    setFormData({
                        firstName: data.firstName || "", middleInitial: data.middleInitial || "",
                        lastName: data.lastName || "", contactNumber: data.contactNumber || "",
                        age: data.age?.toString() || "", userType: data.userType || "", gender: data.gender || "",
                    });
                    setProfileImage(data.profileImage || null);
                }
            } catch (error) { console.error("Failed to fetch user data:", error); }
            finally { setLoading(false); }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.goBack();
            return true;
        });
        return () => backHandler.remove();
    }, [navigation]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to make this work!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // ... (Your existing functions for saveChanges, reauthenticateAndSave, uploadToCloudinary remain the same)

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <TopHeader title="Edit Profile" showBackButton />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#6D4C41" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Edit Profile" onBackPress={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profileImage || 'https://via.placeholder.com/100' }}
                            style={styles.profileImage}
                        />
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                        </View>
                        {uploading && <ActivityIndicator style={styles.uploadIndicator} size="large" color="#FFFFFF" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.formCard}>
                    <FormInput icon="person-outline" label="First Name" value={formData.firstName} onChange={(v) => handleInputChange("firstName", v)} />
                    <FormInput icon="person-outline" label="Middle Initial" value={formData.middleInitial} onChange={(v) => handleInputChange("middleInitial", v)} maxLength={2} />
                    <FormInput icon="person-outline" label="Last Name" value={formData.lastName} onChange={(v) => handleInputChange("lastName", v)} />
                    <FormInput icon="call-outline" label="Contact Number" value={formData.contactNumber} onChange={(v) => handleInputChange("contactNumber", v)} keyboardType="phone-pad" />
                    <FormInput icon="calendar-outline" label="Age" value={formData.age} onChange={(v) => handleInputChange("age", v)} keyboardType="numeric" />
                    <FormPicker
                        icon="briefcase-outline"
                        label="User Type"
                        value={formData.userType}
                        onValueChange={(v) => handleInputChange("userType", v)}
                        items={[
                            { label: "Student", value: "Student" }, { label: "Tourist", value: "Tourist" },
                            { label: "Local", value: "Local" }, { label: "Foreign National", value: "Foreign National" },
                            { label: "Researcher", value: "Researcher" },
                        ]}
                    />
                    <FormPicker
                        icon="male-female-outline"
                        label="Gender"
                        value={formData.gender}
                        onValueChange={(v) => handleInputChange("gender", v)}
                        items={[
                            { label: "Male", value: "Male" }, { label: "Female", value: "Female" },
                            { label: "Non-Binary", value: "Non-Binary" }, { label: "Prefer Not to Say", value: "Prefer Not to Say" },
                        ]}
                    />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={() => setModalVisible(true)} disabled={loading}>
                    <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>

            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Your Identity</Text>
                        <Text style={styles.modalSubtitle}>Please enter your password to save changes.</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your password"
                            placeholderTextColor="#A1887F"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={() => { /* reauthenticateAndSave(); */ setModalVisible(false); }}>
                            <Text style={styles.modalButtonText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const FormInput = ({ icon, label, value, onChange, ...props }) => (
    <View style={styles.formGroup}>
        <Ionicons name={icon} size={22} color="#A1887F" style={styles.inputIcon} />
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput style={styles.input} placeholderTextColor="#A5A5A5" value={value} onChangeText={onChange} {...props} />
        </View>
    </View>
);

const FormPicker = ({ icon, label, value, onValueChange, items }) => (
    <View style={styles.formGroup}>
        <Ionicons name={icon} size={22} color="#A1887F" style={styles.inputIcon} />
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <RNPickerSelect
                onValueChange={onValueChange}
                value={value}
                items={items}
                style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIconContainer }}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Ionicons name="chevron-down" size={20} color="#8D6E63" />}
            />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F4EF" },
    scrollContent: { padding: 16, paddingBottom: 100 },
    avatarSection: { alignItems: 'center', marginVertical: 20 },
    avatarContainer: { position: 'relative' },
    profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#FFFFFF' },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#6D4C41',
        padding: 8, borderRadius: 20,
        borderWidth: 2, borderColor: '#FFFFFF',
    },
    uploadIndicator: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    formGroup: { flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingVertical: 12 },
    inputIcon: { marginRight: 16, marginTop: 18 },
    inputContainer: { flex: 1 },
    label: { fontSize: 13, color: '#A1887F', marginBottom: 4 },
    input: { height: 30, fontSize: 16, color: '#4E342E', paddingVertical: 0 },
    pickerInput: { height: 30, fontSize: 16, color: '#4E342E', paddingVertical: 0 },
    pickerIconContainer: { top: '50%', transform: [{ translateY: -10 }], right: 0 },
    saveButton: { flexDirection: 'row', backgroundColor: '#493628', paddingVertical: 14, borderRadius: 12, marginTop: 24, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.6)" },
    modalContent: { width: '90%', backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, alignItems: "center" },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: '#4E342E', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: '#A1887F', textAlign: 'center', marginBottom: 20 },
    modalInput: { width: "100%", height: 50, backgroundColor: '#F9F4EF', borderColor: "#EFEBE9", borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
    modalButton: { width: "100%", backgroundColor: "#493628", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginBottom: 10 },
    modalButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    modalCancelButton: { width: "100%", paddingVertical: 12, alignItems: "center" },
    modalCancelText: { color: "#8D6E63", fontWeight: "600", fontSize: 14 },
});
