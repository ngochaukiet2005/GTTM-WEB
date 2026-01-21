// Ví dụ logic trong DriverTrip
return (
  <div className="h-[400px] w-full">
    <AppMap 
      mode="driver"
      driverLocation={currentDriverPos} // Lấy từ GPS điện thoại tài xế
      pickupLocation={tripData.from}    // Lấy từ API chuyến xe
      destinationLocation={tripData.to}
    />
  </div>
)