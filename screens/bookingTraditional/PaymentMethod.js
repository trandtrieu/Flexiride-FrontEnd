import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { RadioButton, Divider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentMethodsScreen({ route, navigation }) {
  const [selectedMethod, setSelectedMethod] = useState(
    route.params?.selectedMethod || "momo"
  );

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    route.params?.onSelectMethod(method);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Phương thức thanh toán </Text>
      </View>
      <Text style={styles.subtitle}>Các phương thức được liên kết</Text>

      <View style={styles.option}>
        <TouchableOpacity
          onPress={() => handleSelectMethod("momo")}
          style={styles.methodRow}
        >
          <Ionicons name="logo-usd" size={24} color="#A626D3" />
          <Text style={styles.methodText}>MoMo</Text>
          <RadioButton
            value="momo"
            status={selectedMethod === "momo" ? "checked" : "unchecked"}
          />
        </TouchableOpacity>
      </View>

      <Divider />

      <View style={styles.option}>
        <TouchableOpacity
          onPress={() => handleSelectMethod("cash")}
          style={styles.methodRow}
        >
          <Ionicons name="logo-usd" size={24} color="black" />
          <Text style={styles.methodText}>Tiền mặt</Text>
          <RadioButton
            value="cash"
            status={selectedMethod === "cash" ? "checked" : "unchecked"}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  option: {
    flexDirection: "column",
    marginBottom: 10,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  methodText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});
