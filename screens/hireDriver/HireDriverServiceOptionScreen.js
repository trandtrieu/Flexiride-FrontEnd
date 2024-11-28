import React from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../layouts/BottomNavigation";
import ServiceIcons from "../layouts/ServiceIcons";
import { useAuth } from "../../provider/AuthProvider";

const HireDriverServiceOption = ({ navigation }) => {
    const { authState } = useAuth();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.qrButton}>
                        <Ionicons name="qr-code-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Tìm kiếm"
                        placeholderTextColor="#888"
                    />
                    <TouchableOpacity style={styles.heartButton}>
                        <Ionicons name="heart-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <ServiceIcons />
                {/* Dịch vụ tài xế cá nhân */}
                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("ElectronicContract")}
                        >
                            <Text style={styles.serviceText}>Dịch vụ tài xế cá nhân</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Dịch vụ đón khách */}
                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("")}
                        >
                            <Text style={styles.serviceText}>Dịch vụ đón khách</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Dịch vụ sự kiện */}
                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("")}
                        >
                            <Text style={styles.serviceText}>Dịch vụ sự kiện</Text>
                        </TouchableOpacity>
                    </View>
                </View>



            </ScrollView>

            <BottomNavigation navigation={navigation} />
        </View>
    );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        paddingBottom: 80, // Thêm khoảng trống dưới cùng để tránh bị chồng lấp bởi bottom navigation
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#FFD700",
    },
    qrButton: {
        padding: 10,
    },
    searchBar: {
        flex: 1,
        marginHorizontal: 10,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: "#fff",
    },
    heartButton: {
        padding: 10,
    },
    servicesContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 20,
    },
    serviceItem: {
        alignItems: "center",
    },
    serviceIcon: {
        width: 50,
        height: 50,
        marginBottom: 5,
    },
    serviceText: {
        fontSize: 12,
    },
    cardsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    card: {
        width: width * 0.45,
        height: 80,
        backgroundColor: "#F3F3F3",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
    },
    cardTitle: {
        fontWeight: "bold",
        fontSize: 16,
    },
    cardSubTitle: {
        fontSize: 12,
        color: "#666",
    },
    bookNowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    bookNowTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    promotionsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    promotionItem: {
        width: width * 0.45,
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        elevation: 2,
    },
    promotionImage: {
        width: "100%",
        height: 120,
    },
    promotionText: {
        fontSize: 14,
        padding: 10,
    },
    promotionDate: {
        fontSize: 12,
        paddingHorizontal: 10,
        color: "#888",
    },
});

export default HireDriverServiceOption;
