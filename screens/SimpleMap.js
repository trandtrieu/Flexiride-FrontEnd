import React, { useEffect, useRef, useState } from "react";

const SimpleMap = () => {
  const [styleUrl, setStyleURL] = useState({
    styleUrl:
      "https://maps.vietmap.vn/api/maps/light/styles.json?apikey=7c3ab066a578a4f5fe4f40c67573f7e0a831f9b36adfdc48",
  });

  const mapRef = useRef(null);
  const [markerCoordinates, setMarkerCoordinates] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const handleMapClick = async (feature) => {
    // Xử lý sự kiện click trên bản đồ
    if (mapRef.current) {
      console.log(feature);
      const { geometry, properties } = feature;

      setMarkerCoordinates(geometry.coordinates);
      console.log("Clicked at coordinates:", geometry.coordinates);
      console.log("Feature properties:", properties);

      // Truy vấn dữ liệu từ các đối tượng hiển thị trên bản đồ
      const selectedFeatures =
        await mapRef.current.queryRenderedFeaturesAtPoint(
          [properties.screenPointX, properties.screenPointY],
          null
        );

      console.log("Rendered Features:", selectedFeatures);
      setSelectedFeatures(selectedFeatures);
    } else {
      console.error("Feature failed");
    }
  };

  const centerCoordinates = [106.632, 10.7545]; // Toạ độ trung tâm
  const lineCoordinates = [
    [106.432502, 10.253619], // Điểm bắt đầu (longitude, latitude)
    [106.732502, 10.653619], // Điểm kết thúc (longitude, latitude)
  ];

  return (
    <VietmapGL.MapView
      ref={mapRef}
      styleURL={styleUrl.styleUrl}
      style={{ flex: 1 }}
      logoEnabled={false}
      onPress={handleMapClick}
    >
      <VietmapGL.Camera
        zoomLevel={13}
        followZoomLevel={13}
        followUserLocation={false}
        centerCoordinate={centerCoordinates}
      />

      <VietmapGL.ShapeSource
        id="lineSource"
        shape={{ type: "LineString", coordinates: lineCoordinates }}
      >
        <VietmapGL.LineLayer
          id="lineLayer"
          style={{ lineColor: "red", lineWidth: 4 }}
        />
      </VietmapGL.ShapeSource>
    </VietmapGL.MapView>
  );
};

export default SimpleMap;
