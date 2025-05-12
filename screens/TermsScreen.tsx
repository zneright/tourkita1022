import React, { useEffect } from 'react';
import { ScrollView, Text, StyleSheet, View, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const TermsScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Go back to the previous screen when the back button is pressed
            navigation.goBack();
            return true; // Prevent the default behavior (exit app)
        });

        // Clean up the event listener on component unmount
        return () => {
            backHandler.remove();
        };
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <Text style={styles.title}>TourKita – Terms of Service</Text>

                    <Section title="1. Service Description">
                        TourKita provides users with location-based augmented reality (AR) experiences, interactive maps, real-time navigation, feedback functionality, and historical site information to support exploration within Intramuros, Manila.
                    </Section>

                    <Section title="2. Eligibility and Account Use">
                        Registration is open to students, local tourists, and international tourists. A guest mode is also available. All information provided must be accurate and up to date.
                    </Section>

                    <Section title="3. User Responsibilities">
                        You agree to use the app for legal and tourism-related purposes only. You must not abuse app features, provide false information, or disrespect cultural and historical content. Misuse may lead to account suspension.
                    </Section>

                    <Section title="4. Location-Based Services">
                        TourKita uses GPS to provide location-specific content. Location access must be granted for features to function properly. No location data is stored permanently.
                    </Section>

                    <Section title="5. Augmented Reality Features">
                        AR content is limited to specific landmarks within Intramuros. AR experiences include 3D models, historic overlays, and cultural descriptions. AR functionality may depend on device compatibility and performance.
                    </Section>

                    <Section title="6. Feedback and Ratings">
                        Users may rate locations and provide comments. Submitted feedback should be constructive and must not include offensive or false content. Feedback helps enhance user experience.
                    </Section>

                    <Section title="7. Notifications">
                        Users will receive push notifications regarding events, closures, or historical highlights in Intramuros.
                    </Section>

                    <Section title="8. Data Privacy">
                        TourKita collects basic information (name, email, age, gender, contact) to personalize services. We use Firebase for secure data handling and do not sell or share your information with third parties.
                    </Section>

                    <Section title="9. Limitations of Use">
                        TourKita is functional only within Intramuros. Internet connectivity is required for full use. AR content is limited to supported landmarks during initial implementation.
                    </Section>

                    <Section title="10. Account Deletion">
                        Users may request to delete their account at any time through the app’s Profile settings. Once initiated, all associated personal data will be scheduled for permanent deletion within 30 days.
                    </Section>

                    <Section title="11. Changes to Terms">
                        We reserve the right to update these Terms at any time. Significant changes will be communicated through in-app notifications.
                    </Section>

                    <Section title="12. Contact Us">
                        For inquiries, assistance, or feedback, please reach out to us through the in-app Support Module.
                    </Section>

                    <Text style={styles.title}>TourKita – Privacy Policy</Text>

                    <Section title="1. Information We Collect">
                        We collect personal information such as name, email, gender, age, contact number, and user type for account registration. GPS is used for navigation and AR services. Usage data includes app activity and feedback.
                    </Section>

                    <Section title="2. Use of Information">
                        Information is used to personalize navigation, provide AR content, send notifications, and collect feedback. We do not sell or share your data externally.
                    </Section>

                    <Section title="3. Data Storage and Security">
                        We use Firebase for authentication, cloud storage, and real-time database services. Data is encrypted and securely stored. Only authorized developers may access user records for support purposes.
                    </Section>

                    <Section title="4. User Rights and Controls">
                        Users may update or delete their account at any time. You may disable location access or notification permissions in your phone settings.
                    </Section>

                    <Section title="5. Data Retention">
                        We keep your personal data only while your account is active. When deleted, all information is removed permanently.
                    </Section>

                    <Section title="6. Policy Updates">
                        This policy may be updated periodically. Any significant changes will be announced within the app.
                    </Section>

                    <Section title="7. Contact Information">
                        If you have questions or concerns about our data practices, contact us through the in-app Support Module.
                    </Section>

                    <Text style={styles.footer}>Last updated: 04/25/2025</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.text}>{children}</Text>
    </View>
);

export default TermsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
    },
    scroll: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 30,
        marginBottom: 20,
        textAlign: 'center',
        color: '#1A1A1A',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    text: {
        fontSize: 15.5,
        lineHeight: 24,
        color: '#555',
    },
    footer: {
        fontSize: 13,
        color: 'gray',
        textAlign: 'center',
        marginTop: 30,
    },
});
