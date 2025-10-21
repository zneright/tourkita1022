import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { featureCollection, point } from "@turf/helpers";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useLandmark } from "../provider/LandmarkProvider";
import EventDetailModal from "./EventDetailModal";
import EventListModal from "./EventListModal";
import { useNavigation } from "@react-navigation/native";

// ✅ Import the necessary new functions from date-fns
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, areIntervalsOverlapping } from "date-fns";

export default function LandmarkMarkers({ selectedCategory, onLoadingChange }: any) {
    const { setSelectedLandmark } = useLandmark();
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
                    const now = new Date();
                    const today = format(now, "EEE").toLowerCase();

                    // ✅ Define the start and end of the current month
                    const monthStart = startOfMonth(now);
                    const monthEnd = endOfMonth(now);

                    const fetched: any[] = [];

                    for (const docSnap of snapshot.docs) {
                        const data = docSnap.data();
                        const recurrence = data.recurrence || {};

                        const startDate = data.startDate ? parseISO(data.startDate) : null;
                        const endDate = data.endDate ? parseISO(data.endDate) : startDate; // Default end to start if not present

                        // ✅ If there's no start date, we can't process it.
                        if (!startDate) {
                            continue;
                        }

                        // ✅ Check if the event's date range overlaps with the current month's range
                        const eventInterval = { start: startDate, end: endDate };
                        const monthInterval = { start: monthStart, end: monthEnd };

                        if (!areIntervalsOverlapping(eventInterval, monthInterval)) {
                            continue; // Skip this event if it's not in the current month at all
                        }

                        let occursToday = false;
                        if (recurrence.frequency === "weekly") {
                            const isInDateRange = isWithinInterval(now, { start: startDate, end: endDate });
                            occursToday = recurrence.daysOfWeek?.includes(today) && isInDateRange;
                        } else if (recurrence.frequency === "once") {
                            occursToday = format(now, "yyyy-MM-dd") === format(startDate, "yyyy-MM-dd");
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

                        fetched.push({ ...data, latitude: lat, longitude: lng, category: "Event", occursToday });
                    }
                    setLandmarks(fetched);
                } else {
                    // This part for fetching non-event landmarks remains the same
                    const snapshot = await getDocs(collection(db, "markers"));
                    const fetched = snapshot.docs.map((doc) => {
                        const data = doc.data();
                        return { ...data, latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) };
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

    // ... (The rest of your component code remains exactly the same)

    const filtered = landmarks.filter((l) => {
        if (selectedCategory === "All") return true;
        if (selectedCategory === "Restroom") return l.accessibleRestroom === true;
        if (selectedCategory === "Events") return true;
        if (selectedCategory === "Augmented Reality") return l.arCameraSupported === true;
        if (selectedCategory === "Relics/Artifacts") return l.categoryOption === "Relics/Artifacts";
        return l.category === selectedCategory || l.categoryOption === selectedCategory;
    });

    const getIconKey = (landmark) => {
        if (landmark.category === "Event") return "event";
        const name = landmark.name?.toLowerCase() || "";
        const category = (landmark.category || "").toLowerCase();
        if (landmark.accessibleRestroom) return "restroom";
        if (name.includes("museum") || category === "museum") return "museum";
        if (name.includes("historical") || category === "historical") return "historical";
        if (name.includes("government") || category === "government") return "government";
        if (name.includes("park") || category === "park") return "park";
        if (name.includes("food") || category === "food") return "food";
        if (name.includes("school") || category === "school") return "school";
        if (category === "relics/artifacts") return "relics";
        return "pin";
    };

    const points = filtered.map((landmark, index) =>
        point([landmark.longitude, landmark.latitude], {
            landmark: JSON.stringify(landmark),
            id: index,
            iconKey: getIconKey(landmark),
            name: landmark.category === "Event" ? landmark.title || "Untitled Event" : landmark.name || "Unnamed",
            isToday: landmark.category === "Event" ? landmark.occursToday || false : false,
        })
    );

    const navigation = useNavigation();

    const onPointPress = async (event) => {
        try {
            const landmarkStr = event.features[0].properties?.landmark;
            if (!landmarkStr) return;
            const landmark = JSON.parse(landmarkStr);

            if (landmark.category === "Event") {
                const eventsHere = landmarks.filter(l =>
                    l.category === "Event" &&
                    parseFloat(l.latitude) === parseFloat(landmark.latitude) &&
                    parseFloat(l.longitude) === parseFloat(landmark.longitude)
                );
                if (eventsHere.length > 1) {
                    setEventsAtLocation(eventsHere);
                    setShowEventListModal(true);
                } else if (eventsHere.length === 1) {
                    setSelectedEvent(eventsHere[0]);
                }
                return;
            }

            setSelectedLandmark(landmark);
        } catch (error) {
            console.error("Error onPointPress:", error);
        }
    };

    return (
        <>
            <Images
                images={{
                    restroom: require("../assets/restroom.png"),
                    museum: require("../assets/museum.png"),
                    historical: require("../assets/historical.png"),
                    government: require("../assets/government.png"),
                    park: require("../assets/park.png"),
                    food: require("../assets/food.png"),
                    school: require("../assets/school.png"),
                    event: require("../assets/events.png"),
                    relics: require("../assets/relics.png"),
                    pin: require("../assets/relics.png")
                }}
            />
            <ShapeSource id="landmarks" shape={featureCollection(points)} onPress={onPointPress}>
                {selectedCategory === "Events" && (
                    <CircleLayer
                        id="event-today-highlight"
                        style={{ circleColor: "#ff6600", circleRadius: 12, circleBlur: 1, circleOpacity: 0.5 }}
                        filter={["==", ["get", "isToday"], true]}
                    />
                )}
                <SymbolLayer id="landmark-icons" style={{ iconImage: ["get", "iconKey"], iconSize: 0.09, iconAllowOverlap: true, iconAnchor: "bottom" }} />
                <SymbolLayer id="landmark-labels" style={{ textField: ["get", "name"], textSize: ["interpolate", ["linear"], ["zoom"], 10, 6, 15, 9, 18, 11], textOffset: [0, 1.1], textColor: "#000000", textHaloColor: "#ffffff", textHaloWidth: 1, textAnchor: "bottom" }} />
            </ShapeSource>
            {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
            {showEventListModal && <EventListModal events={eventsAtLocation} onClose={() => setShowEventListModal(false)} onSelect={(event) => { setSelectedEvent(event); setShowEventListModal(false); }} />}
        </>
    );
}