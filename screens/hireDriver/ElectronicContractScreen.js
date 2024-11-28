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
        Bên khách hàng:
        Họ và tên: Phạm Hưng Thịnh
        Giới tính: Nam
        Số điện thoại: 0708171467
        Địa chỉ: Hải Châu, Đà Nẵng
        --------------------------
        Bên tài xế:
        Họ và tên: Nguyễn Văn Anh
        Giới tính: Nam
        Số điện thoại: 0935536285
        Địa chỉ: Hoà Hải, Ngũ Hành Sơn, Đà Nẵng

        Thoả thuận ký hợp đồng điện tử và cam kết làm đúng những điều khoản sau đây:

        1. Trách nhiệm và Nghĩa vụ của Tài xế
Nghĩa vụ trong suốt dịch vụ: Tài xế phải tuân thủ luật giao thông, đảm bảo an toàn cho khách hàng và phương tiện của khách hàng. Phải lái xe an toàn, không sử dụng chất kích thích hoặc đồ uống có cồn trong quá trình làm việc, đồng thời tôn trọng quyền riêng tư và lịch trình của khách hàng.
Chi phí phát sinh do vi phạm giao thông: Mọi vi phạm giao thông do lỗi của tài xế sẽ do tài xế tự chịu trách nhiệm.

        2. Quyền và Trách nhiệm của Khách hàng
Trách nhiệm đảm bảo dịch vụ suôn sẻ: Khách hàng phải đảm bảo xe sẵn sàng sử dụng, cung cấp các thông tin cần thiết về lịch trình, điểm đến, và đảm bảo phương tiện trong trạng thái vận hành tốt.
Quyền yêu cầu bồi thường: Nếu tài xế vi phạm các điều khoản trong hợp đồng, khách hàng có quyền yêu cầu hoàn lại tiền hoặc bồi thường nếu có thiệt hại. Tuy nhiên, mức bồi thường sẽ được quyết định dựa trên quy định của hệ thống FRide.

        3. Phạm vi Dịch vụ
Trách nhiệm trong dịch vụ thuê tài xế: Dịch vụ bao gồm việc đưa đón, điều khiển phương tiện cho khách hàng và các nhu cầu bổ sung liên quan đến di chuyển. Dịch vụ không bao gồm các nhiệm vụ cá nhân khác như vận chuyển hàng hóa riêng của tài xế.
Giới hạn về thời gian và phạm vi di chuyển: Dịch vụ chỉ áp dụng trong phạm vi các tỉnh Đà Nẵng và khu vực lân cận, và thời gian làm việc sẽ được quy định trong ứng dụng.

        4. Sự cố và Tranh chấp
Trách nhiệm khi xảy ra sự cố: Nếu có tai nạn hoặc sự cố kỹ thuật trong lúc tài xế điều khiển phương tiện, tài xế sẽ chịu trách nhiệm. Trong trường hợp đặc biệt, hệ thống sẽ xem xét hỗ trợ giải quyết.
Giải quyết tranh chấp: Tranh chấp sẽ được xử lý thông qua đội ngũ hỗ trợ khách hàng của FRide.

        Hai bên liên quan sẽ đồng ý và thoả thuận cam kết như trên.

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
                    <Text>1. Trách nhiệm và Nghĩa vụ của Tài xế
                        Nghĩa vụ trong suốt dịch vụ: Tài xế phải tuân thủ luật giao thông, đảm bảo an toàn cho khách hàng và phương tiện của khách hàng. Phải lái xe an toàn, không sử dụng chất kích thích hoặc đồ uống có cồn trong quá trình làm việc, đồng thời tôn trọng quyền riêng tư và lịch trình của khách hàng.
                        Chi phí phát sinh do vi phạm giao thông: Mọi vi phạm giao thông do lỗi của tài xế sẽ do tài xế tự chịu trách nhiệm.</Text>
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
