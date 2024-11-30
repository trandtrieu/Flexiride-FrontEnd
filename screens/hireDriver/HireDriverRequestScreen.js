import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const HireDriverRequestScreen = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [searchLocation, setSearchLocation] = useState("");
    const [markerLocation, setMarkerLocation] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [rentalDuration, setRentalDuration] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            setCurrentLocation({ latitude, longitude });
            setMarkerLocation({ latitude, longitude });
        })();
    }, []);

    const handleSearchLocation = () => {
        // Placeholder for search functionality using APIs like Google Places or VietMap
        console.log("Search location: ", searchLocation);
        setMarkerLocation(currentLocation); // Replace with actual searched location
    };

    const handleSubmit = () => {
        console.log("Hire Details:", {
            markerLocation,
            startTime,
            rentalDuration,
            notes,
        });
        // Add API call or navigation to the next screen
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.mapContainer}>
                {currentLocation ? (
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        onPress={(e) => setMarkerLocation(e.nativeEvent.coordinate)}
                    >
                        {markerLocation && (
                            <Marker
                                coordinate={markerLocation}
                                title="Điểm đón"
                                description="Vị trí bạn đã chọn"
                            />
                        )}
                    </MapView>
                ) : (
                    <Text>Đang tải vị trí...</Text>
                )}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#000" style={styles.icon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm"
                        value={searchLocation}
                        onChangeText={setSearchLocation}
                        onSubmitEditing={handleSearchLocation}
                    />
                </View>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Thời gian bắt đầu dịch vụ *"
                    value={startTime}
                    onChangeText={setStartTime}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Thời gian thuê *"
                    value={rentalDuration}
                    onChangeText={setRentalDuration}
                />
                <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder="Ghi chú *"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Thuê Tài Xế</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFC323",
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    searchBar: {
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 10,
        paddingHorizontal: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 5,
        elevation: 5,
    },
    icon: {
        marginRight: 5,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    inputContainer: {
        backgroundColor: "#FFC323",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    input: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    notesInput: {
        height: 100,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default HireDriverRequestScreen;
