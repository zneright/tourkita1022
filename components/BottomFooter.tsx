import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const screenWidth = Dimensions.get("window").width;

type BottomFooterProps = {
    active: string;
};

export default function BottomFooter({ active }: BottomFooterProps) {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();

    const tabs = [
        { label: "Maps", icon: { uri: "https://img.icons8.com/ios-filled/50/5c3d2e/map.png" }, screen: "Maps" },
        { label: "Search", icon: { uri: "https://img.icons8.com/ios-filled/50/5c3d2e/search--v1.png" }, screen: "Search" },
        { label: "Notifications", icon: { uri: "https://img.icons8.com/ios-filled/50/5c3d2e/appointment-reminders--v1.png" }, screen: "Notification" },
        { label: "Me", icon: { uri: "https://img.icons8.com/ios-filled/50/5c3d2e/user.png" }, screen: "Profile" },
    ];

    return (
        <View style={styles.footer}>
            {tabs.map((tab, index) => {
                const isActive = active === tab.screen;

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.footerItem}
                        onPress={() => navigation.navigate(tab.screen as any)}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={tab.icon}
                            style={[
                                styles.footerIcon,
                                { tintColor: isActive ? "#ffffff" : "#fbe3cd" },
                            ]}
                            resizeMode="contain"
                        />
                        <Text style={[styles.footerLabel, isActive && styles.activeLabel]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}


const styles = StyleSheet.create({
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#5c3d2e",
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 14,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 10,
    },
    footerItem: {
        flex: 1,
        alignItems: "center",
    },
    footerIcon: {
        width: 24,
        height: 24,
        marginBottom: 4,
    },
    footerLabel: {
        fontSize: 11,
        color: "#d6bda6",
    },
    activeLabel: {
        color: "#ffffff",
        fontWeight: "bold",
    },
});