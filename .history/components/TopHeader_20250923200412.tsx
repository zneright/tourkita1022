import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface TopHeaderProps {
    title: string;
    onSupportPress?: () => void;
    showBackButton?: boolean;
}

export default function TopHeader({ title, onSupportPress, showBackButton = false }: TopHeaderProps) {
    const navigation = useNavigation();

    return (
        <View style={styles.header}>
            {showBackButton ? (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#D6C0B3" />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}

            <Text style={styles.headerText} numberOfLines={1}>
                {title}
            </Text>

            {onSupportPress ? (
                <TouchableOpacity style={styles.iconWrapper} onPress={onSupportPress}>
                    <Ionicons name="alert-circle-outline" size={24} color="#D6C0B3" />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
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
        paddingVertical: 2,
        paddingHorizontal: 2,
    },
    headerText: {
        color: "#D6C0B3",
        fontSize: 22,
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
    },
    iconWrapper: {
        width: 24,
        alignItems: "flex-end",
    },
    backButton: {
        width: 24,
        alignItems: "flex-start",
    },
    placeholder: {
        width: 24,
    },
});
