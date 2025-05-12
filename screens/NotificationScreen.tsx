import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import TopHeader from "../components/TopHeader";
import BottomFooter from "../components/BottomFooter";
import { FontAwesome5 } from "@expo/vector-icons";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Notification">;

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    category: string;
}

const NotificationScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const snapshot = await getDocs(collection(db, "notifications"));
                const data = snapshot.docs.map(doc => {
                    const raw = doc.data();
                    return {
                        id: doc.id,
                        title: raw.title || "Untitled",
                        message: raw.message || "No message provided.",
                        timestamp: raw.timestamp?.toDate?.() ?? new Date(),
                        category: raw.category || "info",
                    };
                });

                const sortedData = data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                setNotifications(sortedData);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const getIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case "updates":
                return <FontAwesome5 name="bullhorn" size={20} color="#5E35B1" />;
            case "promotions":
                return <FontAwesome5 name="gift" size={20} color="#FF6F00" />;
            case "alerts":
                return <FontAwesome5 name="exclamation-triangle" size={20} color="#D32F2F" />;
            case "reminders":
                return <FontAwesome5 name="clock" size={20} color="#0288D1" />;
            default:
                return <FontAwesome5 name="info-circle" size={20} color="#757575" />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader
                title="Intramuros Notifications"
                onSupportPress={() => navigation.navigate("Support")}
            />

            <ScrollView style={styles.scrollContainer}>
                {loading ? (
                    <Text style={styles.centerText}>Loading notifications...</Text>
                ) : notifications.length === 0 ? (
                    <Text style={styles.centerText}>No notifications found.</Text>
                ) : (
                    notifications.map(item => (
                        <View key={item.id} style={styles.notificationCard}>
                            <TouchableOpacity
                                onPress={() => toggleExpand(item.id)}
                                style={styles.notificationHeader}
                            >
                                {getIcon(item.category)}
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.notificationTitle}>{item.title}</Text>
                                    <Text style={styles.datePosted}>
                                        Posted on: {item.timestamp.toLocaleDateString()} at{" "}
                                        {item.timestamp.toLocaleTimeString()}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {expandedId === item.id && (
                                <View style={styles.messageContainer}>
                                    <Text style={styles.messageText}>{item.message}</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            <View style={styles.footer}>
                <BottomFooter active="Notification" />
            </View>
        </SafeAreaView>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    centerText: {
        textAlign: "center",
        marginTop: 20,
        color: "#666",
    },
    notificationCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    notificationHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#493628",
    },
    datePosted: {
        fontSize: 12,
        color: "#7A5B47",
        marginTop: 4,
    },
    messageContainer: {
        marginTop: 12,
        backgroundColor: "#F1E4D4",
        padding: 12,
        borderRadius: 8,
    },
    messageText: {
        fontSize: 14,
        color: "#493628",
        flexWrap: "wrap",
    },
    footer: {
        flexDirection: "row",
        backgroundColor: "#493628",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
    },
});
