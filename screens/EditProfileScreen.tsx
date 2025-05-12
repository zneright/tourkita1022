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
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import {
    getAuth,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (!currentUser) return;

                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setFormData({
                        firstName: data.firstName || "",
                        middleInitial: data.middleInitial || "",
                        lastName: data.lastName || "",
                        contactNumber: data.contactNumber || "",
                        age: data.age?.toString() || "",
                        userType: data.userType || "",
                        gender: data.gender || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prevState => ({ ...prevState, [field]: value }));
    };

    const promptPasswordAndSave = () => {
        setModalVisible(true);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
    };

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

    const saveChanges = async () => {
        const { firstName, lastName, contactNumber, age, userType, gender } = formData;

        if (!firstName || !lastName || !contactNumber || !age || !userType || !gender) {
            Alert.alert("Validation Error", "Please fill out all fields before saving.");
            return;
        }

        if (isNaN(Number(age))) {
            Alert.alert("Age Error", "Please enter a valid age.");
            return;
        }

        setLoading(true);
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                firstName,
                middleInitial: formData.middleInitial,
                lastName,
                contactNumber,
                age: parseInt(age),
                userType,
                gender,
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

                <FormInput label="First Name" value={formData.firstName} onChange={(value) => handleInputChange('firstName', value)} placeholder="Enter First Name" />
                <FormInput label="Middle Initial" value={formData.middleInitial} onChange={(value) => handleInputChange('middleInitial', value)} placeholder="M" />
                <FormInput label="Last Name" value={formData.lastName} onChange={(value) => handleInputChange('lastName', value)} placeholder="Enter Last Name" />
                <FormInput label="Contact Number" value={formData.contactNumber} onChange={(value) => handleInputChange('contactNumber', value)} placeholder="Enter Contact" />
                <FormInput label="Age" value={formData.age} onChange={(value) => handleInputChange('age', value)} placeholder="Enter Age" />

                <FormPicker
                    label="User Type"
                    value={formData.userType}
                    onValueChange={(value) => handleInputChange('userType', value)}
                    items={[
                        { label: "Student", value: "student" },
                        { label: "Tourist", value: "tourist" },
                        { label: "Local", value: "local" },
                    ]}
                />
                <FormPicker
                    label="Gender"
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    items={[
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" },
                        { label: "Other", value: "Other" },
                    ]}
                />

                <TouchableOpacity style={styles.saveButton} onPress={promptPasswordAndSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
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
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                reauthenticateAndSave();
                                setModalVisible(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={[styles.modalButtonText, { color: "#000" }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

type FormInputProps = {
    label: string;
    value: string;
    onChange: (text: string) => void;
    placeholder: string;
};

const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, placeholder }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#A5A5A5"
            value={value}
            onChangeText={onChange}
        />
    </View>
);

type FormPickerProps = {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    items: { label: string; value: string }[];
};

const FormPicker: React.FC<FormPickerProps> = ({ label, value, onValueChange, items }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <RNPickerSelect
            onValueChange={onValueChange}
            value={value}
            items={items}
            style={{
                inputIOS: styles.pickerInput,
                inputAndroid: styles.pickerInput,
            }}
            useNativeAndroidPickerStyle={false}
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5" },
    scrollContent: { paddingBottom: 100, paddingHorizontal: 20 },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#493628",
        textAlign: "center",
        marginVertical: 20,
    },
    formGroup: { marginBottom: 15 },
    label: { fontSize: 16, fontWeight: "600", color: "#493628", marginBottom: 5 },
    input: {
        height: 45,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        color: "#000",
    },
    pickerInput: {
        height: 45,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        color: "#000",
    },
    saveButton: {
        backgroundColor: "#493628",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    saveButtonText: { fontSize: 18, color: "#fff" },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: width - 40,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
    modalInput: {
        width: "100%",
        height: 45,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    modalButton: {
        width: "100%",
        backgroundColor: "#493628",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 10,
    },
    modalButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default EditProfileScreen;

