import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { CheckBox } from "react-native-elements";

const TermsScreen = ({ route }) => {
    const { onAccept } = route.params; // Nhận callback từ màn hình chính
    const [isChecked, setIsChecked] = useState(false);

    const handleAccept = () => {
        if (!isChecked) {
            Alert.alert(
                "Thông báo",
                "Bạn cần đồng ý với điều khoản trước khi xác nhận."
            );
            return;
        }
        onAccept(); // Gọi callback khi xác nhận
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Điều Khoản Dịch Vụ</Text>

                <Text style={styles.sectionTitle}>1. Trách nhiệm và Nghĩa vụ của Tài xế</Text>
                <Text style={styles.text}>
                    • Nghĩa vụ trong suốt dịch vụ: Tài xế phải tuân thủ luật giao thông, đảm bảo an toàn cho khách hàng và phương tiện của khách hàng. Phải lái xe an toàn, không sử dụng chất kích thích hoặc đồ uống có cồn trong quá trình làm việc, đồng thời tôn trọng quyền riêng tư và lịch trình của khách hàng.
                </Text>
                <Text style={styles.text}>
                    • Chi phí phát sinh do vi phạm giao thông: Mọi vi phạm giao thông do lỗi của tài xế sẽ do tài xế tự chịu trách nhiệm.
                </Text>

                <Text style={styles.sectionTitle}>2. Quyền và Trách nhiệm của Khách hàng</Text>
                <Text style={styles.text}>
                    • Trách nhiệm đảm bảo dịch vụ suôn sẻ: Khách hàng phải đảm bảo xe sẵn sàng sử dụng, cung cấp các thông tin cần thiết về lộ trình, điểm đến, và đảm bảo phương tiện trong trạng thái vận hành tốt.
                </Text>
                <Text style={styles.text}>
                    • Quyền yêu cầu bồi thường: Nếu tài xế vi phạm các điều khoản trong hợp đồng, khách hàng có quyền yêu cầu hoàn lại tiền hoặc bồi thường mọi tổn thất. Tuy nhiên, mức bồi thường sẽ được quyết định dựa trên quy định của hệ thống Fride.
                </Text>

                <Text style={styles.sectionTitle}>3. Điều kiện sử dụng</Text>
                <Text style={styles.text}>
                    • Khách hàng phải trên 18 tuổi để sử dụng dịch vụ.
                </Text>
                <Text style={styles.text}>
                    • Cả tài xế và khách hàng phải cung cấp thông tin chính xác khi đăng ký và sử dụng ứng dụng.
                </Text>
                <Text style={styles.text}>
                    • Hệ thống Fride không chịu trách nhiệm đối với các vấn đề phát sinh do việc sử dụng dịch vụ sai mục đích.
                </Text>


                <CheckBox
                    title="Tôi đã đọc đồng ý với điều khoản và dịch vụ"
                    checked={isChecked}
                    onPress={() => setIsChecked(!isChecked)}
                    containerStyle={styles.checkbox}
                />
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={handleAccept}>
                <Text style={styles.buttonText}>Xác Nhận</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#FFD700",
    },
    content: {
        paddingBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 10,
    },
    checkbox: {
        marginTop: 20,
        backgroundColor: "transparent",
        borderWidth: 0,
    },
    button: {
        backgroundColor: "#6A0DAD",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default TermsScreen;
