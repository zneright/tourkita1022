import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import TopHeader from "../components/TopHeader";
import SkeletonBox from "../components/Skeleton";
import { Ionicons } from "@expo/vector-icons";

const TermsScreen = () => {
    // State for managing the active tab
    const [activeTab, setActiveTab] = useState('terms'); // 'terms' or 'privacy'

    // State from your original data-fetching logic
    const [terms, setTerms] = useState<string[]>([]);
    const [privacy, setPrivacy] = useState<string[]>([]);
    const [termsDate, setTermsDate] = useState("");
    const [privacyDate, setPrivacyDate] = useState("");
    const [loading, setLoading] = useState(true);

    // Your original useEffect for fetching data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const termsSnapshot = await getDocs(collection(db, "services"));
                const privacySnapshot = await getDocs(collection(db, "privacy"));

                termsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    setTerms(data.content || []);
                    setTermsDate(
                        data.timestamp?.toDate()
                            ? format(data.timestamp.toDate(), "MMMM dd, yyyy")
                            : ""
                    );
                });

                privacySnapshot.forEach((doc) => {
                    const data = doc.data();
                    setPrivacy(data.content || []);
                    setPrivacyDate(
                        data.timestamp?.toDate()
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

    // Helper component to render the content based on the active tab
    const renderContent = () => {
        const isTerms = activeTab === 'terms';
        const content = isTerms ? terms : privacy;
        const date = isTerms ? termsDate : privacyDate;
        const title = isTerms ? "Terms of Service" : "Privacy Policy";

        if (loading) {
            return (
                <View style={styles.contentContainer}>
                    <SkeletonBox width="60%" height={24} style={{ marginBottom: 20 }} />
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonBox key={i} width="100%" height={16} style={{ marginBottom: 12 }} />
                    ))}
                </View>
            );
        }

        if (content.length === 0) {
            return <Text style={styles.errorText}>Could not load document.</Text>;
        }

        return (
            <View style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.lastUpdated}>Last updated: {date}</Text>
                {content.map((item, index) => (
                    <Text key={index} style={styles.bulletText}>
                        <Text style={styles.bulletPoint}>•</Text> {item}
                    </Text>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TopHeader title="Terms & Policies" showBackButton />

            {/* Tabbed Interface */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'terms' && styles.activeTabButton]}
                    onPress={() => setActiveTab('terms')}
                >
                    <Ionicons name="document-text-outline" size={20} color={activeTab === 'terms' ? '#FFFFFF' : '#4E342E'} />
                    <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>Terms of Service</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'privacy' && styles.activeTabButton]}
                    onPress={() => setActiveTab('privacy')}
                >
                    <Ionicons name="shield-checkmark-outline" size={20} color={activeTab === 'privacy' ? '#FFFFFF' : '#4E342E'} />
                    <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>Privacy Policy</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                {renderContent()}
            </ScrollView>
        </View>
    );
};

export default TermsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F4EF",
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#EFEBE9',
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    activeTabButton: {
        backgroundColor: '#6D4C41',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4E342E',
        marginLeft: 8,
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    contentContainer: {
        backgroundColor: "#FFFFFF",
        margin: 16,
        padding: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#4E342E",
        marginBottom: 4,
    },
    lastUpdated: {
        fontSize: 13,
        color: "#A1887F",
        marginBottom: 20,
        fontStyle: "italic",
    },
    bulletText: {
        fontSize: 15,
        marginBottom: 12,
        color: "#5D4037",
        lineHeight: 22,
    },
    bulletPoint: {
        fontWeight: 'bold',
        color: '#8D6E63',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#BF360C',
        fontSize: 16,
    }
});