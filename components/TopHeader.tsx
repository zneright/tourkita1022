import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TopHeaderProps {
    title: string;
    onSupportPress?: () => void;
}

export default function TopHeader({ title, onSupportPress }: TopHeaderProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>{title}</Text>
            {onSupportPress && (
                <TouchableOpacity style={styles.iconWrapper} onPress={onSupportPress}>
                    <Ionicons name="alert-circle-outline" size={24} color="#D6C0B3" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#493628",
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    headerText: {
        color: "#D6C0B3",
        fontSize: 22,
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
    },
    iconWrapper: {
        position: "absolute",
        right: 20,
    },
});
