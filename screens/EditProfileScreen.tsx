import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    ScrollView,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import RNPickerSelect from "react-native-picker-select";
import TopHeader from "../components/TopHeader";
import BottomFooter from "../components/BottomFooter";

const EditProfileScreen = () => {
    const [name, setName] = useState("TourKita");
    const [contactNumber, setContactNumber] = useState("");
    const [age, setAge] = useState("");
    const [userType, setUserType] = useState("");
    const [gender, setGender] = useState("");
    const [email, setEmail] = useState("TourKita@gmail.com");
    const [imageUri, setImageUri] = useState("");

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
                    <TouchableOpacity style={styles.profileImageWrapper} onPress={handleImagePick}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profileImagePlaceholder} />
                        )}
                        <Image
                            source={{
                                uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/e1ud1466_expires_30_days.png",
                            }}
                            style={styles.cameraIcon}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.formGroup}><Label text="Name" /><Input placeholder="TourKita" value={name} onChangeText={setName} /></View>
                <View style={styles.formGroup}><Label text="Contact Number" /><Input placeholder="Enter contact" value={contactNumber} onChangeText={setContactNumber} /></View>
                <View style={styles.formGroup}><Label text="Age" /><Input placeholder="Enter age" value={age} onChangeText={setAge} /></View>

                <View style={styles.formGroup}>
                    <Label text="User Type" />
                    <View style={styles.pickerWrapper}>
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
                                inputIOS: styles.pickerInput,
                                inputAndroid: styles.pickerInput,
                            }}
                            useNativeAndroidPickerStyle={false}
                        />
                    </View>
                </View>

                <View style={styles.formGroup}><Label text="Gender" /><Input placeholder="Not Set" value={gender} onChangeText={setGender} /></View>
                <View style={styles.formGroup}><Label text="Email" /><Input placeholder="TourKita@gmail.com" value={email} onChangeText={setEmail} /></View>

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
    scroll: { paddingBottom: 40, paddingTop: 30 },
    profileImageContainer: { alignItems: "center", marginTop: 20, marginBottom: 10 },
    profileImageWrapper: {
        width: 100,
        height: 100,
        backgroundColor: "#CCCCCC",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    scrollContent: {
        paddingBottom: 100,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#CCCCCC",
    },
    cameraIcon: {
        width: 27,
        height: 27,
        position: "absolute",
        bottom: 5,
        right: 5,
    },
    formGroup: { marginHorizontal: 40, marginTop: 18 },
    label: { color: "#493628", fontSize: 13, marginBottom: 5 },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#603F26",
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 13,
        paddingVertical: 4,
    },
    input: {
        flex: 1,
        color: "#000000",
        fontSize: 15,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#603F26",
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    pickerInput: {
        fontSize: 15,
        color: "#000000",
    },
    saveButton: {
        backgroundColor: "#D6C0B3",
        borderRadius: 10,
        marginTop: 30,
        marginHorizontal: 80,
        paddingVertical: 14,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#493628",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default EditProfileScreen;
