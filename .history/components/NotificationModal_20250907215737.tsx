import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Linking,
    ScrollView,
} from "react-native";

export interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
    imageUrl: string | null;
    notifications: {
        id: string;
        title: string;
        message: string;
        timestamp: Date;
        imageUrl?: string;
    }[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    visible,
    onClose,
    imageUrl,
    notifications,
}) => {
    if (!visible || !imageUrl) return null;

    const relatedNotifications = notifications.filter((n) => n.imageUrl === imageUrl);

    return (
        <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
            <View style={styles.modalContent}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.modalImage}
                    resizeMode="contain"
                />

                <ScrollView style={{ width: "100%" }}>
                    {relatedNotifications.map((n) => (
                        <View key={n.id} style={styles.modalMessageBox}>
                            <Text style={styles.modalTitle}>{n.title}</Text>
                            <Text style={styles.modalTimestamp}>
                                {n.timestamp.toLocaleString()}
                            </Text>

                            {n.message.split("\n").map((paragraph, pIndex) => (
                                <Text key={pIndex} style={styles.paragraph}>
                                    {paragraph.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
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
                                    {"\n"}
                                </Text>
                            ))}
                        </View>
                    ))}
                </ScrollView>


                <TouchableOpacity onPress={onClose} style={styles.okButton}>
                    <Text style={styles.okText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default NotificationModal;

const styles = StyleSheet.create({
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
        backgroundColor: "#493628",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
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
        textAlign: "justify",
        lineHeight: 20,
    },
    modalLink: {
        color: "#007AFF",
        textDecorationLine: "underline",
    },
    paragraph: {
        textAlign: "justify",
        lineHeight: 22,
        marginBottom: 8,
        // textIndent is not supported in React Native, so use marginLeft for indentation
        marginLeft: 20,
    }
});
