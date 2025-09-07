import React, { useEffect, useState } from "react";
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { format, parseISO } from "date-fns";
import TopHeader from "../components/TopHeader";
import EventDetailModal from "../components/EventDetailModal";
import SkeletonBox from "../components/Skeleton";

type Event = {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    locationId?: string;
    address?: string;
    eventStartTime?: string;
    eventEndTime?: string;
    date?: string;
    openToPublic?: boolean;
};

const CalendarViewScreen = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    const todayStr = format(new Date(), "yyyy-MM-dd");

    const todaysEvents = events
        .filter((e) => e.date === todayStr)
        .sort((a, b) => (a.eventStartTime || "").localeCompare(b.eventStartTime || ""));

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const eventSnap = await getDocs(collection(db, "events"));
                const markerSnap = await getDocs(collection(db, "markers"));

                // Build marker map for quick lookup
               const markerMap: { [id: string]: { name: string; address: string } } = {};
markerSnap.forEach((doc) => {
  const data = doc.data();
  markerMap[doc.id] = {
    name: data.name || "Unknown Location",
    address: data.address || "Address not available",
  };
});


                eventSnap.forEach((doc) => {
                    const data = doc.data();

                    // Use customAddress first; fallback to marker info
                    let address = data.customAddress;
                    if (!address && data.locationId && markerMap[data.locationId]) {
                        address = markerMap[data.locationId].name || markerMap[data.locationId].address;
                    }
                    if (!address) address = "Address not available";

                    const eventDate = data.date ?? "";

                    fetchedEvents.push({
                        id: doc.id,
                        title: data.title ?? "Untitled Event",
                        description: data.description ?? "",
                        imageUrl: data.imageUrl ?? undefined,
                        locationId: data.locationId,
                        address,
                        date: eventDate,
                        eventStartTime: data.eventStartTime ?? "",
                        eventEndTime: data.eventEndTime ?? "",
                        openToPublic: data.openToPublic ?? false,
                    });

                    if (eventDate) {
                        dateMap[eventDate] = { marked: true, dotColor: "#493628" };
                    }
                });

                setEvents(fetchedEvents);
                setMarkedDates(dateMap);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);


    const onDayPress = (day: any) => {
        const selected = day.dateString;
        const filtered = events.filter((e) => e.date === selected);
        if (filtered.length > 0) {
            setSelectedEvents(filtered);
            setModalVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            <TopHeader title="Calendar" showBackButton />

            <ScrollView>
                <Calendar
                    markedDates={markedDates}
                    onDayPress={onDayPress}
                    theme={{
                        selectedDayBackgroundColor: "#493628",
                        todayTextColor: "#493628",
                        dotColor: "#493628",
                        arrowColor: "#493628",
                    }}
                />

                <View style={styles.todaysContainer}>
                    <Text style={styles.todaysTitle}>Today's Events</Text>

                    {loading ? (
                        <>
                            {[1, 2, 3].map((i) => (
                                <View key={i} style={styles.eventCard}>
                                    <SkeletonBox width="70%" height={18} style={{ marginBottom: 6 }} />
                                    <SkeletonBox width="40%" height={14} />
                                </View>
                            ))}
                        </>
                    ) : todaysEvents.length === 0 ? (
                        <Text style={styles.noEventsText}>No events today</Text>
                    ) : (
                        todaysEvents.map((event, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.eventCard}
                                onPress={() => {
                                    setSelectedEvent(event);
                                    setDetailModalVisible(true);
                                }}
                            >
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventTime}>
                                    {event.eventStartTime}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedEvents.length > 0 && selectedEvents[0].date ? (
                            <Text style={styles.modalTitle}>
                                Events on {format(parseISO(selectedEvents[0].date), "MMMM dd, yyyy")}
                            </Text>
                        ) : (
                            <Text style={styles.modalTitle}>No events found</Text>
                        )}

                        <ScrollView style={{ marginTop: 10 }}>
                            {selectedEvents.map((event, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.eventCard}
                                    onPress={() => {
                                        setSelectedEvent(event);
                                        setDetailModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.eventTime}>
                                        {event.eventStartTime}
                                        {event.address ? ` — ${event.address}` : ""}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <EventDetailModal
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                event={selectedEvent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { backgroundColor: "#fff", borderRadius: 10, padding: 20, width: "100%", maxHeight: "80%" },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: "#493628" },
    eventCard: { backgroundColor: "#F8F4F0", padding: 10, marginBottom: 10, borderRadius: 8 },
    eventTitle: { fontSize: 16, fontWeight: "bold" },
    eventTime: { fontSize: 14, color: "#666", marginVertical: 4 },
    closeButton: { marginTop: 10, paddingVertical: 10, backgroundColor: "#493628", borderRadius: 8, alignItems: "center" },
    closeButtonText: { color: "#fff", fontWeight: "bold" },
    todaysContainer: { padding: 16 },
    todaysTitle: { fontSize: 18, fontWeight: "bold", color: "#493628", marginBottom: 10 },
    noEventsText: { fontSize: 14, color: "#999" },
});

export default CalendarViewScreen;
