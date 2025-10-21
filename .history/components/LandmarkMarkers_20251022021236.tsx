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
                    const now = new Date();
                    const today = format(now, "EEE").toLowerCase();
                    const todayDate = now;
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();

                    const fetched: any[] = [];

                    for (const docSnap of snapshot.docs) {
                        const data = docSnap.data();
                        const recurrence = data.recurrence || {};

                        const startDate = recurrence.startDate
                            ? parseISO(recurrence.startDate)
                            : data.startDate
                                ? parseISO(data.startDate)
                                : null;
                        const endDate = recurrence.endDate
                            ? parseISO(recurrence.endDate)
                            : data.endDate
                                ? parseISO(data.endDate)
                                : null;

                        // Skip if outside current month
                        if (startDate && (startDate.getMonth() !== currentMonth || startDate.getFullYear() !== currentYear)) {
                            continue;
                        }

                        // Determine if this event occurs today
                        let occursToday = false;
                        if (recurrence.frequency === "weekly") {
                            const isInDateRange =
                                startDate && endDate
                                    ? isWithinInterval(todayDate, { start: startDate, end: endDate })
                                    : true;
                            occursToday = recurrence.daysOfWeek?.includes(today) && isInDateRange;
                        } else if (recurrence.frequency === "once") {
                            occursToday = format(todayDate, "yyyy-MM-dd") === format(startDate, "yyyy-MM-dd");
                        }

                        // Get coordinates
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
                            occursToday,
                        });
                    }

                    setLandmarks(fetched);
                }
                else {
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
        if(selectedCategory === "Augmented Reality") return l.arCameraSupported === true;
        if (selectedCategory === "Relics/Artifacts" ) return l.categoryOption === "Relics/Artifacts";
        
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
        if (category === "relics/artifacts") return "relics";
        return "pin";
    };

    const points = filtered.map((landmark, index) =>
        point([landmark.longitude, landmark.latitude], {
            landmark: JSON.stringify(landmark),
            id: index,
            iconKey: getIconKey(landmark),
            name: landmark.name || "Unnamed", 
            isToday: landmark.category === "Event" ? landmark.occursToday || false : false,
        })
    );



    const navigation = useNavigation();

    const onPointPress = async (event: OnPressEvent) => {
        try {
            const landmarkStr = event.features[0].properties?.landmark;
            if (!landmarkStr) return;
            console.log("Pressed feature:", event.features[0].properties);
            console.log("landmarkStr type:", typeof landmarkStr);

            const landmark = typeof landmarkStr === "string" ? JSON.parse(landmarkStr) : landmarkStr;
            // ✅ Use EventListModal only for Events
            if (selectedCategory === "Events" || landmark.category === "Event") {
                const eventsHere = landmarks.filter(
                    (l) =>
                        l.category === "Event" &&
                        parseFloat(l.latitude) === parseFloat(landmark.latitude) &&
                        parseFloat(l.longitude) === parseFloat(landmark.longitude)
                );

                if (eventsHere.length > 1) {
                    setEventsAtLocation(eventsHere);
                    setShowEventListModal(true);
                    return;
                }

                if (eventsHere.length === 1) {
                    const evt = eventsHere[0];
                    if (!evt.customAddress && evt.locationId) {
                        try {
                            const markerDoc = await getDoc(doc(db, "markers", String(evt.locationId)));
                            if (markerDoc.exists()) {
                                evt.address = markerDoc.data().address || "";
                            } else {
                                evt.address = "";
                            }
                        } catch (e) {
                            console.error("Error fetching marker address:", e);
                            evt.address = "";
                        }
                    } else {
                        evt.address = evt.customAddress || "";
                    }

                    setSelectedEvent(evt);
                    return;
                }

                return; // no matching events
            }

        
            const arTargetRef = doc(db, "arTargets", String(landmark.id || landmark.name));

            const arTargetSnap = await getDoc(arTargetRef);

            if (arTargetSnap.exists()) {
                const arData = arTargetSnap.data();
                navigation.navigate("View3D", {
                    title: landmark.name,
                    modelUrl: arData.modelUrl,
                });
                return;
            }


            // fallback to showing landmark info if no 3D model
            setSelectedLandmark(landmark);

        } catch (error) {
            console.error("Error parsing landmark data:", error);
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
                }}
            />

            <ShapeSource id="landmarks" shape={featureCollection(points)} onPress={onPointPress}>
                {selectedCategory === "Events" && (
                    <CircleLayer
                        id="event-today-highlight"
                        style={{
                            circleColor: "#ff6600",
                            circleRadius: 12,
                            circleBlur: 1,
                            circleOpacity: 0.5,
                        }}
                        filter={["==", ["get", "isToday"], true]}
                    />
                )}

                <SymbolLayer
                    id="landmark-icons"
                    style={{
                        iconImage: ["get", "iconKey"],
                        iconSize: 0.09,
                        iconAllowOverlap: true,
                        iconAnchor: "bottom",
                    }}
                />
                <SymbolLayer
                    id="landmark-labels"
                    style={{
                        textField: ["get", "name"],
                        textSize: [
                            "interpolate", ["linear"], ["zoom"],
                            10, 6,  
                            15, 9,   
                            18, 11   
                        ],
                        textOffset: [0, 1.1],
                        textColor: "#000000",
                        textHaloColor: "#ffffff",
                        textHaloWidth: 1,
                        textAllowOverlap: false, 
                        textAnchor: "bottom",
                        textRotationAlignment: "viewport", 
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