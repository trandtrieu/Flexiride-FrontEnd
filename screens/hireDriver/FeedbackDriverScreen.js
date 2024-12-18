import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { IP_ADDRESS } from "@env";

const FeedbackDriverScreen = ({ route, navigation }) => {
    const { driverId, customerId } = route.params; // Lấy ID tài xế và khách hàng từ navigation params

    const [content, setContent] = useState("");
    const [rate, setRate] = useState(0); // Mặc định là 0 sao


    console.log("account_id:", customerId);
    console.log("driver_id:", driverId);
    console.log("content:", content);
    console.log("rate:", rate);


    const handleSubmitFeedback = async () => {
        try {
            const response = await axios.post(`https://flexiride.onrender.com/review/create`, {
                account_id: customerId,
                driver_id: driverId,
                content,
                rate,
            });

            if (response.status === 201) {
                Alert.alert("Thành công", "Đánh giá của bạn đã được gửi.");
                navigation.navigate("Home"); // Quay lại màn hình home
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            Alert.alert("Lỗi", "Gửi đánh giá thất bại.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đánh giá tài xế</Text>

            <Text style={styles.label}>Nội dung đánh giá</Text>
            <TextInput
                style={styles.input}
                multiline
                placeholder="Viết đánh giá của bạn..."
                value={content}
                onChangeText={setContent}
            />

            <Text style={styles.label}>Đánh giá số sao</Text>
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRate(star)}>
                        <Ionicons
                            name={rate >= star ? "star" : "star-outline"}
                            size={32}
                            color="#FFD700"
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        backgroundColor: "#FFF",
        height: 100,
    },
    starsContainer: {
        flexDirection: "row",
        marginVertical: 10,
        justifyContent: "center",
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default FeedbackDriverScreen;
