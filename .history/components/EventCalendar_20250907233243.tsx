type EventType = {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    locationId?: string;
    address: string;
    eventStartTime?: string;
    eventEndTime?: string;
    startDate: string; // original start
    endDate?: string;  // original end, optional
    openToPublic?: boolean;
    recurrence?: "weekly" | null; // optional recurrence type
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

                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                for (const docSnap of eventsSnap.docs) {
                    const data = docSnap.data();
                    let address = "Address not available";
                    if (data.customAddress && data.customAddress.trim() !== "") {
                        address = data.customAddress;
                    } else if (data.locationId) {
                        const markerRef = doc(db, "markers", data.locationId);
                        const markerSnap = await getDoc(markerRef);
                        if (markerSnap.exists()) {
                            const markerData = markerSnap.data();
                            address = markerData.name || markerData.address || "Address not available";
                        }
                    }

                    const startDate = data.startDate ? parseISO(data.startDate) : new Date();
                    const endDate = data.endDate ? parseISO(data.endDate) : startDate;

                    // Generate instances for each day between startDate and endDate
                    const days = [];
                    let current = new Date(startDate);
                    while (current <= endDate) {
                        days.push(new Date(current));
                        current.setDate(current.getDate() + 1);
                    }

                    // If recurrence is weekly
                    if (data.recurrence === "weekly") {
                        // Repeat weekly until endDate
                        const weeklyDays: Date[] = [];
                        current = new Date(startDate);
                        while (current <= endDate) {
                            weeklyDays.push(new Date(current));
                            current.setDate(current.getDate() + 7);
                        }
                        days.splice(0, days.length, ...weeklyDays);
                    }

                    // Filter only events for today or tomorrow
                    for (const day of days) {
                        if (isToday(day) || isTomorrow(day)) {
                            fetchedEvents.push({
                                id: docSnap.id,
                                title: data.title ?? "Untitled Event",
                                description: data.description,
                                imageUrl: data.imageUrl,
                                locationId: data.locationId,
                                address,
                                eventStartTime: data.eventStartTime,
                                eventEndTime: data.eventEndTime,
                                startDate: day.toISOString(), // instance date
                                endDate: data.endDate,
                                openToPublic: data.openToPublic ?? false,
                                recurrence: data.recurrence ?? null,
                            });
                        }
                    }
                }

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

    const formatLabel = (dateStr: string) => {
        const day = new Date(dateStr);
        if (isToday(day)) return "Today";
        if (isTomorrow(day)) return "Tomorrow";
        return "";
    };

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
                    {events.map((event) => (
                        <TouchableOpacity
                            key={`${event.id}-${event.startDate}`} // unique per instance
                            style={styles.eventCard}
                            onPress={() => {
                                setSelectedEvent(event);
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <Text style={styles.eventDetails}>
                                {event.address}: {event.eventStartTime}
                                {event.eventEndTime ? ` - ${event.eventEndTime}` : ""} (
                                {formatLabel(event.startDate)})
                            </Text>
                        </TouchableOpacity>
                    ))}
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
