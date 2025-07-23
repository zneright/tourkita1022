import React from "react";
import {
    SafeAreaView,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TopHeader from "../components/TopHeader";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";
import BottomFooter from "../components/BottomFooter";

import { useUser } from "../context/UserContext";



type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Maps">;

const SupportScreen = () => {

    const { isGuest } = useUser();
    const SupportRow = ({
        label,
        subtitle,
        icon,
        onPress,
        disabled = false,
    }: {
        label: string;
        subtitle: string;
        icon: string;
        onPress: () => void;
        disabled?: boolean;
    }) => (
        <TouchableOpacity
            style={[styles.rowBox, disabled && { opacity: 0.5 }]}
            onPress={onPress}
            disabled={disabled}
        >
            <Icon name={icon} size={32} color="#4C372B" style={{ marginRight: 12 }} />
            <View>
                <Text style={styles.boxLabel}>{label}</Text>
                <Text style={styles.boxSubtitle}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    const navigation = useNavigation<NavigationProp>();
    const handlePress = (label: string) => {
        Alert.alert(`${label} pressed`);
    };

    return (

        <SafeAreaView style={styles.container}>
            <TopHeader title="Support" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.row}>
                    <SupportBox
                        label="Call Us"
                        subtitle="Talk to our Executive"
                        icon="phone"
                        onPress={() => handlePress("Call Us")}
                    />
                    <SupportBox
                        label="Message Us"
                        subtitle="Mail to our Executive"
                        icon="email"
                        onPress={() => handlePress("Message Us")}
                    />
                </View>

                <SupportRow
                    label="FAQs Questions"
                    subtitle="Discover App Information"
                    icon="help-circle-outline"
                    onPress={() => handlePress("FAQs Questions")}
                />
                {isGuest ? (
                    <SupportRow
                        label="Feedback (Locked)"
                        subtitle="Please log in to submit feedback"
                        icon="lock"
                        onPress={() =>
                            Alert.alert("Access Denied", "Please log in to use the Feedback feature.")
                        }
                        disabled={true}
                    />
                ) : (
                    <SupportRow
                        label="Feedback"
                        subtitle="Tell us what you think about our app"
                        icon="message-text-outline"
                        onPress={() => navigation.navigate("Feedback")}
                    />
                )}


            </ScrollView>
            <BottomFooter active="" />
        </SafeAreaView >
    );
};

const SupportBox = ({
    label,
    subtitle,
    icon,
    onPress,
}: {
    label: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
}) => (
    <TouchableOpacity style={styles.box} onPress={onPress}>
        <Icon name={icon} size={32} color="#4C372B" />
        <Text style={styles.boxLabel}>{label}</Text>
        <Text style={styles.boxSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
);

const SupportRow = ({
    label,
    subtitle,
    icon,
    onPress,
}: {
    label: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
}) => (
    <TouchableOpacity style={styles.rowBox} onPress={onPress}>
        <Icon name={icon} size={32} color="#4C372B" style={{ marginRight: 12 }} />
        <View>
            <Text style={styles.boxLabel}>{label}</Text>
            <Text style={styles.boxSubtitle}>{subtitle}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 20,
    },

    headerText: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "bold",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    box: {
        backgroundColor: "#E0DDDA",
        borderRadius: 12,
        width: "48%",
        alignItems: "center",
        paddingVertical: 20,
    },
    rowBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E0DDDA",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    boxLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#4C372B",
        marginTop: 8,
    },
    boxSubtitle: {
        fontSize: 11,
        color: "#6B5E5E",
        textAlign: "center",
        marginTop: 2,
    },
});

export default SupportScreen;