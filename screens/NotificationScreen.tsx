import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Linking,
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
    imageUrl?: string;
    viewedBy?: string[];
    audience?: "guest" | "registered" | "all";
}

const NotificationScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

    const auth = getAuth();
    const user = auth.currentUser;

    const userId = user?.uid || "guest";
    const userEmail = user?.email || "guest@example.com";

    useEffect(() => {
        const userCreationTime = user?.metadata?.creationTime
            ? new Date(user.metadata.creationTime)
            : new Date();

        const fetchNotifications = async () => {
            try {
                const cached = await AsyncStorage.getItem("cachedNotifications");
                if (cached) {
                    const parsed: Notification[] = JSON.parse(cached);
                    setNotifications(parsed.map(n => ({ ...n, timestamp: new Date(n.timestamp) })));
                }

                const isGuest = userId === "guest";

                const [notifSnap, adminSnap] = await Promise.all([
                    getDocs(collection(db, "notifications")),
                    getDocs(query(collection(db, "adminMessages"), where("to", "==", userEmail))),
                ]);

                const notifData: Notification[] = notifSnap.docs
                    .map(docSnap => {
                        const data = docSnap.data();
                        const viewedBy = Array.isArray(data.viewedBy) ? data.viewedBy : [];
                        return {
                            id: docSnap.id,
                            title: data.title || "Untitled",
                            message: data.message || "No message provided.",
                            timestamp: data.timestamp?.toDate?.() ?? new Date(),
                            category: data.category || "info",
                            viewed: viewedBy.includes(userId),
                            source: "notifications" as NotificationSource,
                            imageUrl: data.imageUrl || "",
                            audience: data.audience || "all",
                            viewedBy,
                        };
                    })
                    .filter(n => {
                        const afterCreation = n.timestamp >= userCreationTime;
                        const audienceMatch =
                            n.audience === "all" || (isGuest && n.audience === "guest") || (!isGuest && n.audience === "registered");

                        const isSpecificDoc = n.id === "2TE1minYn4KNOPo2b64T";

                        return (afterCreation && audienceMatch) || isSpecificDoc;
                    });


                const adminData: Notification[] = adminSnap.docs
                    .map(docSnap => {
                        const data = docSnap.data();
                        const viewedBy = Array.isArray(data.viewedBy) ? data.viewedBy : [];
                        return {
                            id: docSnap.id,
                            title: "Admin Response to Your Feedback",
                            message: data.message || "No reply message.",
                            timestamp: data.sentAt?.toDate?.() ?? new Date(),
                            category: "feedback",
                            viewed: viewedBy.includes(userId),
                            source: "adminMessages" as NotificationSource,
                            context: data.context || "",
                            contextType: data.contextType || "",
                        };
                    })
                    .filter(n => n.timestamp >= userCreationTime);

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
    }, [userId, userEmail]);


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
                                    {item.imageUrl ? (
                                        <TouchableOpacity onPress={() => setModalImageUrl(item.imageUrl!)}>
                                            <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} />
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.iconWrapper}>{getIcon(item.category)}</View>
                                    )}
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text
                                            style={[
                                                styles.notificationTitle,
                                                !item.viewed && { fontWeight: "bold" },
                                            ]}
                                        >
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

                {modalImageUrl && (
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            onPress={() => setModalImageUrl(null)}
                        />
                        <View style={styles.modalContent}>
                            <Image
                                source={{ uri: modalImageUrl }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />

                            {notifications
                                .filter((n) => n.imageUrl === modalImageUrl)
                                .map((n) => (
                                    <View key={n.id} style={styles.modalMessageBox}>
                                        <Text style={styles.modalTitle}>{n.title}</Text>
                                        <Text style={styles.modalTimestamp}>
                                            {n.timestamp.toLocaleString()}
                                        </Text>
                                        <Text style={styles.modalMessage}>
                                            {n.message.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                                                part.match(/^https?:\/\//) ? (
                                                    <Text
                                                        key={i}
                                                        style={styles.modalLink}
                                                        onPress={() => Linking.openURL(part)}
                                                    >
                                                        {part}
                                                    </Text>
                                                ) : (
                                                    <Text key={i}>{part}</Text>
                                                )
                                            )}
                                        </Text>
                                    </View>
                                ))}

                            <TouchableOpacity
                                onPress={() => setModalImageUrl(null)}
                                style={styles.okButton}
                            >
                                <Text style={styles.okText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        alignItems: "center",
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
    thumbnailImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 10,
    },
    modalOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        backgroundColor: "#fff",
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: "center",
        maxHeight: "85%",
        width: "90%",
    },
    modalImage: {
        width: "100%",
        height: 250,
        borderRadius: 10,
        marginBottom: 16,
        backgroundColor: "#f0f0f0",
    },
    okButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    okText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalMessageBox: {
        width: "100%",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#493628",
        marginBottom: 6,
        textAlign: "center",
    },
    modalTimestamp: {
        fontSize: 12,
        color: "#888",
        textAlign: "center",
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 14,
        color: "#333",
        textAlign: "center",
        lineHeight: 20,
    },
    modalLink: {
        color: "#007AFF",
        textDecorationLine: "underline",
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 6,
        backgroundColor: "#EEE",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
});
