/* eslint-disable */
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { getDirections } from "../services/directions";
const LandmarkContext = createContext({});

export default function LandmarkProvider({ children }: PropsWithChildren) {
    const [selectedLandmark, setSelectedLandmark] = useState();
    const [direction, setDirection] = useState();
    const [showDirection, setShowDirection] = useState(false);
    const [loadingDirection, setLoadingDirection] = useState(false);
    const [mode, setMode] = useState<"walking" | "cycling" | "driving" | "driving-traffic">("walking");

    const loadDirection = async (
        target?: { latitude: number; longitude: number },
        customMode?: typeof mode
    ) => {
        const landmark = target || selectedLandmark;
        if (!landmark) return;

        setLoadingDirection(true);
        try {
            const userLocation = await Location.getCurrentPositionAsync();
            const newDirection = await getDirections(
                [userLocation.coords.longitude, userLocation.coords.latitude],
                [landmark.longitude, landmark.latitude],
                customMode || mode
            );
            setDirection(newDirection);
            setShowDirection(true);
        } catch (err) {
            console.error("Error fetching directions: ", err);
        } finally {
            setLoadingDirection(false);
        }
    };

    return (
        <LandmarkContext.Provider
            value={{
                selectedLandmark,
                setSelectedLandmark,
                direction,
                directionCoordinates: direction?.routes?.[0]?.geometry.coordinates,
                duration: direction?.routes?.[0]?.duration,
                distance: direction?.routes?.[0]?.distance,
                showDirection,
                setShowDirection,
                loadingDirection,
                loadDirection,
                mode,
                setMode
            }}
        >
            {children}
        </LandmarkContext.Provider>
    );
}

export const useLandmark = () => useContext(LandmarkContext);