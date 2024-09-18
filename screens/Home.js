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

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
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

        {/* Service Icons */}
        <View style={styles.servicesContainer}>
          <TouchableOpacity style={styles.serviceItem}>
            <Image
              source={require("../assets/bike-icon.png")}
              style={styles.serviceIcon}
            />
            <Text style={styles.serviceText}>Xe máy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceItem}>
            <Image
              source={require("../assets/car-icon.png")}
              style={styles.serviceIcon}
            />
            <Text style={styles.serviceText}>Ô tô</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceItem}>
            <Image
              source={require("../assets/hire-driver-icon.png")}
              style={styles.serviceIcon}
            />
            <Text style={styles.serviceText}>Thuê tài xế</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceItem}>
            <Image
              source={require("../assets/car-pool-icon.png")}
              style={styles.serviceIcon}
            />
            <Text style={styles.serviceText}>Xe ghép</Text>
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Activate</Text>
            <Text style={styles.cardSubTitle}>FRidePay</Text>
            <Ionicons name="wallet-outline" size={24} color="green" />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Use Points</Text>
            <Text style={styles.cardSubTitle}>758</Text>
            <Ionicons name="wallet-outline" size={24} color="blue" />
          </View>
        </View>

        {/* Book Now Section */}
        <View style={styles.bookNowContainer}>
          <Text style={styles.bookNowTitle}>ĐẶT XE NGAY</Text>
          <Ionicons name="arrow-forward-outline" size={24} color="black" />
        </View>

        {/* Promotion Section */}
        <View style={styles.promotionsContainer}>
          <TouchableOpacity style={styles.promotionItem}>
            <Image
              source={require("../assets/ad-01.png")}
              style={styles.promotionImage}
            />
            <Text style={styles.promotionText}>
              Order mooncakes to gift & to enjoy
            </Text>
            <Text style={styles.promotionDate}>Until 21 Sep</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.promotionItem}>
            <Image
              source={require("../assets/ad-02.png")}
              style={styles.promotionImage}
            />
            <Text style={styles.promotionText}>
              Plus an EXTRA $20 OFF on groceries
            </Text>
            <Text style={styles.promotionDate}>Until 31 Aug</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#FFD700" />
          <Text style={styles.navText}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="document-text-outline" size={24} color="black" />
          <Text style={styles.navText}>Hoạt động</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="card-outline" size={24} color="black" />
          <Text style={styles.navText}>Thanh toán</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Text style={styles.navText}>Tín nhắn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="black" />
          <Text style={styles.navText}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
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
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopColor: "#DDD",
    borderTopWidth: 1,
    position: "absolute", // Đặt ở cuối màn hình
    bottom: 0, // Căn nó xuống dưới cùng
    width: "100%", // Đảm bảo chiếm toàn bộ chiều rộng
    height: 60, // Chiều cao cố định cho bottom navigation
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: "#333",
  },
});

export default Home;
