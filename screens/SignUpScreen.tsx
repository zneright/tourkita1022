import React, { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { RootStackParamList } from '../Navigation/types';

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

    const handleNext = () => {
        if (!isChecked) {
            Alert.alert("Please agree to the terms and privacy policy.");
            return;
        }
        navigation.navigate("EmailVerification");
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
                            <Text style={styles.label}>M.I.</Text>
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
                        <Text style={styles.termsText}> Term and privacy policy</Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleNext}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignUpScreen;



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
        height: 40,
        backgroundColor: "#FFFFFF",
        borderColor: "#603F26",
        borderRadius: 15,
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#603F26",
        borderRadius: 15,
        marginBottom: 10,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    column: { flex: 1 },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    termsText: {
        marginLeft: 8,
        color: "#603F26",
    },
    button: {
        width: "100%",
        height: 40,
        backgroundColor: "#603F26",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
});
