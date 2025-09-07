import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

type SkeletonBoxProps = {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: ViewStyle;
};

export default function SkeletonBox({
    width,
    height,
    borderRadius = 8,
    style,
}: SkeletonBoxProps) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.linear,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.linear,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: "#E0D6D0",
                    opacity,
                },
                style,
            ]}
        />
    );
}
