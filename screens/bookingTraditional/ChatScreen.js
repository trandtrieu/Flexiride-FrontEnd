import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  Linking,
  Alert,
  PermissionsAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import io from "socket.io-client";
import { IP_ADDRESS } from "@env"; // Thay bằng địa chỉ IP backend của bạn
import axios from "axios";
import call from "react-native-phone-call"; // Import thư viện hỗ trợ gọi điện
import { Platform } from "react-native";

const ChatScreenCustomer = ({ route, navigation }) => {
  const { roomId, userId, driverId } = route.params;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [quickTextModalVisible, setQuickTextModalVisible] = useState(false);
  const socket = useRef(null);
  const [driverDetails, setDriverDetails] = useState({});

  // Mảng tin nhắn mẫu cho khách hàng
  const quickTexts = [
    "Chào anh/chị, vui lòng đợi tôi một chút.",
    "Anh/chị có thể đến địa điểm này giúp tôi được không?",
    "Tôi sẽ có mặt sau ít phút nữa.",
    "Cảm ơn anh/chị đã đợi!",
  ];

  useEffect(() => {
    socket.current = io(`https://flexiride.onrender.com`, {
      transports: ["websocket"],
      query: { userId },
    });

    // Tham gia vào phòng chat
    socket.current.emit("joinChat", roomId);

    // Lắng nghe tin nhắn đến
    socket.current.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [roomId]);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `https://flexiride.onrender.com/booking-traditional/messages/${roomId}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [roomId]);
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        roomId,
        message: newMessage,
        senderId: userId,
        receiverId: driverId,
        timestamp: new Date().toISOString(),
      };
      console.log("data send ", messageData);

      // Emit the message to the server
      socket.current.emit("sendMessage", messageData);
      setNewMessage("");
    }
  };

  const handleQuickTextSelect = (text) => {
    setNewMessage(text);
    setQuickTextModalVisible(false);
  };

  const renderMessage = ({ item }) => {
    const isUserMessage = item.senderId === userId;
    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };
  useEffect(() => {
    const fetchDriverLocation = async () => {
      try {
        const response = await axios.get(
          `https://flexiride.onrender.com/booking-traditional/location/driver/${driverId}`
        );
        if (response.data && response.data.location) {
          console.log("Driver Location Data:", response.data);
          setDriverDetails(response.data.driverDetails);
        }
      } catch (error) {
        console.error("Error fetching driver location: ", error);
      }
    };
    fetchDriverLocation();
    requestCallPermission();
  }, [driverId]);
  const requestCallPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        {
          title: "Cấp quyền gọi điện",
          message: "Ứng dụng cần quyền để thực hiện cuộc gọi khẩn cấp.",
          buttonPositive: "Đồng ý",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleCall = async (phoneNumber) => {
    const hasPermission =
      Platform.OS === "android" ? await requestCallPermission() : true;

    if (!hasPermission) {
      Alert.alert("Lỗi", "Ứng dụng chưa được cấp quyền gọi điện.");
      return;
    }

    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Lỗi", "Thiết bị của bạn không hỗ trợ gọi điện.");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi gọi điện:", err);
        Alert.alert("Lỗi", `Không thể thực hiện cuộc gọi: ${err.message}`);
      });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image source={{ uri: driverDetails.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.otherUserName}>Tài xế: {driverDetails.name}</Text>
          <Text style={styles.otherUserVehicle}>
            {driverDetails.vehiclePlate}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleCall(driverDetails.phoneNumber)}>
          <Ionicons name="call" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={
          <View style={styles.emptyMessageContainer}>
            <Text style={styles.emptyMessageText}>
              Hiện chưa có tin nhắn nào. Nhấn vào nút '+' để chọn tin nhắn mẫu
              và bắt đầu trò chuyện!
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={() => setQuickTextModalVisible(true)}
          style={styles.messageTemplate}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal tin nhắn mẫu */}
      <Modal
        transparent={true}
        visible={quickTextModalVisible}
        animationType="slide"
        onRequestClose={() => setQuickTextModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn tin nhắn mẫu</Text>
            {quickTexts.map((text, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickTextSelect(text)}
                style={styles.quickTextOption}
              >
                <Text style={styles.quickText}>{text}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setQuickTextModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 17,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  userInfo: { marginLeft: 10, flex: 1 },
  otherUserName: { fontSize: 18, color: "white", fontWeight: "bold" },
  otherUserVehicle: { fontSize: 14, color: "white" },
  messagesContainer: { paddingHorizontal: 15, paddingVertical: 10 },
  messageContainer: {
    maxWidth: "70%",
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  messageText: { fontSize: 16 },
  timestamp: {
    fontSize: 10,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
  },
  messageTemplate: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 20,
    marginRight: 5,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 20,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  quickTextOption: {
    paddingVertical: 10,
  },
  quickText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  emptyMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyMessageText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});

export default ChatScreenCustomer;
