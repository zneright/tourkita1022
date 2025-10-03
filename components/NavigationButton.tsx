// components/NavigationToggleButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

interface Props {
    navigationMode: boolean;
    loading?: boolean;
    onToggle: () => void;
}

export default function NavigationButton({ navigationMode, loading, onToggle }: Props) {
    return (
        <TouchableOpacity
            onPress={onToggle}
            disabled={loading}
            style={[
                styles.button,
                { backgroundColor: navigationMode ? "#EF4444" : "#6D4C41" },
            ]}
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <>
                    <Entypo name="direction" size={22} color="white" />
                    <Text style={styles.buttonText}>
                        {navigationMode ? "Exit Navigation" : "Start Navigation"}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: 20,
        borderRadius: 28,
        height: 52,
        paddingHorizontal: 28,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        letterSpacing: 0.5,
    },
});
