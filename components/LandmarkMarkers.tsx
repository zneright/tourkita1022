/* eslint-disable */
import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import pin from '../assets/pinB.png';
import { featureCollection, point } from '@turf/helpers';
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // your configured Firestore instance
import { useLandmark } from "../provider/LandmarkProvider";

export default function LandmarkMarkers() {
    const { setSelectedLandmark } = useLandmark();
    const [landmarks, setLandmarks] = useState<any[]>([]);

    useEffect(() => {
        const fetchLandmarks = async () => {
            try {
                const snapshot = await getDocs(collection(db, "markers"));
                const fetched = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        latitude: parseFloat(data.latitude),
                        longitude: parseFloat(data.longitude),
                    };
                });
                setLandmarks(fetched);
            } catch (err) {
                console.error("Failed to fetch landmarks:", err);
            }
        };

        fetchLandmarks();
    }, []);

    const points = landmarks.map((landmark) =>
        point([landmark.longitude, landmark.latitude], { landmark })
    );

    const onPointPress = async (event: OnPressEvent) => {
        const landmark = event.features[0].properties?.landmark;
        if (landmark) {
            setSelectedLandmark(landmark);
        }
    };

    return (
        <ShapeSource id="landmarks" shape={featureCollection(points)} onPress={onPointPress}>
            <SymbolLayer
                id="landmark-icons"
                style={{
                    iconImage: 'pin',
                    iconSize: 0.7,
                    iconAllowOverlap: true,
                    iconAnchor: 'bottom',
                }}
            />
            <Images images={{ pin }} />
        </ShapeSource>
    );
}
