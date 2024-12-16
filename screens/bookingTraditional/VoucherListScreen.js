import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { IP_ADDRESS } from "@env";

const VoucherListScreen = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();

  const { price, serviceId } = route.params;

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/vouchers`
      );
      setVouchers(response.data);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const applyVoucher = async (voucher) => {
    try {
      const { serviceId, price, updatePrice } = route.params;

      const response = await axios.post(
        `https://flexiride.onrender.com/vouchers/apply`,
        {
          voucherId: voucher._id,
          serviceId,
          price,
        }
      );

      if (response.status === 200) {
        const { finalPrice, discount } = response.data;

        updatePrice(finalPrice); // Cập nhật giá trên RouteScreen
        Alert.alert(
          "Thành công",
          `Voucher đã được áp dụng! Bạn được giảm ${discount.toLocaleString(
            "vi-VN"
          )}`
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error applying voucher:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể áp dụng voucher."
      );
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Không có giá";
    const numericAmount = parseInt(amount, 10);
    return numericAmount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  const renderVoucher = ({ item }) => {
    const remainingQuantity = item.total_quantity - item.used_quantity;

    return (
      <View style={styles.voucherCard}>
        <Text style={styles.voucherTitle}>{item.name}</Text>
        <Text style={styles.voucherDescription}>{item.description}</Text>
        <Text style={styles.voucherValue}>
          Giảm: {formatCurrency(item.value)}
        </Text>

        {item.min_order_value > 0 && (
          <Text style={styles.voucherCondition}>
            Giá trị tối thiểu: {formatCurrency(item.min_order_value)}
          </Text>
        )}
        <Text style={styles.voucherServices}>Dịch vụ áp dụng:</Text>
        {item.applicable_service_options.map((service) => (
          <Text key={service._id} style={styles.serviceName}>
            - {service.name || "Không rõ"}
          </Text>
        ))}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => applyVoucher(item)}
        >
          <Text style={styles.applyButtonText}>Áp dụng</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách Voucher</Text>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item._id}
          renderItem={renderVoucher}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  voucherCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  voucherDescription: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
  },
  voucherValue: {
    fontSize: 14,
    color: "#007bff",
    marginBottom: 5,
  },
  applyButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  voucherStatus: (status) => ({
    fontSize: 14,
    color:
      status === "active" ? "green" : status === "expired" ? "red" : "orange",
    fontWeight: "bold",
    marginTop: 5,
  }),
  voucherDates: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  voucherQuantity: {
    fontSize: 14,
    color: "#ff5722",
    marginTop: 5,
  },
  voucherCondition: {
    fontSize: 14,
    color: "#007bff",
    marginTop: 5,
  },
  voucherServices: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    marginTop: 5,
  },
  serviceName: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
    marginTop: 2,
    fontStyle: "italic",
  },
});

export default VoucherListScreen;
