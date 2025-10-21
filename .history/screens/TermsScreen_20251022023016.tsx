import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { doc, getDoc } from "firebase/firestore"; // Use getDoc for specific documents
import { db } from "../firebase";
import { format } from "date-fns";
import TopHeader from "../components/TopHeader";
import SkeletonBox from "../components/Skeleton";
import { Ionicons } from "@expo/vector-icons";

const TermsScreen = () => {
    // State for managing the active tab
    const [activeTab, setActiveTab] = useState('terms'); // 'terms' or 'privacy'

    // Simplified state to hold both documents
    const [documents, setDocuments] = useState({ terms: null, privacy: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both documents in parallel for better performance
                const [termsSnap, privacySnap] = await Promise.all([
                    getDoc(doc(db, "legal", "terms")),
                    getDoc(doc(db, "legal", "privacy"))
                ]);

                const processDoc = (snap) => {
                    if (snap.exists()) {
                        const data = snap.data();
                        return {
                            title: data.title,
                            content: data.content || [],
                            lastUpdated: data.timestamp?.toDate()
                                ? format(data.timestamp.toDate(), "MMMM dd, yyyy")
                                : "Not available",
                        };
                    }
                    return null;
                };

                setDocuments({
                    terms: processDoc(termsSnap),
                    privacy: processDoc(privacySnap),
                });

            } catch (error) {
                console.error("Error fetching legal documents:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper component to render the content of the active tab
    const renderContent = () => {
        const document = documents[activeTab];

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

        if (!document) {
            return <Text style={styles.errorText}>Could not load document.</Text>;
        }

        return (
            <View style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>{document.title}</Text>
                <Text style={styles.lastUpdated}>Last updated: {document.lastUpdated}</Text>
                {document.content.map((item, index) => (
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
        backgroundColor: "#F9F4EF", // A soft off-white background
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
        backgroundColor: '#6D4C41', // Darker brown for active state
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