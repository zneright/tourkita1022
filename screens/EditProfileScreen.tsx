import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import RNPickerSelect from "react-native-picker-select";
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get("window");
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const EditProfileScreen = () => {
    const [name, setName] = useState("TourKita");
    const [contactNumber, setContactNumber] = useState("");
    const [age, setAge] = useState("");
    const [userType, setUserType] = useState("");
    const [gender, setGender] = useState("");
    const [email, setEmail] = useState("TourKita@gmail.com");
    const [imageUri, setImageUri] = useState(DEFAULT_AVATAR);

    const handleImagePick = () => {
        launchImageLibrary({ mediaType: "photo" }, (response) => {
            if (response.assets && response.assets.length > 0) {
                setImageUri(response.assets[0].uri || "");
            }
        });
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (value: string) => {
        setter(value);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.profileImageWrapper} onPress={handleImagePick}>
                    <Image source={{ uri: imageUri }} style={styles.profileImage} />
                    <Icon name="camera" size={30} color="#493628" style={styles.cameraIcon} />
                </TouchableOpacity>

                <FormInput label="Name" value={name} onChange={handleInputChange(setName)} placeholder="TourKita" />
                <FormInput label="Contact Number" value={contactNumber} onChange={handleInputChange(setContactNumber)} placeholder="Enter contact" />
                <FormInput label="Age" value={age} onChange={handleInputChange(setAge)} placeholder="Enter age" />

                <FormPicker label="User Type" value={userType} onValueChange={setUserType} items={[
                    { label: "Student", value: "student" },
                    { label: "Tourist", value: "tourist" },
                ]} />
                <FormPicker label="Gender" value={gender} onValueChange={setGender} items={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Other", value: "Other" },
                ]} />

                <FormInput label="Email" value={email} onChange={handleInputChange(setEmail)} placeholder="TourKita@gmail.com" />

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
        />
    </View>
);

// Form picker component for reusable picker input
const FormPicker = ({ label, value, onValueChange, items }: { label: string, value: string, onValueChange: (value: string) => void, items: { label: string, value: string }[] }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <RNPickerSelect
            onValueChange={onValueChange}
            value={value}
            items={items}
            style={{
                inputIOS: { ...styles.pickerInput, width: width - 80 },
                inputAndroid: { ...styles.pickerInput, width: width - 80 },
            }}
            useNativeAndroidPickerStyle={false}
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    scrollContent: { paddingBottom: 100 },
    profileImageWrapper: {
        width: 120,
        height: 120,
        backgroundColor: "#CCCCCC",
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    profileImage: { width: 120, height: 120, borderRadius: 60 },
    cameraIcon: { position: "absolute", bottom: 5, right: 5 },
    formGroup: { marginHorizontal: 40, marginTop: 25 },
    label: { color: "#493628", fontSize: 14, marginBottom: 10 },
    input: {
        flex: 1,
        color: "#000000",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#603F26",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#FFFFFF",
    },
    pickerInput: {
        fontSize: 16,
        color: "#000000",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#603F26",
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
    },
    saveButton: {
        backgroundColor: "#D6C0B3",
        borderRadius: 12,
        marginTop: 30,
        marginHorizontal: 90,
        paddingVertical: 16,
        alignItems: "center",
    },
    saveButtonText: { color: "#493628", fontSize: 17, fontWeight: "bold" },
});

export default EditProfileScreen;
