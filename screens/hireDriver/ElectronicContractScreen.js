import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, TouchableOpacity } from 'react-native';
import Signature from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons'; // Biểu tượng back
import { IP_ADDRESS } from "@env";
const ElectronicContractScreen = ({ navigation, route }) => {
    const signatureRef = useRef(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const { onContractSigned } = route.params || {};


    const handleOK = async (signature) => {
        // console.log('Chữ ký:', signature);

        // Thực hiện gửi chữ ký lên server tại đây
        if (!signature) {
            Alert.alert("Lỗi", "Không thể lấy chữ ký.");
            return;
        }
        // Nội dung hợp đồng
        const contractDetails = `
        Họ và tên khách hàng: Phạm Hưng Thịnh
        Địa chỉ: Hải Châu, Đà Nẵng
        Họ và tên tài xế: Nguyễn Văn Anh
        Nội dung hợp đồng: ... (điều khoản ở đây)
    `;

        // Gọi API gửi email
        try {
            const response = await fetch(`http://${IP_ADDRESS}:3000/driver/send-contract`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "thinhph9@gmail.com", // Thay bằng email khách hàng thực tế
                    contractDetails,
                    signatureBase64: signature.replace(/^data:image\/\w+;base64,/, ""), // Chỉ lấy phần Base64
                }),
            });

            const responseData = await response.json(); // Lấy dữ liệu từ API

            if (response.ok) {
                Alert.alert("Thành công", "Hợp đồng đã được gửi qua email!");
            } else {
                console.error("Backend Error: ", responseData.error); // In lỗi từ backend
                Alert.alert("Lỗi", "Không thể gửi hợp đồng qua email: " + responseData.error);
            }
        } catch (error) {
            console.error("Frontend Error: ", error.message); // In lỗi tại frontend
            Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi email. Chi tiết: " + error.message);
        }

        if (onContractSigned) onContractSigned(); // Cập nhật trạng thái hợp đồng đã ký
        navigation.goBack(); // Quay lại màn hình trước đó
    };

    const handleEmpty = () => {
        Alert.alert('Lỗi', 'Vui lòng ký tên trước khi xác nhận!');
    };

    const handleSubmit = () => {
        signatureRef.current.readSignature();
    };

    const handleDrag = (dragging) => {
        // Tắt cuộn khi bắt đầu ký và bật lại sau khi ký xong
        setScrollEnabled(!dragging);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hợp Đồng Điện Tử</Text>
            </View>
            <ScrollView
                scrollEnabled={scrollEnabled}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>HỢP ĐỒNG ĐIỆN TỬ</Text>
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Bên khách hàng:</Text>
                    <Text>Họ và tên: Phạm Hưng Thịnh</Text>
                    <Text>Giới tính: Nam</Text>
                    <Text>Số điện thoại: 0708171467</Text>
                    <Text>Địa chỉ: Hải Châu, Đà Nẵng</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Bên tài xế:</Text>
                    <Text>Họ và tên: Nguyễn Văn Anh</Text>
                    <Text>Giới tính: Nam</Text>
                    <Text>Số điện thoại: 0935536285</Text>
                    <Text>Địa chỉ: Hòa Hải, Ngũ Hành Sơn, Đà Nẵng</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Điều khoản:</Text>
                    <Text>1. Trách nhiệm và Nghĩa vụ của Tài xế...</Text>
                    <Text>2. Quyền và Trách nhiệm của Khách hàng...</Text>
                    <Text>3. Phạm vi Dịch vụ...</Text>
                    <Text>4. Sự cố và Tranh chấp...</Text>
                </View>
                <Text style={styles.subtitle}>Ký tên:</Text>
                <View style={styles.signatureContainer}>
                    <Signature
                        ref={signatureRef}
                        onOK={handleOK}
                        onEmpty={handleEmpty}
                        descriptionText="Ký tên tại đây"
                        clearText="Xóa"
                        confirmText="Xác nhận"
                        webStyle={styles.signaturePad}
                        onBegin={() => handleDrag(true)} // Khi bắt đầu ký
                        onEnd={() => handleDrag(false)}  // Khi kết thúc ký
                    />
                </View>
                <Button title="Xác Nhận" onPress={handleSubmit} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFBEA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
    },
    section: {
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8,
        marginLeft: 8,
    },
    signatureContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
        height: 300, // Kích thước vùng ký
        marginBottom: 16,
        marginHorizontal: 16,
    },
    signaturePad: `
    .m-signature-pad {
      box-shadow: none; 
      border: none; 
    }
    .m-signature-pad--body {
      border: 1px solid #000;
    }
    .m-signature-pad--footer {
      display: none;
    }
  `,
});

export default ElectronicContractScreen;
