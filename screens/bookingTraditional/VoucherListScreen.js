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
import { Ionicons } from "@expo/vector-icons";

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
      const fetchedVouchers = response.data;

      // Sắp xếp voucher: khả dụng lên đầu
      const sortedVouchers = fetchedVouchers.sort((a, b) => {
        const isApplicableA =
          a.applicable_service_options.some(
            (service) => service._id === serviceId
          ) && price >= a.min_order_value;
        const isApplicableB =
          b.applicable_service_options.some(
            (service) => service._id === serviceId
          ) && price >= b.min_order_value;

        // Nếu A khả dụng mà B không khả dụng, A lên trước
        if (isApplicableA && !isApplicableB) return -1;
        // Nếu B khả dụng mà A không khả dụng, B lên trước
        if (!isApplicableA && isApplicableB) return 1;
        // Giữ nguyên thứ tự nếu cả hai cùng khả dụng hoặc không khả dụng
        return 0;
      });

      setVouchers(sortedVouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const applyVoucher = async (voucher) => {
    if (voucher.isUsed) {
      Alert.alert("Thông báo", "Voucher này đã được sử dụng!");
      return;
    }

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

        // Đánh dấu voucher là đã được sử dụng
        const updatedVouchers = vouchers.map((v) =>
          v._id === voucher._id ? { ...v, isUsed: true } : v
        );
        setVouchers(updatedVouchers);

        navigation.goBack();
      }
    } catch (error) {
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

    // Kiểm tra serviceId có trong danh sách applicable_service_options hay không
    const isApplicable = item.applicable_service_options.some(
      (service) => service._id === serviceId
    );

    // Kiểm tra nếu giá dịch vụ thấp hơn điều kiện tối thiểu
    const isPriceEligible = price >= item.min_order_value;

    return (
      <View
        style={[
          styles.voucherCard,
          (!isApplicable || !isPriceEligible) && styles.voucherCardDisabled, // Làm mờ nếu không áp dụng được
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="gift-outline" size={24} color="#FFC107" />
            <Text style={styles.voucherTitle}>{item.name}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.cardBody}>
          <Text style={styles.voucherValue}>
            Giảm {formatCurrency(item.value)}
          </Text>
          <Text style={styles.voucherDescription}>{item.description}</Text>
          {item.min_order_value > 0 && (
            <Text style={styles.voucherCondition}>
              Áp dụng đơn tối thiểu: {formatCurrency(item.min_order_value)}
            </Text>
          )}
          <Text style={styles.voucherServices}>
            {item.applicable_service_options.length > 0
              ? "Dịch vụ áp dụng:"
              : "Không có dịch vụ áp dụng"}
          </Text>
          {item.applicable_service_options.map((service) => (
            <Text key={service._id} style={styles.serviceName}>
              - {service.name || "Không rõ"}
            </Text>
          ))}
        </View>

        {/* Footer */}
        <TouchableOpacity
          style={[
            styles.applyButton,
            (!isApplicable || !isPriceEligible) && styles.applyButtonDisabled, // Làm mờ nút nếu không phù hợp
          ]}
          onPress={() => isApplicable && isPriceEligible && applyVoucher(item)} // Chỉ cho phép áp dụng nếu điều kiện thỏa mãn
          disabled={!isApplicable || !isPriceEligible} // Vô hiệu hóa nút nếu không phù hợp
        >
          <Text
            style={[
              styles.applyButtonText,
              (!isApplicable || !isPriceEligible) &&
                styles.applyButtonTextDisabled,
            ]}
          >
            {isApplicable && isPriceEligible
              ? "Áp dụng ngay"
              : "Không khả dụng"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh Sách Các Ưu Đãi</Text>
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
    backgroundColor: "#f0f4f7",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  voucherCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden",
  },
  voucherCardDisabled: {
    opacity: 0.5, // Làm mờ nếu không áp dụng được
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#E3F2FD",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
    marginLeft: 10,
  },
  voucherValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF7043",
  },
  cardBody: {
    padding: 15,
  },
  voucherDescription: {
    fontSize: 14,
    color: "#555",
    // marginBottom: 10,
  },
  voucherCondition: {
    fontSize: 13,
    color: "#333",
    marginBottom: 10,
    fontStyle: "italic",
  },
  voucherServices: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 13,
    color: "#555",
    marginLeft: 10,
    marginBottom: 2,
    fontStyle: "italic",
  },
  voucherQuantity: {
    fontSize: 13,
    color: "#FF7043",
    marginTop: 10,
    textAlign: "right",
  },
  applyButton: {
    backgroundColor: "#FFC107",
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  applyButtonDisabled: {
    backgroundColor: "#ddd", // Màu nút khi không khả dụng
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  applyButtonTextDisabled: {
    color: "#aaa", // Màu chữ khi không khả dụng
  },
});

export default VoucherListScreen;
