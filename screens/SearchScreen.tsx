import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from "react-native";
import TopHeader from "../components/TopHeader";
import BottomFooter from "../components/BottomFooter";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";

type Item = {
    name: string;
    image: string;
};

const SearchScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [searchText, setSearchText] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState("");

    const handleImageTap = (image: string) => {
        setModalImage(image);
        setModalVisible(true);
    };

    const recommendations: Item[] = [
        {
            name: "Fort Santiago",
            image: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB8jKmFMVAQ4Alg9Ex7llEcuqWtDp_ybnPcXIZ5khjF-ie8sT8QqykqJB-JKvDOSEcL898GnWO9GMozr7yXgCXsghhq8f9A_6V9V6ioQ_ZHAzw7oe66oPwwJVpGPvGmiMm3jLX4=s1360-w1360-h1020",
        },
        {
            name: "San Agustin Church",
            image: "https://www.fabulousphilippines.com/images/san-agustin-church-2008.jpg",
        },
        {
            name: "Manila Cathedral",
            image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Manila_Cathedral_exterior_2022.jpg",
        },
    ];

    const cafes: Item[] = [
        {
            name: "La Cathedral Café",
            image: "https://i.imgur.com/F2gJKMv.jpg",
        },
        {
            name: "Barbara's Heritage Café",
            image: "https://i.imgur.com/YiybDJv.jpg",
        },
        {
            name: "Ilustrado",
            image: "https://i.imgur.com/vn8XE9d.jpg",
        },
    ];

    const museums: Item[] = [
        {
            name: "Casa Manila",
            image: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Casa_Manila_Museum.jpg",
        },
        {
            name: "Bahay Tsinoy",
            image: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Bahay_Tsinoy_Museum.jpg",
        },
        {
            name: "Museo de Intramuros",
            image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Museo_de_Intramuros%2C_Manila.jpg",
        },
    ];

    const filteredRecommendations = recommendations.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <TopHeader title="Search" onSupportPress={() => navigation.navigate("Support")} />
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Search Input */}
                <View style={styles.searchWrapper}>
                    <Text style={styles.searchLabel}>Search any keyword...</Text>
                    <View style={styles.searchInputContainer}>
                        <TextInput
                            style={styles.searchInput}
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Type here..."
                            placeholderTextColor="#999"
                        />
                        <Image
                            source={{ uri: "https://cdn-icons-png.flaticon.com/512/622/622669.png" }}
                            style={styles.searchIcon}
                        />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Recommendations</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {filteredRecommendations.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.card} onPress={() => handleImageTap(item.image)}>
                            <Image source={{ uri: item.image }} style={styles.cardImage} />
                            <Text style={styles.cardLabel}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>Cafés</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {cafes.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.cardLarge} onPress={() => handleImageTap(item.image)}>
                            <Image source={{ uri: item.image }} style={styles.cardImageLarge} />
                            <Text style={styles.cardLabel}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>Museums</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {museums.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.cardLarge} onPress={() => handleImageTap(item.image)}>
                            <Image source={{ uri: item.image }} style={styles.cardImageLarge} />
                            <Text style={styles.cardLabel}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </ScrollView>

            {/* Image Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
                        <Image source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" />
                    </Pressable>
                </View>
            </Modal>

            <BottomFooter active="Search" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    scrollContainer: { flex: 1 },
    searchWrapper: { paddingHorizontal: 22, paddingTop: 20 },
    searchLabel: { color: "#6B5E5E", fontSize: 13, marginBottom: 8 },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
    },
    searchInput: {
        flex: 1,
        height: 47,
        borderRadius: 15,
        borderColor: "#493628",
        borderWidth: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingRight: 50,
        fontSize: 16,
    },
    searchIcon: {
        position: "absolute",
        right: 12,
        width: 24,
        height: 24,
        tintColor: "#493628",
    },
    sectionTitle: {
        color: "#493628",
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 24,
        marginLeft: 22,
        marginBottom: 12,
    },
    horizontalScroll: {
        paddingLeft: 22,
        marginBottom: 24,
    },
    card: { width: 150, marginRight: 16 },
    cardLarge: { width: 209, marginRight: 16 },
    cardImage: {
        width: "100%",
        height: 140,
        borderRadius: 12,
        backgroundColor: "#D9D9D9",
    },
    cardImageLarge: {
        width: "100%",
        height: 160,
        borderRadius: 12,
        backgroundColor: "#D9D9D9",
    },
    cardLabel: {
        marginTop: 6,
        fontSize: 14,
        color: "#493628",
        fontWeight: "500",
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        height: "70%",
        borderRadius: 10,
        overflow: "hidden",
    },
    modalImage: {
        width: "100%",
        height: "100%",
    },
});

export default SearchScreen;
