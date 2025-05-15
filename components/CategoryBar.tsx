import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // make sure this points to your Firestore config

interface Props {
    selectedIndex: number | null;
    onSelect: (index: number, category: string) => void;
}

const CategoriesBar: React.FC<Props> = ({ selectedIndex, onSelect }) => {
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const snapshot = await getDocs(collection(db, "markers"));
            const uniqueCategories = new Set<string>();
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.category) {
                    uniqueCategories.add(data.category);
                }
            });

            // Add "All" category on top
            setCategories(["All", ...Array.from(uniqueCategories)]);
        };

        fetchCategories();
    }, []);

    return (
        <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category, index) => {
                    const isSelected = selectedIndex === index;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.category}
                            onPress={() => onSelect(index, category)}
                        >
                            <View style={[styles.circle, isSelected && styles.selectedCircle]} />
                            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    categoryContainer: {
        flexDirection: "column",
        backgroundColor: "#493628",
        alignItems: "center",
    },
    category: {
        alignItems: "center",
        marginRight: 20,
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#9c8061",
        marginBottom: 6,
    },
    selectedCircle: {
        backgroundColor: "#D6C0B3",
    },
    label: {
        color: "#9c8061",
        fontSize: 12,
        fontWeight: "600",
    },
    selectedLabel: {
        color: "#D6C0B3",
    },
});

export default CategoriesBar;
