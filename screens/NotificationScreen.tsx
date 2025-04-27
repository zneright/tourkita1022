import React, { useState } from "react";
import { SafeAreaView, View, ScrollView, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";
import TopHeader from "../components/TopHeader";
import BottomFooter from "../components/BottomFooter";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing MaterialIcons

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Notification">;

// Notifications focused on Intramuros
const notifications = [
    {
        id: 1,
        message: "Intramuros' famous Manila Cathedral will be closed for maintenance from May 1st to May 7th.",
        icon: "church",
        details: "Please plan your visit accordingly. The cathedral will be under maintenance during this time.",
        datePosted: new Date("2025-04-25T10:00:00Z"),
    },
    {
        id: 2,
        message: "The Manila Ocean Park, located near Intramuros, is holding a special weekend event for families.",
        icon: "aquarium",
        details: "Join us for interactive exhibits, live animal shows, and family-friendly activities this weekend!",
        datePosted: new Date("2025-04-24T08:00:00Z"),
    },
    {
        id: 3,
        message: "New walking tours are available in Intramuros, exploring hidden gems and local history.",
        icon: "explore",
        details: "Join a guided walking tour to discover the rich history of Intramuros. Tours available daily.",
        datePosted: new Date("2025-04-23T14:00:00Z"),
    },
    {
        id: 4,
        message: "The Intramuros Golf Course is offering a special discount for early bookings this month.",
        icon: "golf-course",
        details: "Take advantage of a 15% discount on all early bookings. Offer valid until April 30th.",
        datePosted: new Date("2025-04-22T09:00:00Z"),
    },
    {
        id: 5,
        message: "New cafes have opened near Intramuros for a cozy experience while exploring the historical district.",
        icon: "coffee",
        details: "Relax and enjoy a cup of coffee at these newly opened cafes near Intramuros. Great places to unwind after a tour!",
        datePosted: new Date("2025-04-21T16:30:00Z"),
    },
    {
        id: 6,
        message: "Intramuros is celebrating National Heritage Month with special events throughout May.",
        icon: "event",
        details: "Join us in celebrating the rich cultural history of Intramuros with exhibitions, performances, and educational events.",
        datePosted: new Date("2025-04-20T11:00:00Z"),
    },
    {
        id: 7,
        message: "A new art exhibit showcasing Filipino artists is now open at the National Museum in Intramuros.",
        icon: "art-track",
        details: "Experience the creativity of local artists in this new exhibit. Open daily from 10 AM to 6 PM.",
        datePosted: new Date("2025-04-19T13:15:00Z"),
    },
    {
        id: 8,
        message: "The Intramuros Visitor Center has launched a new interactive map to help tourists navigate the area.",
        icon: "map",
        details: "Get your hands on the new interactive map at the Intramuros Visitor Center. It will guide you to the best historical sites!",
        datePosted: new Date("2025-04-18T17:45:00Z"),
    },
    {
        id: 9,
        message: "Public transportation routes in Intramuros may be affected due to road closures for an upcoming event.",
        icon: "train",
        details: "Expect detours and temporary road closures around the Intramuros area from May 5th to May 7th.",
        datePosted: new Date("2025-04-17T10:00:00Z"),
    },
    {
        id: 10,
        message: "The Intramuros Museum will be offering free admission on International Museum Day, May 18th.",
        icon: "museum",
        details: "Celebrate International Museum Day by visiting the Intramuros Museum for free admission on May 18th. Don't miss out!",
        datePosted: new Date("2025-04-16T09:30:00Z"),
    },
];

export default () => {
    const [expandedNotificationId, setExpandedNotificationId] = useState<number | null>(null);
    const [expandAnim] = useState(new Animated.Value(0)); // For smooth expand animation
    const navigation = useNavigation<NavigationProp>();

    const toggleExpand = (id: number) => {
        if (expandedNotificationId === id) {
            Animated.timing(expandAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
            setExpandedNotificationId(null);
        } else {
            setExpandedNotificationId(id);
            Animated.timing(expandAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Intramuros Notifications" onSupportPress={() => navigation.navigate("Support")} />

            <ScrollView style={styles.scrollContainer}>
                {notifications.map((item) => (
                    <View key={item.id} style={styles.notificationCard}>
                        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                            <View style={styles.notificationHeader}>
                                <Icon name={item.icon} size={30} color="#493628" style={styles.icon} />
                                <Text style={styles.notificationMessage}>{item.message}</Text>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.datePosted}>
                            Posted on: {item.datePosted.toLocaleDateString()} at {item.datePosted.toLocaleTimeString()}
                        </Text>

                        {expandedNotificationId === item.id && (
                            <Animated.View
                                style={[
                                    styles.expandedContainer,
                                    {
                                        height: expandAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 100],
                                        }),
                                    },
                                ]}
                            >
                                <Text style={styles.detailsText}>{item.details}</Text>
                            </Animated.View>
                        )}
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <BottomFooter active="Notification" />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    notificationCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    notificationHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 12,
    },
    notificationMessage: {
        fontSize: 16,
        fontWeight: "500",
        color: "#493628",
        flex: 1,
    },
    datePosted: {
        fontSize: 12,
        color: "#7A5B47",
        marginTop: 8,
    },
    expandedContainer: {
        overflow: "hidden",
        marginTop: 8,
        paddingLeft: 40,
        backgroundColor: "#F1E4D4", // Light background for expanded details
        borderRadius: 8,
        padding: 12,
    },
    detailsText: {
        fontSize: 14,
        color: "#493628",
    },
    footer: {
        flexDirection: "row",
        backgroundColor: "#493628",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
    },
});
