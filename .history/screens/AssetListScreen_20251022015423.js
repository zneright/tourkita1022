import React, { useState, useEffect, useMemo } from "react";
import { View, Text, SectionList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import * as FileSystem from 'expo-file-system';
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { SHARED_ASSETS_DIR, getFilenameFromUrl, getSafeDirName } from '../utils/fileSystem';

/**
 * A self-contained component for rendering a single downloadable asset.
 * It manages its own download status, progress, and actions.
 */
const AssetItem = ({ item, navigation, mode }) => {
    const [status, setStatus] = useState('checking'); // 'checking', 'not_downloaded', 'downloading', 'downloaded'
    const [progress, setProgress] = useState(0);

    // Define all files required for this asset to be considered "downloaded"
    const requiredFiles = useMemo(() => {
        const files = [
            { remote: item.modelUrl, local: `${SHARED_ASSETS_DIR}${getSafeDirName(item.locationName)}/${getFilenameFromUrl(item.modelUrl)}` },
            { remote: item.imageUrl, local: `${SHARED_ASSETS_DIR}${getSafeDirName(item.locationName)}/${getFilenameFromUrl(item.imageUrl)}` },
        ];
        if (item.videoUrl) {
            files.push({ remote: item.videoUrl, local: `${SHARED_ASSETS_DIR}${getSafeDirName(item.locationName)}/${getFilenameFromUrl(item.videoUrl)}` });
        }
        return files;
    }, [item]);

    // Check if all required files exist locally when the component mounts
    useEffect(() => {
        const checkFiles = async () => {
            for (const file of requiredFiles) {
                const fileInfo = await FileSystem.getInfoAsync(file.local);
                if (!fileInfo.exists) {
                    setStatus('not_downloaded');
                    return;
                }
            }
            setStatus('downloaded');
        };
        checkFiles();
    }, [requiredFiles]);

    // Handles the download process for all required files
    const handleDownload = async () => {
        setStatus('downloading');
        setProgress(0);
        try {
            for (let i = 0; i < requiredFiles.length; i++) {
                const file = requiredFiles[i];
                const dir = file.local.substring(0, file.local.lastIndexOf('/'));
                await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

                const downloadResumable = FileSystem.createDownloadResumable(
                    file.remote, file.local, {},
                    p => setProgress((i + (p.totalBytesWritten / p.totalBytesExpectedToWrite)) / requiredFiles.length)
                );
                await downloadResumable.downloadAsync();
            }
            setStatus('downloaded');
        } catch (e) { console.error("Download failed:", e); setStatus('not_downloaded'); }
    };

    // Deletes all files associated with this asset
    const handleDelete = async () => {
        try {
            for (const file of requiredFiles) {
                await FileSystem.deleteAsync(file.local, { idempotent: true });
            }
            setStatus('not_downloaded');
            setProgress(0);
        } catch (e) { console.error("Delete failed:", e); }
    };

    // Navigates to the appropriate screen (3D or AR)
    const handleLaunch = () => {
        if (status !== 'downloaded') return;
        if (mode === '3D') {
            navigation.navigate("View3D", { modelUrl: item.modelUrl, title: item.name });
        } else if (mode === 'AR') {
            navigation.navigate("ArCam", { arTargetId: item.id });
        }
    };

    // Renders the correct button/status indicator based on the download state
    const renderStatus = () => {
        switch (status) {
            case 'downloading':
                return (
                    <View style={styles.statusContainer}>
                        <Text style={styles.progressText}>{`${(progress * 100).toFixed(0)}%`}</Text>
                        <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
                    </View>
                );
            case 'downloaded':
                return (
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={handleLaunch}>
                            <Ionicons name={mode === 'AR' ? 'camera' : 'eye'} size={16} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                            <Ionicons name="trash" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                );
            case 'checking': return <ActivityIndicator size="small" />;
            default: // 'not_downloaded'
                return (
                    <TouchableOpacity style={[styles.actionButton, styles.downloadButton]} onPress={handleDownload}>
                        <Ionicons name="download" size={16} color="white" />
                    </TouchableOpacity>
                );
        }
    };

    return (
        <View style={styles.item}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
            {renderStatus()}
        </View>
    );
};

/**
 * The main screen component that displays assets segregated by category.
 */
export default function AssetListScreen({ route, navigation }) {
    const { assets, title, mode } = route.params;
    const headerTitle = mode === 'AR' ? 'View in Real World' : 'View in 3D';

    // Segregate assets into sections for the SectionList
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
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <AssetItem item={item} navigation={navigation} mode={mode} />}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No viewable assets found for this landmark.</Text>}
                contentContainerStyle={{ paddingHorizontal: 8 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F4EF", paddingTop: 16 },
    header: { marginTop: 45, fontSize: 22, fontWeight: "bold", color: '#4E342E', textAlign: 'center' },
    subHeader: { fontSize: 16, color: '#795548', textAlign: 'center', marginBottom: 20 },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6D4C41',
        backgroundColor: '#EFEBE9',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
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