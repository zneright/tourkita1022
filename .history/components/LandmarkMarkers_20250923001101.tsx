import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { featureCollection, point } from "@turf/helpers";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useLandmark } from "../provider/LandmarkProvider";
import EventDetailModal from "./EventDetailModal";
import EventListModal from "./EventListModal";

import pin from "../assets/pinB.png";
import restroom from "../assets/restroom.png";
import museum from "../assets/museum.png";
import historical from "../assets/historical.png";
import government from "../assets/government.png";
import park from "../assets/park.png";
import food from "../assets/food.png";
import school from "../assets/school.png";
import eventIcon from "../assets/events.png";

import { format, isWithinInterval, parseISO } from "date-fns";
export default function LandmarkMarkers({ selectedCategory, onLoadingChange }: any) {
    const { setSelectedLandmark, loadDirection } = useLandmark();
    const [landmarks, setLandmarks] = useState<any[]>([]);
    const [eventsAtLocation, setEventsAtLocation] = useState<any[]>([]);
    const [showEventListModal, setShowEventListModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                onLoadingChange(true);

                if (selectedCategory === "Events") {
                    const snapshot = await getDocs(collection(db, "events"));
                    const today = new Date(); // current date

                    const fetched: any[] = [];

                    for (const docSnap of snapshot.docs) {
                        const data = docSnap.data();

                        const startDate = data.startDate ? parseISO(data.startDate) : null;
                        const endDate = data.endDate ? parseISO(data.endDate) : startDate; // if no endDate, assume same day

                        if (!startDate) continue; 

                        const isTodayEvent =
                            today >= startDate && today <= endDate!; // endDate is guaranteed non-null

                        if (!isTodayEvent) continue;

                        // Optionally handle recurrence if you have daysOfWeek
                        if (data.recurrence?.daysOfWeek) {
                            const weekday = format(today, "EEE").toLowerCase(); // e.g., "mon", "tue"
                            if (!data.recurrence.daysOfWeek.includes(weekday)) continue;
                        }

                        let lat = data.lat;
                        let lng = data.lng;

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
                            ...data,
                            latitude: lat,
                            longitude: lng,
                            category: "Event",
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

    const onPointPress = async (event: OnPressEvent) => {
        try {
            const landmarkStr = event.features[0].properties?.landmark;
            if (!landmarkStr) return;
            const landmark = JSON.parse(landmarkStr);

            if (selectedCategory === "Events" || landmark.category === "Event") {
                const eventsHere = landmarks.filter(
                    (l) =>
                        l.category === "Event" &&
                        parseFloat(l.latitude) === parseFloat(landmark.latitude) &&
                        parseFloat(l.longitude) === parseFloat(landmark.longitude)
                );

                if (eventsHere.length === 1) {
                    const evt = eventsHere[0];

                    if (evt.customAddress) {
                        setSelectedEvent(evt);
                        return;
                    }

                    if (!evt.customAddress && evt.locationId) {
                        try {
                            const markerDoc = await getDoc(doc(db, "markers", String(evt.locationId)));
                            if (markerDoc.exists()) {
                                evt.address = markerDoc.data().address || "";
                            }
                        } catch (e) {
                            console.error("Error fetching marker address:", e);
                            evt.address = "";
                        }
                    }

                    setSelectedEvent(evt);
                } else if (eventsHere.length > 1) {
                    setEventsAtLocation(eventsHere);
                    setShowEventListModal(true);
                }
            } else {

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
                    event: eventIcon,
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
                        iconImage: ["get", "iconKey"],
                        iconSize: 0.09,
                        iconAllowOverlap: true,
                        iconAnchor: "bottom",
                    }}
                />
            </ShapeSource>

            {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}


            {showEventListModal && (
                <EventListModal
                    events={eventsAtLocation}
                    onClose={() => setShowEventListModal(false)}
                    onSelect={(event) => {
                        setSelectedEvent(event);
                        setShowEventListModal(false);
                    }}
                />
            )}
        </>
    );
}