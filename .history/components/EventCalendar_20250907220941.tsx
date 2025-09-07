import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import EventDetailModal from "./EventDetailModal";
import { parseISO, isToday, isTomorrow, addDays } from "date-fns";
import SkeletonBox from "./Skeleton";

type EventType = {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    address: string;
    eventStartTime?: string;
    eventEndTime?: string;
    startDate?: string;
    endDate?: string;
    openToPublic?: boolean;
    recurrence?: {
        frequency?: string;
        daysOfWeek?: string[];
        startDate?: string;
        endDate?: string;
    };
};

const EventCalendar = () => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const eventsSnap = await getDocs(collection(db, "events"));
                const fetchedEvents: EventType[] = [];

                for (const docSnap of eventsSnap.docs) {
                    const data = docSnap.data();

                    const address = data.customAddress || "Address not available";

                    const startDate = data.startDate ? parseISO(data.startDate) : new Date();
                    const endDate = data.endDate ? parseISO(data.endDate) : startDate;

                    const today = new Date();
                    const tomorrow = addDays(today, 1);

                    const occursTodayOrTomorrow = (date: Date) =>
                        isToday(date) || isTomorrow(date);

                    // Check recurrence
                    if (data.recurrence?.frequency === "weekly" && data.recurrence.daysOfWeek) {
                        const daysMap: Record<string, number> = {
                            sun: 0,
                            mon: 1,
                            tue: 2,
                            wed: 3,
                            thu: 4,
                            fri: 5,
                            sat: 6,
                        };

                        const eventDays = data.recurrence.daysOfWeek.map((d: string) => daysMap[d]);
                        const checkDate = (date: Date) => eventDays.includes(date.getDay());

                        if (checkDate(today) || checkDate(tomorrow)) {
                            fetchedEvents.push({
                                id: docSnap.id,
                                title: data.title ?? "Untitled Event",
                                description: data.description,
                                imageUrl: data.imageUrl,
                                address,
                                eventStartTime: data.eventStartTime,
                                eventEndTime: data.eventEndTime,
                                startDate: data.startDate,
                                endDate: data.endDate,
                                openToPublic: data.openToPublic ?? false,
                                recurrence: data.recurrence,
                            });
                        }
                    } else {
                        // Non-recurring events
                        if (occursTodayOrTomorrow(startDate)) {
                            fetchedEvents.push({
                                id: docSnap.id,
                                title: data.title ?? "Untitled Event",
                                description: data.description,
                                imageUrl: data.imageUrl,
                                address,
                                eventStartTime: data.eventStartTime,
                                eventEndTime: data.eventEndTime,
                                startDate: data.startDate,
                                endDate: data.endDate,
                                openToPublic: data.openToPublic ?? false,
                            });
                        }
                    }
                }

                // Sort by startDate
                fetchedEvents.sort(
                    (a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
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
            ) : events.length === 0 ? (
                <Text style={styles.noEvents}>No events for today or tomorrow.</Text>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {events.map((event) => {
                        const eventDate = parseISO(event.startDate!);
                        const label =
                            eventDate.toDateString() === new Date().toDateString()
                                ? "Today"
                                : "Tomorrow";

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
