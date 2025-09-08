import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { featureCollection, point } from "@turf/helpers";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useLandmark } from "../provider/LandmarkProvider";

import pin from "../assets/pinB.png";
import restroom from "../assets/restroom.png";
import museum from "../assets/museum.png";
import historical from "../assets/historical.png";
import government from "../assets/government.png";
import park from "../assets/park.png";
import food from "../assets/food.png";
import school from "../assets/school.png";
import eventIcon from "../assets/events.png"; // ✅ add an event icon image

import { format, isWithinInterval, parseISO } from "date-fns";

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
        const fetchData = async () => {
            try {
                onLoadingChange(true);

                if (selectedCategory === "Events") {
                    const snapshot = await getDocs(collection(db, "events"));
                    const today = format(new Date(), "EEE").toLowerCase(); // e.g. "mon"
                    const todayDate = new Date();

                    const fetched: any[] = [];

                    for (const docSnap of snapshot.docs) {
                        const data = docSnap.data();

                        // check recurrence (daysOfWeek includes today, and date range valid)
                        const startDate = data.recurrence?.startDate ? parseISO(data.recurrence.startDate) : null;
                        const endDate = data.recurrence?.endDate ? parseISO(data.recurrence.endDate) : null;

                        const isInDateRange =
                            startDate && endDate
                                ? isWithinInterval(todayDate, { start: startDate, end: endDate })
                                : true;

                        if (!data.recurrence?.daysOfWeek?.includes(today) || !isInDateRange) continue;

                        let lat = data.lat;
                        let lng = data.lng;

                        // if no customAddress, fallback to marker
                        if ((!data.customAddress || data.customAddress.trim() === "") && data.locationId) {
                            try {
                                const markerDoc = await getDoc(doc(db, "markers", String(data.locationId)));
                                if (markerDoc.exists()) {
                                    const marker = markerDoc.data();
                                    lat = parseFloat(marker.latitude);
                                    lng = parseFloat(marker.longitude);
                                }
                            } catch (e) {
                                console.error("Error fetching marker for event:", e);
                            }
                        }

                        fetched.push({
                            id: docSnap.id,
                            name: data.title || "Untitled Event",
                            description: data.description || "",
                            image: data.image || null,
                            latitude: lat,
                            longitude: lng,
                            category: "Event",
                            startDate: data.startDate,
                            endDate: data.endDate,
                            recurrence: data.recurrence || null,
                        });

                    }

                    setLandmarks(fetched);
                } else {
                    const snapshot = await getDocs(collection(db, "markers"));
                    const fetched = snapshot.docs.map((doc) => {
                        const data = doc.data();
                        return {
                            ...data,
                            latitude: parseFloat(data.latitude),
                            longitude: parseFloat(data.longitude),
                            accessibleRestroom:
                                data.accessibleRestroom === true || data.accessibleRestroom === "true",
                        };
                    });
                    setLandmarks(fetched);
                }
            } catch (err) {
                console.error("Failed to fetch landmarks/events:", err);
            } finally {
                onLoadingChange(false);
            }
        };

        fetchData();
    }, [selectedCategory]);

    const filtered = landmarks.filter((l) => {
        if (selectedCategory === "All") return true;
        if (selectedCategory === "Restroom") return l.accessibleRestroom === true;
        if (selectedCategory === "Events") return true;
        return l.category === selectedCategory || l.categoryOption === selectedCategory;
    });

    const getIconKey = (landmark: any) => {
        if (selectedCategory === "Events" || landmark.category === "Event") return "event";

        const name = landmark.name?.toLowerCase() || "";
        const category = (landmark.category || "").toLowerCase();
        const option = (landmark.categoryOption || "").toLowerCase();

        if (selectedCategory === "Restroom" && landmark.accessibleRestroom) return "restroom";
        if (name.includes("museum") || category === "museum") return "museum";
        if (name.includes("historical") || category === "historical") return "historical";
        if (name.includes("government") || category === "government") return "government";
        if (name.includes("park") || category === "park") return "park";
        if (name.includes("food") || category === "food") return "food";
        if (name.includes("school") || category === "school") return "school";
        return "pin";
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
                setSelectedLandmark(landmark); // marker OR event
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
                    event: eventIcon,
                }}
            />
            <ShapeSource id="landmarks" shape={featureCollection(points)} onPress={onPointPress}>
                <SymbolLayer
                    id="landmark-icons"
                    style={{
                        iconImage: ["get", "iconKey"],
                        iconSize: 0.09,
                        iconAllowOverlap: true,
                        iconAnchor: "bottom",
                    }}
                />
            </ShapeSource>
        </>
    );
}
