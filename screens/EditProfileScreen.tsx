import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import RNPickerSelect from "react-native-picker-select";
import TopHeader from "../components/TopHeader";
import BottomFooter from "../components/BottomFooter";
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the icon library

const { width } = Dimensions.get("window");

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // Set the default avatar URL

const EditProfileScreen = () => {
    const [name, setName] = useState("TourKita");
    const [contactNumber, setContactNumber] = useState("");
    const [age, setAge] = useState("");
    const [userType, setUserType] = useState("");
    const [gender, setGender] = useState("");
    const [email, setEmail] = useState("TourKita@gmail.com");
    const [imageUri, setImageUri] = useState(DEFAULT_AVATAR); // Use default avatar initially

    const handleImagePick = () => {
        launchImageLibrary({ mediaType: "photo" }, (response) => {
            if (response.assets && response.assets.length > 0) {
                setImageUri(response.assets[0].uri || "");
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Edit Profile" onSupportPress={() => { }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileImageContainer}>
                    <TouchableOpacity
                        style={styles.profileImageWrapper}
                        onPress={handleImagePick}
                    >
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profileImagePlaceholder} />
                        )}
                        <Icon
                            name="camera"
                            size={30}
                            color="#493628" // You can customize the color here
                            style={styles.cameraIcon}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                    <Label text="Name" />
                    <Input placeholder="TourKita" value={name} onChangeText={setName} />
                </View>
                <View style={styles.formGroup}>
                    <Label text="Contact Number" />
                    <Input
                        placeholder="Enter contact"
                        value={contactNumber}
                        onChangeText={setContactNumber}
                    />
                </View>
                <View style={styles.formGroup}>
                    <Label text="Age" />
                    <Input placeholder="Enter age" value={age} onChangeText={setAge} />
                </View>

                <View style={styles.formGroup}>
                    <Label text="User Type" />
                    <RNPickerSelect
                        onValueChange={(value) => setUserType(value)}
                        placeholder={{ label: "Select user type", value: "" }}
                        value={userType}
                        items={[
                            { label: "Student", value: "student" },
                            { label: "Tourist", value: "tourist" },
                            { label: "Local", value: "local" },
                        ]}
                        style={{
                            inputIOS: { ...styles.pickerInput, width: width - 80 }, // Adjust the width dynamically
                            inputAndroid: { ...styles.pickerInput, width: width - 80 }, // Adjust the width dynamically
                        }}
                        useNativeAndroidPickerStyle={false}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Label text="Gender" />
                    <RNPickerSelect
                        onValueChange={(value) => setGender(value)}
                        placeholder={{ label: "Select gender", value: "" }}
                        value={gender}
                        items={[
                            { label: "Male", value: "Male" },
                            { label: "Female", value: "Female" },
                            { label: "Other", value: "Other" },
                        ]}
                        style={{
                            inputIOS: { ...styles.pickerInput, width: width - 80 }, // Adjust the width dynamically
                            inputAndroid: { ...styles.pickerInput, width: width - 80 }, // Adjust the width dynamically
                        }}
                        useNativeAndroidPickerStyle={false}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Label text="Email" />
                    <Input placeholder="TourKita@gmail.com" value={email} onChangeText={setEmail} />
                </View>

                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </ScrollView>
            <BottomFooter active="Profile" />
        </SafeAreaView>
    );
};

const Label = ({ text }: { text: string }) => (
    <Text style={styles.label}>{text}</Text>
);

const Input = ({
    placeholder,
    value,
    onChangeText,
}: {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
}) => (
    <View style={styles.inputWrapper}>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#A5A5A5"
            value={value}
            onChangeText={onChangeText}
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    scrollContent: {
        paddingBottom: 100,
    },
    profileImageContainer: { alignItems: "center", marginTop: 20, marginBottom: 10 },
    profileImageWrapper: {
        width: 120,
        height: 120,
        backgroundColor: "#CCCCCC",
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#CCCCCC",
    },
    cameraIcon: {
        position: "absolute",
        bottom: 5,
        right: 5,
    },
    formGroup: { marginHorizontal: 40, marginTop: 25 },
    label: { color: "#493628", fontSize: 14, marginBottom: 10 },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#603F26",
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        color: "#000000",
        fontSize: 16,
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
    saveButtonText: {
        color: "#493628",
        fontSize: 17,
        fontWeight: "bold",
    },
});

export default EditProfileScreen;
