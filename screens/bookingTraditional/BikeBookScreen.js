import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import BottomNavigation from "../layouts/BottomNavigation";
import ServiceIcons from "../layouts/ServiceIcons";

// Sample Data for locations and static content
const locations = [
  {
    id: "1",
    address: "Lô 181 Nguyễn Xiển",
    subAddress: "Lô 181 Nguyen Xien St., P. Hòa Hải, Q. ...",
  },
  {
    id: "2",
    address: "180 Xô Viết Nghệ Tĩnh",
    subAddress: "180 Xô Viết Nghệ Tĩnh, P. Hòa Cường...",
  },
  {
    id: "3",
    address: "143 Trần Bạch Đằng",
    subAddress: "143 Tran Bach Dang St., P. Mỹ An, Q. ...",
  },
];

// Static content component
const StaticContent = ({ navigation }) => (
  <>
    {/* Location */}
    <View style={styles.locationContainer}>
      <Text style={styles.text}>Đón bạn tại</Text>
      <TouchableOpacity>
        <Text style={styles.locationText}>
          Tạp Hóa Tứ Vang{" "}
          <Ionicons name="chevron-down-outline" size={15} color="black" />
        </Text>
      </TouchableOpacity>
    </View>

    {/* Menu Tabs */}
    <ServiceIcons />

    {/* Search Box */}
    <TouchableOpacity
      style={styles.searchContainer}
      onPress={() => navigation.navigate("LocationPicker")}
    >
      <Ionicons name="location-outline" size={24} color="red" />
      <TextInput
        placeholder="Đến đâu?"
        style={styles.searchInput}
        editable={false}
      />
    </TouchableOpacity>

    {/* Ride Options */}
    <Text style={styles.optionsHeader}>Đa dạng lựa chọn di chuyển ch...</Text>
    <View style={styles.optionsContainer}>
      <View style={styles.option}>
        <FontAwesome5 name="car" size={24} color="green" />
        <Text style={styles.optionText}>Di chuyển nhóm th...</Text>
      </View>
      <View style={styles.option}>
        <FontAwesome5 name="car" size={24} color="green" />
        <Text style={styles.optionText}>Xe rộng hiện đại</Text>
      </View>
      <View style={styles.option}>
        <FontAwesome5 name="user-tie" size={24} color="green" />
        <Text style={styles.optionText}>Thuê xe cùng tài...</Text>
      </View>
    </View>
  </>
);

export default function BikeBook({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={<StaticContent navigation={navigation} />}
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.locationItem}>
            <Text style={styles.locationTitle}>{item.address}</Text>
            <Text style={styles.locationSubtitle}>{item.subAddress}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.scrollContent}
      />
      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  locationContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    margin: 20,
  },
  text: {
    fontSize: 16,
  },
  locationText: {
    fontWeight: "bold",
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
    marginHorizontal: 20,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  locationItem: {
    padding: 20,
    backgroundColor: "#fff",
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 5,
  },
  locationTitle: {
    fontWeight: "bold",
  },
  locationSubtitle: {
    color: "#555",
  },
  optionsHeader: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 20,
  },
  option: {
    alignItems: "center",
  },
  optionText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 80,
  },
});
