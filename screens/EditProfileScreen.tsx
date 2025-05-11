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
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const { width } = Dimensions.get("window");

const EditProfileScreen = () => {
    const [name, setName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [age, setAge] = useState("");
    const [userType, setUserType] = useState("");
    const [gender, setGender] = useState("");
    const [email, setEmail] = useState("");

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
                    const fullName = `${data.firstName} ${data.middleInitial || ""} ${data.lastName}`.trim();

                    setName(fullName);
                    setContactNumber(data.contactNumber || "");
                    setAge(data.age?.toString() || "");
                    setUserType(data.userType || "");
                    setGender(data.gender || "");
                    setEmail(data.email || "");
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (value: string) => {
        setter(value);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Edit Profile</Text>

                <FormInput label="Name" value={name} onChange={handleInputChange(setName)} placeholder="Full Name" />
                <FormInput label="Contact Number" value={contactNumber} onChange={handleInputChange(setContactNumber)} placeholder="Enter contact" />
                <FormInput label="Age" value={age} onChange={handleInputChange(setAge)} placeholder="Enter age" />

                <FormPicker label="User Type" value={userType} onValueChange={setUserType} items={[
                    { label: "Student", value: "student" },
                    { label: "Tourist", value: "tourist" },
                    { label: "Local", value: "local" },
                ]} />
                <FormPicker label="Gender" value={gender} onValueChange={setGender} items={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Other", value: "Other" },
                ]} />

                <FormInput label="Email" value={email} onChange={handleInputChange(setEmail)} placeholder="Email" />

                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const FormInput = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (text: string) => void, placeholder: string }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#A5A5A5"
            value={value}
            onChangeText={onChange}
            keyboardType={label === "Age" ? "numeric" : "default"}
        />
    </View>
);

const FormPicker = ({ label, value, onValueChange, items }: { label: string, value: string, onValueChange: (value: string) => void, items: { label: string, value: string }[] }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <RNPickerSelect
            onValueChange={onValueChange}
            value={value}
            items={items}
            style={{
                inputIOS: { ...styles.pickerInput, width: width - 40 },
                inputAndroid: { ...styles.pickerInput, width: width - 40 },
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
    formGroup: { marginBottom: 20 },
    label: { color: "#493628", fontSize: 16, marginBottom: 8 },
    input: {
        color: "#000000",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#603F26",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
    },
    pickerInput: {
        fontSize: 16,
        color: "#000000",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#603F26",
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
    },
    saveButton: {
        backgroundColor: "#D6C0B3",
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 30,
        marginHorizontal: 40,
        alignItems: "center",
    },
    saveButtonText: { color: "#493628", fontSize: 18, fontWeight: "bold" },
});

export default EditProfileScreen;
