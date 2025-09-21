import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { FontAwesome5, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLandmark } from "../provider/LandmarkProvider";

export default function ModeSelector() {
    const { mode, setMode, loadDirection } = useLandmark() as any;

    const handleModeChange = (newMode: string) => {
        setMode(newMode);
        loadDirection(undefined, newMode); // reload with chosen mode
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.option} onPress={() => handleModeChange("walking")}>
                <FontAwesome5 name="walking" size={24} color={mode === "walking" ? "blue" : "black"} />
                <Text style={styles.label}>Walk</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => handleModeChange("cycling")}>
                <FontAwesome5 name="bicycle" size={24} color={mode === "cycling" ? "blue" : "black"} />
                <Text style={styles.label}>Cycle</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => handleModeChange("driving-traffic")}>
                <Ionicons name="car-sport" size={24} color={mode === "driving-traffic" ? "blue" : "black"} />
                <Text style={styles.label}>Traffic</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 12,
    },
    option: {
        alignItems: "center",
    },
    label: {
        fontSize: 12,
        marginTop: 2,
    },
});
