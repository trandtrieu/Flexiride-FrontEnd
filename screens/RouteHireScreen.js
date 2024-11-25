import React, { useState, useEffect, useRef, useContext } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    Alert,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
import { VIETMAP_API_KEY } from "@env";
import { IP_ADDRESS } from "@env";
import { Ionicons } from "@expo/vector-icons";

import axios from "axios";
import polyline from "@mapbox/polyline";
import { ScrollView } from "react-native";
import { Icon } from "react-native-elements";
import { formatCurrency } from "../utils/formatPrice";
import io from "socket.io-client";
import LocationContext from "../provider/LocationCurrentProvider";
const RouteHireScreen = ({ route, navigation }) => {
    // const pickupLocation = {
    //   latitude: 16.011807933073875,
    //   longitude: 108.25719691474046,
    //   name: "Nhà Thờ Đức Bà",
    //   address: "01 Công Xã Paris, Bến Nghé, Quận 1, TP.HCM",
    // };

    const {
        pickupLocation = defaultPickupLocation,
        destinationLocation = defaultDestinationLocation,
    } = route.params || {}

    // const destinationLocation = {
    //   latitude: 10.823099,
    //   longitude: 106.629664,
    //   name: "Sân bay Tân Sơn Nhất",
    //   address: "Trường Sơn, Phường 2, Tân Bình, TP.HCM",
    // };

    const [routeData, setRouteData] = useState(null);
    const [loading, setLoading] = useState(false);
    const mapRef = useRef(null);
    const [services, setServices] = useState([]);
    const [distance, setDistance] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedServicePrice, setSelectedServicePrice] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    const [isContractSigned, setIsContractSigned] = useState(false); // Trạng thái hợp đồng đã ký
    const [showModal, setShowModal] = useState(false); // Hiển thị Modal

    const socket = useRef(null);
    const bookingTimeout = useRef(null);
    const currentLocation = useContext(LocationContext);
    const [selectedMethod, setSelectedMethod] = useState(
        route.params?.selectedMethod || "cash"
    );

    const [note, setNote] = useState(""); // State for storing note
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const openNoteModal = () => setNoteModalVisible(true);

    const images = {
        "bike-icon.png": require("../assets/bike-icon.png"),
        "car-icon.png": require("../assets/car-icon.png"),
    };

    useEffect(() => {
        // Chỉ kết nối socket một lần khi component mount
        socket.current = io(`http://${IP_ADDRESS}:3000`, {
            transports: ["websocket"],
            query: { customerId: "6738dd3df211814d9c027e86" },
        });

        socket.current.on("connect", () => {
            console.log("Customer connected:", socket.current.id);
        });

        // Lắng nghe sự kiện "rideAccepted" từ tài xế
        const handleRideAccepted = (data) => {
            clearTimeout(bookingTimeout.current);
            Alert.alert(
                "Yêu cầu được chấp nhận",
                `Tài xế ${data.driverId} đã nhận chuyến!`
            );
            setIsBooking(false);
        };
        socket.current.on("rideAccepted", handleRideAccepted);

        // Lắng nghe sự kiện "requestExpired" khi yêu cầu hết hạn
        // const handleRequestExpired = () => {
        //   clearTimeout(bookingTimeout.current);
        //   Alert.alert(
        //     "Yêu cầu hết hạn",
        //     "Không có tài xế nào nhận được yêu cầu của bạn."
        //   );
        //   setIsBooking(false);
        // };
        // socket.current.on("requestExpired", handleRequestExpired);

        // Xóa listener khi component unmount
        return () => {
            socket.current.off("rideAccepted", handleRideAccepted);
            // socket.current.off("requestExpired", handleRequestExpired);
            socket.current.disconnect();
        };
    }, []);
    useEffect(() => {
        // Kết nối socket và lắng nghe sự kiện
        socket.current.on("requestExpired", () => {
            clearTimeout(bookingTimeout.current);
            setIsBooking(false);
        });

        return () => {
            socket.current.off("requestExpired");
        };
    }, []);

    useEffect(() => {
        // calculateRoute();
        calculateDistanceAndTime(pickupLocation, destinationLocation);
        fetchServicesAndPrices();
    }, []);
    const calculateRoute = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://maps.vietmap.vn/api/route?apikey=${VIETMAP_API_KEY}&point=${pickupLocation.latitude},${pickupLocation.longitude}&point=${destinationLocation.latitude},${destinationLocation.longitude}&vehicle=car&points_encoded=true`
            );
            const { paths } = response.data;
            const decodedPoints = polyline.decode(paths[0].points);
            const coordinates = decodedPoints.map((point) => ({
                latitude: point[0],
                longitude: point[1],
            }));
            setRouteData(coordinates);

            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        } catch (error) {
            console.error("Error calculating route: ", error);
        }
        setLoading(false);
    };

    const fetchServicesAndPrices = async () => {
        try {
            const response = await axios.get(
                `http://${IP_ADDRESS}:3000/booking-traditional/service-with-prices`,
                {
                    params: {
                        pickupLocation: `${pickupLocation.latitude},${pickupLocation.longitude}`,
                        destinationLocation: `${destinationLocation.latitude},${destinationLocation.longitude}`,
                        isAdvanceBooking: false, // Hoặc điều chỉnh dựa trên yêu cầu thực tế
                        isBadWeather: false, // Hoặc điều chỉnh dựa trên điều kiện thời tiết
                    },
                }
            );
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services and prices:", error);
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };
    const formatCurrency = (amount) => {
        if (!amount) return "Không có giá";
        const numericAmount = parseInt(amount, 10);
        return numericAmount.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };
    const calculateDistanceAndTime = (pickup, destination) => {
        const R = 6371; // Radius of the earth in km
        const dLat = toRad(destination.latitude - pickup.latitude);
        const dLon = toRad(destination.longitude - pickup.longitude);
        const lat1 = toRad(pickup.latitude);
        const lat2 = toRad(destination.latitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceInKm = R * c;

        setDistance(distanceInKm.toFixed(1));

        const averageSpeed = 40;

        const timeInHours = distanceInKm / averageSpeed;
        const timeInMinutes = timeInHours * 60;
        const hours = Math.floor(timeInHours);
        const minutes = Math.round(timeInMinutes % 60);

        if (hours >= 1) {
            setEstimatedTime(`${hours} giờ ${minutes} phút`);
        } else {
            setEstimatedTime(`${minutes} phút`);
        }
    };

    const toRad = (Value) => {
        return (Value * Math.PI) / 180;
    };

    const handleBookingRequest = () => {
        // if (!selectedServiceId) {
        //     alert("Vui lòng chọn một dịch vụ trước khi đặt xe");
        //     return;
        // }

        setIsBooking(true);
        socket.current.emit("customerRequest", {
            customerId: "6738dd3df211814d9c027e86",
            pickupLocation,
            destinationLocation,
            serviceId: selectedServiceId,
            price: selectedServicePrice,
            paymentMethod: selectedMethod,
            note: note || "",
        });

        // Đặt khoảng thời gian chờ phản hồi từ tài xế
        bookingTimeout.current = setTimeout(() => {
            setIsBooking(false);
            Alert.alert(
                "Không có tài xế khả dụng",
                "Hiện không có tài xế nào chấp nhận yêu cầu của bạn."
            );
        }, 15000);
    };
    const handlePaymentMethodPress = () => {
        navigation.navigate("PaymentMethod", {
            selectedMethod,
            onSelectMethod: (method) => setSelectedMethod(method),
        });
    };
    const handleSaveNote = () => {
        Keyboard.dismiss();
        setNoteModalVisible(false);
    };

    const navigateToContractScreen = () => {
        navigation.navigate("ElectronicContract", {
            onContractSigned: () => {
                setIsContractSigned(true); // Cập nhật trạng thái khi hợp đồng được ký
            },
        });
    };

    const handlePress = () => {
        if (!selectedServiceId) {
            Alert.alert('Thông Báo!!', 'Vui lòng chọn một dịch vụ trước khi nhấn "Ký Hợp Đồng"');
            return;
        }
        if (!isContractSigned) {
            navigateToContractScreen(); // Điều hướng đến màn hình ký hợp đồng
        } else {
            handleBookingRequest(); // Thực hiện thuê tài xế
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.backButtonContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                        <Icon name="arrow-back" type="ionicon" color="#000" size={25} />
                    </TouchableOpacity>
                </View>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: pickupLocation.latitude,
                        longitude: pickupLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                        }}
                        pinColor="blue"
                        title="Vị trí của bạn"
                        description="Đây là vị trí hiện tại của bạn"
                    />

                    <Marker
                        coordinate={{
                            latitude: pickupLocation.latitude,
                            longitude: pickupLocation.longitude,
                        }}
                        pinColor="green"
                    >
                        <Callout>
                            <Text>{pickupLocation.name || "Pickup Location"}</Text>
                            <Text>{pickupLocation.address || "Địa điểm đón"}</Text>
                        </Callout>
                    </Marker>

                    <Marker
                        coordinate={{
                            latitude: destinationLocation.latitude,
                            longitude: destinationLocation.longitude,
                        }}
                        pinColor="red"
                    >
                        <Callout>
                            <Text>{destinationLocation.name || "Drop-off Location"}</Text>
                            <Text>{destinationLocation.address || "Địa điểm đến"}</Text>
                        </Callout>
                    </Marker>

                    {/* Route Path */}
                    {routeData && (
                        <Polyline
                            coordinates={routeData}
                            strokeColor="blue"
                            strokeWidth={8}
                        />
                    )}
                </MapView>

                <View style={styles.distanceContainer}>
                    <Text style={styles.distanceText}>Khoảng cách: {distance} km</Text>
                    <Text style={styles.infoText}>
                        Thời gian ước tính: {estimatedTime}
                    </Text>
                </View>
                {/* Option Service */}
                <View style={styles.optionsContainer}>
                    <ScrollView
                        style={styles.rideOptions}
                        showsHorizontalScrollIndicator={false}
                    >
                        {services.length === 0 ? (
                            <ActivityIndicator size="large" color="#00ff00" />
                        ) : (
                            services.map((service) => (
                                <TouchableOpacity
                                    key={service._id}
                                    style={[
                                        styles.option,
                                        service._id === selectedServiceId && styles.selectedOption, // Thêm style cho dịch vụ được chọn
                                    ]}
                                    onPress={() => {
                                        setSelectedServiceId(service._id);
                                        setSelectedServicePrice(service.calculatedFare);
                                    }}
                                >
                                    <View style={styles.optionInfo}>
                                        <Image
                                            source={
                                                images[service.image] ||
                                                require("../assets/car-icon.png")
                                            }
                                            style={styles.serviceIcon}
                                        />
                                        <Text style={styles.optionTitle}>{service.name}</Text>
                                        <Icon
                                            name="user"
                                            type="font-awesome"
                                            style={styles.seatIcon}
                                            size={16}
                                            color={"#FFC323"}
                                        />
                                        <Text style={styles.optionSeats}>{service.seat}</Text>
                                    </View>
                                    <Text style={styles.actualPrice}>
                                        {service.calculatedFare
                                            ? formatCurrency(service.calculatedFare)
                                            : "Không có giá"}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                    <View style={styles.paymentContainer}>
                        <View style={styles.row}>
                            <View style={styles.iconContainer}>
                                <TouchableOpacity
                                    style={styles.methodRow}
                                    onPress={handlePaymentMethodPress}
                                >
                                    <Text style={styles.methodText}>
                                        {selectedMethod === "momo" ? "MoMo" : "Tiền mặt"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.detailsContainer}>
                                <View style={styles.codeRow}>
                                    <Ionicons name="checkmark-circle" size={16} color="green" />
                                    <Text style={styles.codeText}>CLMGBDNALFR17HJDSJ</Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.moreOptions}>
                                <Ionicons name="ellipsis-horizontal" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Payment and Booking */}
                    <View style={styles.paymentOptions}>
                        <TouchableOpacity
                            style={styles.addNoteButton}
                            onPress={() => setNoteModalVisible(true)} // Open modal for note
                        >
                            <Text style={styles.addNoteButtonText}>Thêm Ghi Chú</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.bookButton}
                            // onPress={handleBookingRequest}
                            onPress={handlePress}
                            disabled={isBooking} // Vô hiệu hóa nút khi đang đặt xe
                        >
                            {isBooking ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.bookButtonText}>
                                        {isContractSigned ? "Thuê Tài Xế" : "Ký Hợp Đồng"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Modal
                        visible={noteModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setNoteModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Ghi chú cho tài xế</Text>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={() => setNoteModalVisible(false)}
                                >
                                    <Text style={styles.saveButtonText}>Lưu Ghi Chú</Text>
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.noteInput}
                                    placeholder="Nhập ghi chú..."
                                    value={note}
                                    onChangeText={setNote}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveNote}
                                >
                                    <Text style={styles.saveButtonText}>Lưu Ghi Chú</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButtonContainer: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 2,
    },
    backButton: {
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 50,
        elevation: 3,
    },
    map: {
        flex: 3,
    },
    optionsContainer: {
        flex: 3,
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    rideOptions: {
        flex: 1,
        marginBottom: 10,
    },
    option: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    selectedOption: {
        backgroundColor: "#e0f7fa", // Màu nền cho dịch vụ được chọn
        borderColor: "#00796B", // Đổi màu đường viền nếu muốn
    },
    optionInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    optionTitle: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: "bold",
    },
    optionSeats: {
        marginLeft: 4,
        fontSize: 12,
        color: "#555",
    },
    seatIcon: {
        marginLeft: 10,
        fontSize: 8,
        color: "#555",
    },
    optionPrice: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    discountPrice: {
        fontSize: 12,
        textDecorationLine: "line-through",
        color: "#888",
    },
    actualPrice: {
        fontSize: 13,
        color: "#000",
    },
    paymentOptions: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    bookNowButton: {
        backgroundColor: "#E0F7FA",
        padding: 15,
        borderRadius: 40,
        marginRight: 10,
        flex: 1,
        alignItems: "center",
    },
    bookNowText: {
        color: "#00796B",
        fontSize: 16,
        fontWeight: "bold",
    },
    bookButton: {
        backgroundColor: "#00BFA5",
        padding: 15,
        borderRadius: 40,
        flex: 1,
        alignItems: "center",
    },

    bookButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    serviceIcon: {
        width: 40,
        height: 40,
    },
    distanceContainer: {
        padding: 10,
        backgroundColor: "#ccc",
        alignItems: "center",
    },
    distanceText: {
        fontSize: 14,
    },
    infoText: {
        fontSize: 14,
    },
    paymentContainer: {
        padding: 10,
        alignItems: "center",
        flexDirection: "row",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconContainer: {
        paddingRight: 10,
    },
    detailsContainer: {
        flex: 1,
    },
    methodText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    codeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    codeText: {
        fontSize: 14,
        color: "gray",
        marginLeft: 4,
    },
    moreOptions: {
        paddingLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    noteInput: {
        width: "100%",
        height: 100,
        borderColor: "#ccc",
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        textAlignVertical: "top",
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: "#00BFA5",
        padding: 10,
        borderRadius: 5,
        width: "100%",
        alignItems: "center",
    },
    saveButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    addNoteButton: {
        backgroundColor: "#E0F7FA",
        padding: 15,
        borderRadius: 40,
        marginRight: 10,
        alignItems: "center",
    },
    addNoteButtonText: {
        color: "#00796B",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default RouteHireScreen;
