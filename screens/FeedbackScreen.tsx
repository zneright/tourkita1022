import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TopHeader from "../components/TopHeader";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { auth, db } from "../firebase";
import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
} from "firebase/firestore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Feedback">;

const FeedbackScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const [email, setEmail] = useState("Tourkita@gmail.com");
    const [feedbackType, setFeedbackType] = useState("");
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [rating, setRating] = useState(4);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [selectedFeature, setSelectedFeature] = useState("");


    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser?.email) {
            setEmail(currentUser.email);
        }
    }, []);

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, i) => (
            <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
                <Icon
                    name={i < rating ? "star" : "star-outline"}
                    size={28}
                    color="#E4B343"
                />
            </TouchableOpacity>
        ));
    };

    const fetchLocationSuggestions = async (text: string) => {
        if (text.trim().length === 0) {
            setLocationSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const snapshot = await getDocs(collection(db, "markers"));
            const suggestions = snapshot.docs
                .map(doc => doc.data().name)
                .filter(name =>
                    name.toLowerCase().includes(text.toLowerCase())
                )
                .slice(0, 5); // Limit suggestions to 5

            setLocationSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
        }
    };

    const handleSubmit = async () => {
        if (!feedbackType) {
            Alert.alert("Feedback Type is required");
            return;
        }

        if (feedbackType === "App Feedback" && !selectedFeature) {
            Alert.alert("Please select an app feature.");
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "feedbacks"), {
                email,
                feedbackType,
                location: showLocationDropdown ? selectedLocation : "",
                rating,
                comment,
                feature: feedbackType === "App Feedback" ? selectedFeature : "",
                createdAt: serverTimestamp(),
            });

            Alert.alert("Success", "Your feedback has been submitted.");
            navigation.goBack();
        } catch (error) {
            console.error("Error saving feedback:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Feedback" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.label}>Tell us about our app or a location...</Text>
                <View style={styles.inputContainer}>
                    <Icon name="account" size={20} color="#4C372B" style={{ marginRight: 8 }} />
                    <TextInput
                        value={email}
                        style={styles.input}
                        editable={false}
                    />
                </View>

                <Text style={styles.label}>Feedback Type</Text>
                <View style={styles.dropdownContainer}>
                    <Picker
                        selectedValue={feedbackType}
                        onValueChange={(itemValue) => {
                            setFeedbackType(itemValue);
                            setShowLocationDropdown(itemValue === "Location Feedback");
                        }}
                        style={styles.dropdown}
                    >
                        <Picker.Item label="Select Feedback Type" value="" />
                        <Picker.Item label="App Feedback" value="App Feedback" />
                        <Picker.Item label="Location Feedback" value="Location Feedback" />
                    </Picker>
                </View>
                {feedbackType === "App Feedback" && (
                    <>
                        <Text style={styles.label}>Select App Feature</Text>
                        <View style={styles.dropdownContainer}>
                            <Picker
                                selectedValue={selectedFeature}
                                onValueChange={(itemValue) => setSelectedFeature(itemValue)}
                                style={styles.dropdown}
                            >
                                <Picker.Item label="Select Feature" value="" />
                                <Picker.Item label="Login" value="Login" />
                                <Picker.Item label="AR Map" value="AR Map" />
                                <Picker.Item label="Notifications" value="Notifications" />
                                <Picker.Item label="Navigation" value="Navigation" />
                                <Picker.Item label="Search" value="Search" />
                                <Picker.Item label="Others" value="Others" />
                            </Picker>
                        </View>
                    </>
                )}

                {showLocationDropdown && (
                    <>
                        <Text style={styles.label}>Enter Location</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="map-marker" size={20} color="#4C372B" style={{ marginRight: 8 }} />
                            <TextInput
                                placeholder="Enter location name..."
                                value={selectedLocation}
                                onChangeText={(text) => {
                                    setSelectedLocation(text);
                                    fetchLocationSuggestions(text);
                                }}
                                style={styles.input}
                            />
                        </View>
                        {showSuggestions && locationSuggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setSelectedLocation(suggestion);
                                    setShowSuggestions(false);
                                }}
                                style={{
                                    padding: 10,
                                    backgroundColor: "#F4ECE6",
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#ccc",
                                }}
                            >
                                <Text style={{ color: "#4C372B" }}>{suggestion}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <Text style={styles.label}>Rate your experience</Text>
                <View style={styles.starsRow}>{renderStars()}</View>

                <TextInput
                    style={[styles.input, styles.commentBox]}
                    placeholder="Add your comments..."
                    multiline
                    numberOfLines={4}
                    value={comment}
                    onChangeText={setComment}
                />

                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSubmitting}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>SUBMIT</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        color: "#4C372B",
        marginBottom: 6,
        marginTop: 12,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#4C372B",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#4C372B",
    },
    commentBox: {
        height: 100,
        textAlignVertical: "top",
        marginTop: 10,
        borderColor: "#4C372B",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: "#4C372B",
        borderRadius: 8,
        overflow: "hidden",
    },
    dropdown: {
        height: 50,
        color: "#4C372B",
    },
    starsRow: {
        flexDirection: "row",
        marginVertical: 10,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    cancelButton: {
        fontSize: 14,
        color: "#4C372B",
    },
    submitButton: {
        backgroundColor: "#4C372B",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    submitText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});
