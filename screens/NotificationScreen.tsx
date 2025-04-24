import React from "react";
import { SafeAreaView, View, ScrollView, Text, Image, TouchableOpacity } from "react-native";

const notifications = [
    {
        id: 1,
        message: "Muralla Street from San Francisco Street to Victoria Street is closed for repairs until November 20. Please use alternative routes.",
    },
    {
        id: 2,
        message: "Bambike is closed today. Please plan your visit accordingly and check for updates on their reopening schedule.",
    },
];

export default () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            {/* Top Header */}
            <View style={{
                backgroundColor: "#493628",
                paddingVertical: 20,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <Text style={{
                    color: "#D6C0B3",
                    fontSize: 24,
                    fontWeight: "bold",
                }}>
                    Notifications
                </Text>
                <TouchableOpacity>
                    <Image
                        source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/hohnxztu_expires_30_days.png" }}
                        style={{ width: 30, height: 30, borderRadius: 15 }}
                    />
                </TouchableOpacity>
            </View>

            {/* Notification List */}
            <ScrollView style={{ flex: 1, padding: 16 }}>
                {notifications.map((item) => (
                    <View
                        key={item.id}
                        style={{
                            backgroundColor: "#D6C0B3",
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 12,
                        }}
                    >
                        <Text style={{ fontSize: 14, color: "#493628" }}>{item.message}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Bottom Navigation Footer */}
            <View style={{
                flexDirection: "row",
                backgroundColor: "#493628",
                justifyContent: "space-around",
                alignItems: "center",
                paddingVertical: 10,
            }}>
                {[
                    { label: "Maps", uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/dys5fgal_expires_30_days.png" },
                    { label: "Search", uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/xjd3y01d_expires_30_days.png" },
                    { label: "AR Cam", uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/agh99put_expires_30_days.png" },
                    { label: "Notifications", uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/ksf22dbv_expires_30_days.png", active: true },
                    { label: "Me", uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/12345meicon_expires_30_days.png" }, // replace with actual
                ].map((item, index) => (
                    <View key={index} style={{ alignItems: "center" }}>
                        <Image
                            source={{ uri: item.uri }}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                marginBottom: 2,
                            }}
                        />
                        <Text style={{
                            fontSize: 13,
                            color: item.active ? "#D6C0B3" : "#AB886D"
                        }}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </SafeAreaView>
    );
};
