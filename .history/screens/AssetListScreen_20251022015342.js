import React, { useMemo } from "react";
import { View, Text, SectionList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import * as FileSystem from 'expo-file-system';
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { SHARED_ASSETS_DIR, getFilenameFromUrl, getSafeDirName } from '../utils/fileSystem';

// The AssetItem component remains unchanged as it's already self-contained.
const AssetItem = ({ item, navigation, mode }) => {
    // ... (This entire component's code is exactly the same as before)
};

export default function AssetListScreen({ route, navigation }) {
    const { assets, title, mode } = route.params;
    const headerTitle = mode === 'AR' ? 'View in Real World' : 'View in 3D';

    // --- NEW: Segregate assets into sections ---
    // useMemo prevents reprocessing the list on every render
    const sections = useMemo(() => {
        const building = assets.filter(asset => asset.category !== 'Relics/Artifacts');
        const relics = assets.filter(asset => asset.category === 'Relics/Artifacts');
        
        const data = [];
        if (building.length > 0) {
            data.push({ title: 'Building', data: building });
        }
        if (relics.length > 0) {
            data.push({ title: 'Relics & Artifacts', data: relics });
        }
        return data;
    }, [assets]);

    return (
        <View style={styles.container}>
            <Button />
            <Text style={styles.header}>{title}</Text>
            <Text style={styles.subHeader}>{headerTitle}</Text>

            {/* --- UPDATED: Use SectionList instead of FlatList --- */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <AssetItem item={item} navigation={navigation} mode={mode} />}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No viewable assets found for this landmark.</Text>}
                contentContainerStyle={{ paddingHorizontal: 8 }} // Add padding for items
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F4EF", paddingTop: 16 },
    header: { marginTop: 45, fontSize: 22, fontWeight: "bold", color: '#4E342E', textAlign: 'center' },
    subHeader: { fontSize: 16, color: '#795548', textAlign: 'center', marginBottom: 20 },
    // --- NEW STYLE for section titles ---
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6D4C41',
        backgroundColor: '#EFEBE9',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden', // Ensures border radius is applied to background
    },
    item: { padding: 12, marginBottom: 12, backgroundColor: "#FFF", borderRadius: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: '#EFEBE9', elevation: 2 },
    itemDetails: { flex: 1, marginLeft: 12, marginRight: 8 },
    itemText: { fontSize: 16, fontWeight: '600', color: '#3E2723' },
    itemDescription: { fontSize: 13, color: '#795548', marginTop: 2, fontStyle: 'italic' },
    image: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#E0E0E0' },
    empty: { textAlign: "center", marginTop: 40, color: "#999" },
    statusContainer: { alignItems: 'center', width: 60 },
    actionsRow: { flexDirection: 'row' },
    actionButton: { width: 36, height: 36, borderRadius: 18, marginHorizontal: 4, justifyContent: 'center', alignItems: 'center' },
    downloadButton: { backgroundColor: '#007AFF' },
    viewButton: { backgroundColor: '#4CAF50' },
    deleteButton: { backgroundColor: '#D32F2F' },
    progressText: { fontSize: 12, color: '#333' },
    progressBar: { height: 4, width: '100%', backgroundColor: '#E0E0E0', borderRadius: 2, marginTop: 2 },
    progressFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 2 },
});