import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 10.762622,
  lng: 106.660172
};

const AppMap = ({ 
  mode = 'passenger',
  pickupLocation,
  destinationLocation,
  driverLocation,
  onLocationSelect,
  selectingType,
}) => {
  
  // Thay API Key của bạn vào đây
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE", 
    libraries: ['places']
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = (e) => {
    if (mode === 'passenger' && onLocationSelect && selectingType) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationSelect(selectingType, { lat, lng });
    }
  };

  useEffect(() => {
    if (pickupLocation && destinationLocation && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickupLocation,
          destination: destinationLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result);
          }
        }
      );
    }
  }, [pickupLocation, destinationLocation]);

  if (!isLoaded) return <div className="h-full flex items-center justify-center bg-gray-200">Đang tải bản đồ...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={pickupLocation || driverLocation || defaultCenter}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {mode === 'passenger' && (
        <>
          {pickupLocation && <Marker position={pickupLocation} label="A" />}
          {destinationLocation && <Marker position={destinationLocation} label="B" />}
        </>
      )}

      {mode === 'driver' && driverLocation && (
        <Marker position={driverLocation} label="Xe" />
      )}

      {directionsResponse && (
        <DirectionsRenderer directions={directionsResponse} />
      )}
    </GoogleMap>
  );
};

export default React.memo(AppMap);