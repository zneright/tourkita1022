import React, { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { RootStackParamList } from '../Navigation/types';
import {
    SafeAreaView,
    View,
    ScrollView,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignUpScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [lastName, setLastName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [firstName, setFirstName] = useState("");
    const [gender, setGender] = useState("Male");
    const [userType, setUserType] = useState("Tourist");
    const [age, setAge] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = async () => {
        if (!isChecked) {
            Alert.alert("Please agree to the terms and privacy policy.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match.");
            return;
        }

        if (!age || isNaN(Number(age)) || Number(age) <= 0) {
            Alert.alert("Please enter a valid age.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Please enter a valid email address.");
            return;
        }

        const contactRegex = /^09\d{9}$/;
        if (!contactRegex.test(contactNumber)) {
            Alert.alert("Please enter a valid 11-digit PH contact number starting with 09.");
            return;
        }

        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Send email verification
            await sendEmailVerification(user);

            Alert.alert("Check your email for the verification link.");

            // Pass the user data to the EmailVerification screen
            navigation.navigate("EmailVerification", {
                userData: {
                    uid: user.uid,
                    firstName,
                    middleInitial,
                    lastName,
                    gender,
                    userType,
                    age: parseInt(age),
                    contactNumber,
                    email,
                },
            });
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formCard}>
                    <Image
                        source={{
                            uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/jd0mokk4_expires_30_days.png",
                        }}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <View style={styles.tabContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.inactiveTab}>Login</Text>
                        </TouchableOpacity>
                        <Text style={styles.activeTab}>Sign Up</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>M.I.(Optional)</Text>
                            <TextInput style={styles.input} value={middleInitial} onChangeText={setMiddleInitial} />
                        </View>
                    </View>

                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.pickerContainer}>
                                <Picker selectedValue={gender} onValueChange={setGender}>
                                    <Picker.Item label="Male" value="Male" />
                                    <Picker.Item label="Female" value="Female" />
                                    <Picker.Item label="Other" value="Other" />
                                </Picker>
                            </View>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>User Type</Text>
                            <View style={styles.pickerContainer}>
                                <Picker selectedValue={userType} onValueChange={setUserType}>
                                    <Picker.Item label="Tourist" value="Tourist" />
                                    <Picker.Item label="Student" value="Student" />
                                    <Picker.Item label="Local" value="Local" />
                                </Picker>
                            </View>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={age}
                                onChangeText={setAge}
                            />
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Contact Number</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="phone-pad"
                                value={contactNumber}
                                onChangeText={setContactNumber}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            value={isChecked}
                            onValueChange={setIsChecked}
                            color={isChecked ? "#603F26" : undefined}
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
                            <Text style={styles.termsText}> Term and privacy policy</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isSubmitting && { backgroundColor: "#A5A5A5" }]}
                        onPress={handleNext}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>{isSubmitting ? "Processing..." : "Next"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
    scrollContainer: { paddingVertical: 40, alignItems: "center" },
    formCard: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    logo: { width: 120, height: 120, alignSelf: "center", marginBottom: 10 },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
        gap: 20,
    },
    activeTab: {
        color: "#603F26",
        borderBottomWidth: 2,
        borderColor: "#603F26",
        fontWeight: "600",
        paddingBottom: 5,
    },
    inactiveTab: {
        color: "#A5A5A5",
        paddingBottom: 5,
    },
    label: {
        color: "#A5A5A5",
        fontSize: 13,
        marginBottom: 4,
        marginLeft: 6,
    },
    input: {
        backgroundColor: "#F5F5F5",
        height: 40,
        borderRadius: 5,
        paddingLeft: 10,
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    column: {
        width: "48%",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    termsText: {
        color: "#603F26",
        textDecorationLine: "underline",
    },
    button: {
        backgroundColor: "#603F26",
        borderRadius: 5,
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default SignUpScreen;
