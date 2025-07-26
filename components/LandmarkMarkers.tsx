/* eslint-disable */
import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { featureCollection, point } from '@turf/helpers';
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLandmark } from "../provider/LandmarkProvider";

// Import icons
import pin from '../assets/pinB.png';
import restroom from '../assets/restroom.png';
import museum from '../assets/museum.png';
import historical from '../assets/historical.png';
import government from '../assets/government.png';
import park from '../assets/park.png';
import food from '../assets/food.png';
import school from '../assets/school.png';

export default function LandmarkMarkers({
    selectedCategory,
    onLoadingChange,
}: {
    selectedCategory: string;
    onLoadingChange: (loading: boolean) => void;
}) {

    const { setSelectedLandmark } = useLandmark();
    const [landmarks, setLandmarks] = useState<any[]>([]);

    useEffect(() => {
        const fetchLandmarks = async () => {
            try {
                onLoadingChange(true);
                const snapshot = await getDocs(collection(db, "markers"));
                const fetched = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        latitude: parseFloat(data.latitude),
                        longitude: parseFloat(data.longitude),
                        accessibleRestroom: data.accessibleRestroom === true || data.accessibleRestroom === 'true',
                    };
                });
                setLandmarks(fetched);
            } catch (err) {
                console.error("Failed to fetch landmarks:", err);
            } finally {
                onLoadingChange(false);
            }
        };

        fetchLandmarks();
    }, []);

    const filtered = landmarks.filter(l => {
        if (selectedCategory === "All") return true;
        if (selectedCategory === "Restroom") return l.accessibleRestroom === true;
        return (
            l.category === selectedCategory ||
            l.categoryOption === selectedCategory
        );
    });

    const getIconKey = (landmark: any) => {
        const name = landmark.name?.toLowerCase() || '';
        const category = (landmark.category || '').toLowerCase();
        const option = (landmark.categoryOption || '').toLowerCase();

        if (selectedCategory === "Restroom" && landmark.accessibleRestroom) {
            return 'restroom';
        }

        if (name.includes("museum") || category === 'museum') return 'museum';
        if (name.includes("historical") || category === 'historical') return 'historical';
        if (name.includes("government") || category === 'government') return 'government';
        if (name.includes("park") || category === 'park') return 'park';
        if (name.includes("food") || category === 'food') return 'food';
        if (name.includes("school") || category === 'school') return 'school';
        return 'pin';
    };

    const points = filtered.map((landmark, index) =>
        point([landmark.longitude, landmark.latitude], {
            landmark: JSON.stringify(landmark),
            id: index,
            iconKey: getIconKey(landmark),
        })
    );

    const onPointPress = (event: OnPressEvent) => {
        try {
            const landmarkStr = event.features[0].properties?.landmark;
            if (landmarkStr) {
                const landmark = JSON.parse(landmarkStr);
                setSelectedLandmark(landmark);
            }
        } catch (error) {
            console.error("Error parsing landmark data:", error);
        }
    };

    return (
        <>
            <Images
                images={{
                    pin,
                    restroom,
                    museum,
                    historical,
                    government,
                    park,
                    food,
                    school,
                }}
            />
            <ShapeSource id="landmarks" shape={featureCollection(points)} onPress={onPointPress}>
                <SymbolLayer
                    id="landmark-icons"
                    style={{
                        iconImage: ['get', 'iconKey'],
                        iconSize: 0.09,
                        iconAllowOverlap: true,
                        iconAnchor: 'bottom',
                    }}
                />
            </ShapeSource>
        </>
    );
}