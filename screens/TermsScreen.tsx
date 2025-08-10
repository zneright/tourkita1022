import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import TopHeader from "../components/TopHeader";

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

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#493628" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <TopHeader title="Terms & Policies" showBackButton />

            <View style={styles.introSection}>
                <Text style={styles.introText}>
                    Please read our Terms of Service and Privacy Policy carefully before using the TourKita app.
                </Text>
                <View style={styles.separator} />
            </View>

            {/* Terms of Service */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Terms of Service</Text>
                {terms.map((item, index) => (
                    <Text key={index} style={styles.bulletText}>
                        {index + 1}. {item}
                    </Text>
                ))}
                {termsDate && <Text style={styles.lastUpdated}>Last updated: {termsDate}</Text>}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Privacy Policy</Text>
                {privacy.map((item, index) => (
                    <Text key={index} style={styles.bulletText}>
                        {index + 1}. {item}
                    </Text>
                ))}
                {privacyDate && <Text style={styles.lastUpdated}>Last updated: {privacyDate}</Text>}
            </View>

        </ScrollView>
    );
};

export default TermsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    introSection: {
        padding: 16,
    },
    introText: {
        fontSize: 16,
        color: "#333",
    },
    separator: {
        marginTop: 12,
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
    },
    section: {
        padding: 16,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#493628",
        marginBottom: 8,
        marginTop: 16,
    },
    bulletText: {
        fontSize: 15,
        marginBottom: 10,
        color: "#444",
    },
    lastUpdated: {
        fontSize: 13,
        color: "#777",
        marginTop: 8,
        fontStyle: "italic",
    },
});
