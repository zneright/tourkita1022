import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import EventDetailModal from "./EventDetailModal";
import { isToday, isTomorrow, parseISO } from "date-fns";
import SkeletonBox from "./Skeleton";

type Event = {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    locationId?: string;
    address: string;
    eventStartTime?: string;
    eventEndTime?: string;
    startDate?: string;
    endDate?: string;
    openToPublic?: boolean;
    recurrence?: {
        frequency?: string;
        daysOfWeek?: string[];
    };
};



const EventCalendar = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const todayTomorrowEvents = events.filter((event) => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        eventDate.setHours(0, 0, 0, 0); // ignore time

        return eventDate.getTime() === today.getTime() || eventDate.getTime() === tomorrow.getTime();
    });

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                // Fetch markers first
                const markerSnap = await getDocs(collection(db, "markers"));
                const markerMap: { [id: string]: string } = {};
                markerSnap.forEach((doc) => {
                    const data = doc.data();
                    markerMap[doc.id] = data.name || "Unknown Location";
                });

                // Fetch events
                const eventSnap = await getDocs(collection(db, "events"));
                const fetchedEvents: Event[] = [];

                eventSnap.forEach((doc) => {
                    const data = doc.data();

                    // Resolve address
                    let address = "Address not available";
                    if (data.customAddress?.trim()) {
                        address = data.customAddress;
                    } else if (data.locationId && markerMap[data.locationId]) {
                        address = markerMap[data.locationId];
                    }

                    const startDate = data.startDate ?? data.date ?? new Date().toISOString();
                    const endDate = data.endDate ?? startDate;

                    fetchedEvents.push({
                        id: doc.id,
                        title: data.title ?? "Untitled Event",
                        description: data.description ?? "",
                        imageUrl: data.imageUrl ?? undefined,
                        locationId: data.locationId,
                        address,
                        eventStartTime: data.eventStartTime ?? "",
                        eventEndTime: data.eventEndTime ?? "",
                        startDate,
                        endDate,
                        openToPublic: data.openToPublic ?? false,
                        recurrence: data.recurrence || {},
                    });
                });

                // Optional: sort by startDate
                fetchedEvents.sort((a, b) =>
                    new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
                );

                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);


    return (
        <View style={styles.wrapper}>
            <Text style={styles.header}>Events for Today & Tomorrow</Text>

            {loading ? (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={styles.eventCard}>
                            <SkeletonBox width="60%" height={18} style={{ marginBottom: 6 }} />
                            <SkeletonBox width="90%" height={14} />
                        </View>
                    ))}
                </ScrollView>
            ) : todayTomorrowEvents.length === 0 ? (
                <Text style={styles.noEvents}>No events for today or tomorrow.</Text>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {todayTomorrowEvents.map((event) => {
                        const eventStart = parseISO(event.startDate!);
                        const label = isToday(eventStart) ? "Today" : "Tomorrow";

                        return (
                            <TouchableOpacity
                                key={event.id}
                                style={styles.eventCard}
                                onPress={() => {
                                    setSelectedEvent(event);
                                    setModalVisible(true);
                                }}
                            >
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDetails}>
                                    {event.address}: {event.eventStartTime}
                                    {event.eventEndTime ? ` - ${event.eventEndTime}` : ""} ({label})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            <EventDetailModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                event={selectedEvent}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    wrapper: { paddingHorizontal: 22, marginTop: 20, marginBottom: 60 },
    header: { fontSize: 20, fontWeight: "bold", color: "#493628", marginBottom: 12 },
    scrollContainer: { paddingBottom: 20 },
    eventCard: { backgroundColor: "#F8F4F0", padding: 10, borderRadius: 8, marginBottom: 8 },
    eventTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
    eventDetails: { fontSize: 13, color: "#666", marginTop: 2 },
    noEvents: { textAlign: "center", fontSize: 16, color: "#999", marginTop: 20 },
});

export default EventCalendar;
