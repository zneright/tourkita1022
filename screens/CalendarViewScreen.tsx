// screens/CalendarViewScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import TopHeader from "../components/TopHeader";
import EventDetailModal from "../components/EventDetailModal";



type EventItem = {
    title: string;
    date: string;
    time: string;
    locationName: string;
    description?: string;
    imageUrl?: string;
};


const CalendarViewScreen = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [selectedEvents, setSelectedEvents] = useState<EventItem[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todaysEvents = events
        .filter(e => e.date === todayStr)
        .sort((a, b) => a.time.localeCompare(b.time));

    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const formatTime12Hour = (time: string) => {
        if (!time) return "";
        const [hour, minute] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hour, minute);
        return format(date, "h:mm a");
    };

    useEffect(() => {
        const fetchEvents = async () => {
            const eventSnap = await getDocs(collection(db, "events"));
            const markerSnap = await getDocs(collection(db, "markers"));

            const markerMap: { [id: string]: string } = {};
            markerSnap.forEach(doc => {
                markerMap[doc.id] = doc.data().name;
            });

            const fetchedEvents: EventItem[] = [];
            const dateMap: any = {};

            eventSnap.forEach(doc => {
                const data = doc.data();
                const locationName = markerMap[data.locationId] || "Unknown Location";
                const dateStr = data.date;

                fetchedEvents.push({
                    title: data.title,
                    date: dateStr,
                    time: data.time,
                    locationName,
                    description: data.description || "",
                    imageUrl: data.imageUrl || undefined,

                });

                dateMap[dateStr] = {
                    marked: true,
                    dotColor: "#493628",
                };
            });

            setEvents(fetchedEvents);
            setMarkedDates(dateMap);
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
                    {todaysEvents.length === 0 ? (
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
                                <Text style={styles.eventTime}>{formatTime12Hour(event.time)} — {event.locationName}</Text>
                                <Text style={styles.eventDescription}>{event.description}</Text>
                            </TouchableOpacity>

                        ))
                    )}
                </View>
            </ScrollView>

            {/* Modal stays outside the ScrollView */}
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
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    <Text style={styles.eventTime}>{formatTime12Hour(event.time)} — {event.locationName}</Text>
                                    <Text style={styles.eventDescription}>{event.description}</Text>
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
                onClose={() => {
                    setDetailModalVisible(false);
                    setSelectedEvent(null);
                }}
                event={selectedEvent}
            />

        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        width: "100%",
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#493628",
    },
    eventCard: {
        backgroundColor: "#F8F4F0",
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    eventTime: {
        fontSize: 14,
        color: "#666",
        marginVertical: 4,
    },
    eventDescription: {
        fontSize: 14,
        color: "#444",
    },
    closeButton: {
        marginTop: 10,
        paddingVertical: 10,
        backgroundColor: "#493628",
        borderRadius: 8,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    todaysContainer: {
        padding: 16,
    },

    todaysTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#493628",
        marginBottom: 10,
    },

    noEventsText: {
        fontSize: 14,
        color: "#999",
    },

});

export default CalendarViewScreen;
