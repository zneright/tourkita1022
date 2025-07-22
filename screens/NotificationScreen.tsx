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
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    query,
    where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import TopHeader from "../components/TopHeader";
import BottomFooter from "../components/BottomFooter";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Notification">;

type NotificationSource = "notifications" | "adminMessages";

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    category: string;
    viewed: boolean;
    source: NotificationSource;
    context?: string;
    contextType?: "Feature" | "Location";
}

const NotificationScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const auth = getAuth();
    const user = auth.currentUser;
    const isGuest = !user;

    const userId = user?.uid || "guest";
    const userEmail = user?.email || "guest@example.com";

    useEffect(() => {
        if (isGuest) {
            setLoading(false);
            return;
        }

        const fetchNotifications = async () => {
            try {
                const cached = await AsyncStorage.getItem("cachedNotifications");
                if (cached) {
                    const parsed: Notification[] = JSON.parse(cached);
                    setNotifications(parsed.map(n => ({ ...n, timestamp: new Date(n.timestamp) })));
                }

                const [notifSnap, adminSnap] = await Promise.all([
                    getDocs(collection(db, "notifications")),
                    getDocs(query(collection(db, "adminMessages"), where("to", "==", userEmail))),
                ]);

                const notifData: Notification[] = notifSnap.docs.map(docSnap => {
                    const data = docSnap.data();
                    const viewedBy = Array.isArray(data.viewedBy) ? data.viewedBy : [];
                    return {
                        id: docSnap.id,
                        title: data.title || "Untitled",
                        message: data.message || "No message provided.",
                        timestamp: data.timestamp?.toDate?.() ?? new Date(),
                        category: data.category || "info",
                        viewed: viewedBy.includes(userId),
                        source: "notifications",
                    };
                });

                const adminData: Notification[] = adminSnap.docs.map(docSnap => {
                    const data = docSnap.data();
                    const viewedBy = Array.isArray(data.viewedBy) ? data.viewedBy : [];
                    return {
                        id: docSnap.id,
                        title: "Admin Response to Your Feedback",
                        message: data.message || "No reply message.",
                        timestamp: data.sentAt?.toDate?.() ?? new Date(),
                        category: "feedback",
                        viewed: viewedBy.includes(userId),
                        source: "adminMessages",
                        context: data.context || "",
                        contextType: data.contextType || "",
                    };
                });

                const combined = [...notifData, ...adminData].sort(
                    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
                );

                setNotifications(combined);
                await AsyncStorage.setItem("cachedNotifications", JSON.stringify(combined));
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [isGuest, userId, userEmail]);

    const toggleExpand = async (id: string) => {
        const notif = notifications.find(n => n.id === id);
        if (!notif) return;

        if (!notif.viewed) {
            try {
                const docRef = doc(db, notif.source, id);
                await updateDoc(docRef, { viewedBy: arrayUnion(userId) });

                const updated = notifications.map(n =>
                    n.id === id ? { ...n, viewed: true } : n
                );
                setNotifications(updated);
                await AsyncStorage.setItem("cachedNotifications", JSON.stringify(updated));
            } catch (err) {
                console.warn("Update viewed failed:", err);
            }
        }

        setExpandedId(prev => (prev === id ? null : id));
    };

    const getIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case "updates": return <FontAwesome5 name="bullhorn" size={20} color="#5E35B1" />;
            case "promotions": return <FontAwesome5 name="gift" size={20} color="#FF6F00" />;
            case "alerts": return <FontAwesome5 name="exclamation-triangle" size={20} color="#D32F2F" />;
            case "reminders": return <FontAwesome5 name="clock" size={20} color="#0288D1" />;
            case "feedback": return <FontAwesome5 name="comment-dots" size={20} color="#4CAF50" />;
            default: return <FontAwesome5 name="info-circle" size={20} color="#757575" />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Notifications" onSupportPress={() => navigation.navigate("Support")} />

            <View style={styles.contentWrapper}>
                {isGuest ? (
                    <View style={styles.centeredBox}>
                        <Text style={styles.guestText}>Notifications are only available for registered users.</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("SignUp")} style={styles.signupButton}>
                            <Text style={styles.signupText}>Create a Free Account</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {loading ? (
                            <Text style={styles.centerText}>Loading notifications...</Text>
                        ) : notifications.length === 0 ? (
                            <Text style={styles.centerText}>No notifications found.</Text>
                        ) : (
                            notifications.map(item => (
                                <View
                                    key={item.id + item.source}
                                    style={[
                                        styles.notificationCard,
                                        !item.viewed && styles.unviewedCard,
                                    ]}
                                >
                                    <TouchableOpacity
                                        onPress={() => toggleExpand(item.id)}
                                        style={styles.notificationHeader}
                                    >
                                        {getIcon(item.category)}
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={[
                                                styles.notificationTitle,
                                                !item.viewed && { fontWeight: "bold" },
                                            ]}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.datePosted}>
                                                Posted on: {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString()}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    {expandedId === item.id && (
                                        <View style={styles.messageContainer}>
                                            {item.context && item.contextType && (
                                                <Text style={styles.contextLine}>
                                                    Feedback on {item.contextType}: {item.context}
                                                </Text>
                                            )}
                                            <Text style={styles.messageText}>{item.message}</Text>
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}
            </View>

            <BottomFooter active="Notification" />
        </SafeAreaView>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
    },
    contentWrapper: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    centerText: {
        textAlign: "center",
        marginTop: 20,
        color: "#666",
    },
    guestText: {
        textAlign: "center",
        fontSize: 16,
        color: "#555",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    centeredBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    signupButton: {
        backgroundColor: "#fcd34d",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    signupText: {
        color: "#493628",
        fontWeight: "bold",
        fontSize: 16,
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
    unviewedCard: {
        backgroundColor: "#FFF8E1",
        borderLeftWidth: 5,
        borderLeftColor: "#FF6F00",
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
    contextLine: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 6,
        color: "#5D4037",
    },
    messageText: {
        fontSize: 14,
        color: "#493628",
    },
});
