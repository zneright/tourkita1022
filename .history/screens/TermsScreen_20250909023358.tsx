import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import TopHeader from "../components/TopHeader";
import SkeletonBox from "../components/Skeleton"; // Import your SkeletonBox

const TermsScreen = () => {
    const [terms, setTerms] = useState<string[]>([]);
    const [privacy, setPrivacy] = useState<string[]>([]);
    const [termsDate, setTermsDate] = useState("");
    const [privacyDate, setPrivacyDate] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const termsSnapshot = await getDocs(collection(db, "services"));
                const privacySnapshot = await getDocs(collection(db, "privacy"));

                termsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    setTerms(data.content || []);
                    setTermsDate(
                        data.timestamp?.toDate
                            ? format(data.timestamp.toDate(), "MMMM dd, yyyy")
                            : ""
                    );
                });

                privacySnapshot.forEach((doc) => {
                    const data = doc.data();
                    setPrivacy(data.content || []);
                    setPrivacyDate(
                        data.timestamp?.toDate
                            ? format(data.timestamp.toDate(), "MMMM dd, yyyy")
                            : ""
                    );
                });
            } catch (error) {
                console.error("Error fetching terms and privacy:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
            <TopHeader title="Terms & Policies" showBackButton />

            <View style={styles.introSection}>
                ) : (
                    <Text style={styles.introText}>
                        Please read our Terms of Service and Privacy Policy carefully before using the TourKita app.
                    </Text>
                )}
            </View>

            {/* Terms of Service */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Terms of Service</Text>
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonBox key={i} width="100%" height={16} style={{ marginBottom: 6 }} />
                    ))
                    : terms.map((item, index) => (
                        <Text key={index} style={styles.bulletText}>
                            {index + 1}. {item}
                        </Text>
                    ))}
                {!loading && termsDate && (
                    <Text style={styles.lastUpdated}>Last updated: {termsDate}</Text>
                )}
            </View>

            {/* Privacy Policy */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Privacy Policy</Text>
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonBox key={i} width="100%" height={16} style={{ marginBottom: 6 }} />
                    ))
                    : privacy.map((item, index) => (
                        <Text key={index} style={styles.bulletText}>
                            {index + 1}. {item}
                        </Text>
                    ))}
                {!loading && privacyDate && (
                    <Text style={styles.lastUpdated}>Last updated: {privacyDate}</Text>
                )}
            </View>
        </ScrollView>
    );
};

export default TermsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    introSection: {
        padding: 20,
    },
    introText: {
        fontSize: 16,
        color: "#493628",
    },
    card: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#493628",
        marginBottom: 10,
    },
    bulletText: {
        fontSize: 15,
        marginBottom: 8,
        color: "#444",
    },
    lastUpdated: {
        fontSize: 13,
        color: "#777",
        marginTop: 8,
        fontStyle: "italic",
    },
});
