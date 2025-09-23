import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    Alert,
    ActivityIndicator,
    Image,
    BackHandler,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import * as ImagePicker from "expo-image-picker";
import {
    getAuth,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { doc, getDocs, updateDoc, collection, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";

const { width } = Dimensions.get("window");
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CLOUDINARY_UPLOAD_PRESET = "profile";
const CLOUDINARY_CLOUD_NAME = "dupjdmjha";

const EditProfileScreen = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        middleInitial: "",
        lastName: "",
        contactNumber: "",
        age: "",
        userType: "",
        gender: "",
    });
    const [loading, setLoading] = useState(false);
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
                if (!currentUser) return;

                const q = query(collection(db, "users"), where("email", "==", currentUser.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    setUserRef(userDoc.ref);
                    const data = userDoc.data();
                    setFormData({
                        firstName: data.firstName || "",
                        middleInitial: data.middleInitial || "",
                        lastName: data.lastName || "",
                        contactNumber: data.contactNumber || "",
                        age: data.age?.toString() || "",
                        userType: data.userType || "",
                        gender: data.gender || "",
                    });
                    setProfileImage(data.profileImage || null);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.goBack();
            return true;
        });
        return () => backHandler.remove();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const promptPasswordAndSave = () => setModalVisible(true);

    const handlePasswordChange = (text: string) => setPassword(text);

    const reauthenticateAndSave = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser?.email) {
            const credential = EmailAuthProvider.credential(currentUser.email, password);

            try {
                await reauthenticateWithCredential(currentUser, credential);
                Alert.alert("Confirm Changes", "Are you sure you want to save changes?", [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: saveChanges },
                ]);
            } catch (error) {
                Alert.alert("Authentication Failed", "Incorrect password.");
            }
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) return alert("Permission to access gallery is required!");

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            console.log("Picked image URI:", uri);
            setProfileImage(uri);
        }
    };

    const uploadToCloudinary = async (uri: string) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", {
                uri,
                type: "image/jpeg",
                name: "profile.jpg",
            } as any);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );

            const data = await response.json();
            console.log("Cloudinary response:", data);
            setUploading(false);
            return data.secure_url;
        } catch (error) {
            setUploading(false);
            console.error("Cloudinary upload failed:", error);
            Alert.alert("Upload Error", "Failed to upload image.");
            return null;
        }
    };

    const saveChanges = async () => {
        const { firstName, lastName, contactNumber, age, userType, gender, middleInitial } = formData;

        if (!firstName || !lastName || !contactNumber || !age || !userType || !gender) {
            Alert.alert("Validation Error", "Please fill out all fields before saving.");
            return;
        }

        if (isNaN(Number(age))) {
            Alert.alert("Age Error", "Please enter a valid age.");
            return;
        }

        if (!userRef) {
            Alert.alert("Error", "User reference not found.");
            return;
        }

        setLoading(true);
        try {
            let profileImageUrl = profileImage;

            if (profileImage && !profileImage.startsWith("https://")) {
                const uploadedUrl = await uploadToCloudinary(profileImage);
                if (uploadedUrl) profileImageUrl = uploadedUrl;
                else {
                    setLoading(false);
                    return;
                }
            }

            await updateDoc(userRef, {
                firstName,
                middleInitial,
                lastName,
                contactNumber,
                age: parseInt(age),
                userType,
                gender,
                profileImage: profileImageUrl,
            });

            Alert.alert("Success", "Profile updated successfully.");
            navigation.navigate("ViewProfile");
        } catch (error) {
            console.error("Failed to save changes:", error);
            Alert.alert("Error", "Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Edit Profile</Text>

                <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                        <Text style={styles.profileImagePlaceholder}>Upload Profile Photo</Text>
                    )}
                </TouchableOpacity>
                {uploading && <ActivityIndicator size="small" color="#493628" />}

                <FormInput label="First Name" value={formData.firstName} onChange={(v) => handleInputChange("firstName", v)} placeholder="Enter First Name" />
                <FormInput label="Middle Initial" value={formData.middleInitial} onChange={(v) => handleInputChange("middleInitial", v)} placeholder="M" />
                <FormInput label="Last Name" value={formData.lastName} onChange={(v) => handleInputChange("lastName", v)} placeholder="Enter Last Name" />
                <FormInput label="Contact Number" value={formData.contactNumber} onChange={(v) => handleInputChange("contactNumber", v)} placeholder="Enter Contact" />
                <FormInput label="Age" value={formData.age} onChange={(v) => handleInputChange("age", v)} placeholder="Enter Age" />

                <FormPicker
                    label="User Type"
                    value={formData.userType}
                    onValueChange={(v) => handleInputChange("userType", v)}
                    items={[
                        { label: "Student", value: "Student" },
                        { label: "Tourist", value: "Tourist" },
                        { label: "Local", value: "Local" },
                        { label: "Researcher", value: "Researcher" },

                    ]}
                />
                <FormPicker
                    label="Gender"
                    value={formData.gender}
                    onValueChange={(v) => handleInputChange("gender", v)}
                    items={[
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" },
                        { label: "Non-Binary", value: "Non-bBinary" },
                        { label: "Prefer Not to Say", value: "prefer not to say" },
                    ]}
                />

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={promptPasswordAndSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Password Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Password</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={handlePasswordChange}
                            secureTextEntry
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={() => { reauthenticateAndSave(); setModalVisible(false); }}>
                            <Text style={styles.modalButtonText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#ccc" }]} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.modalButtonText, { color: "#000" }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

type FormInputProps = { label: string; value: string; onChange: (text: string) => void; placeholder: string };
const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, placeholder }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#A5A5A5" value={value} onChangeText={onChange} />
    </View>
);

type FormPickerProps = { label: string; value: string; onValueChange: (value: string) => void; items: { label: string; value: string }[] };
const FormPicker: React.FC<FormPickerProps> = ({ label, value, onValueChange, items }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <RNPickerSelect onValueChange={onValueChange} value={value} items={items} style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput }} useNativeAndroidPickerStyle={false} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5" },
    scrollContent: { paddingBottom: 100, paddingHorizontal: 20 },
    title: { fontSize: 24, fontWeight: "bold", color: "#493628", textAlign: "center", marginVertical: 20 },
    formGroup: { marginBottom: 15 },
    label: { fontSize: 16, fontWeight: "600", color: "#493628", marginBottom: 5 },
    input: { height: 45, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 10, backgroundColor: "#fff", color: "#000" },
    pickerInput: { height: 45, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 10, backgroundColor: "#fff", color: "#000" },
    saveButton: { backgroundColor: "#493628", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 20 },
    saveButtonText: { fontSize: 18, color: "#fff" },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
    modalContent: { width: width - 40, backgroundColor: "#fff", borderRadius: 10, padding: 20, alignItems: "center" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
    modalInput: { width: "100%", height: 45, borderColor: "#ccc", borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, marginBottom: 15 },
    modalButton: { width: "100%", backgroundColor: "#493628", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginBottom: 10 },
    modalButtonText: { color: "#fff", fontWeight: "bold" },
    profileImageContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#E0E0E0", justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 20 },
    profileImage: { width: 120, height: 120, borderRadius: 60 },
    profileImagePlaceholder: { color: "#888", textAlign: "center" },
});

export default EditProfileScreen;
