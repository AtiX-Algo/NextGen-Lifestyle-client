function renderTemplate(eventType, data) {
  switch (eventType) {
    case "ORDER_CONFIRMED":
      return `NextGen Lifestyle: Order confirmed! Order# ${data.orderId}. Total ৳${data.total}. Thanks!`;
    case "SHIPMENT":
      return `NextGen Lifestyle: Your order# ${data.orderId} has been shipped. Track: ${data.trackingUrl || "N/A"}`;
    case "OUT_FOR_DELIVERY":
      return `NextGen Lifestyle: Order# ${data.orderId} is out for delivery today.`;
    case "DELIVERED":
      return `NextGen Lifestyle: Order# ${data.orderId} delivered. Thank you for shopping with us!`;
    case "OTP":
      return `NextGen Lifestyle OTP: ${data.otp} (valid for ${data.minutes || 5} minutes).`;
    case "PASSWORD_RESET":
      return `NextGen Lifestyle: Password reset code ${data.code} (valid ${data.minutes || 10} minutes).`;
    case "SYSTEM":
    default:
      return `NextGen Lifestyle: ${data.message || "Notification"}`;
  }
}

function emailSubject(eventType) {
  switch (eventType) {
    case "ORDER_CONFIRMED": return "Order Confirmed";
    case "SHIPMENT": return "Order Shipped";
    case "OUT_FOR_DELIVERY": return "Out for Delivery";
    case "DELIVERED": return "Delivered";
    case "OTP": return "Your OTP Code";
    case "PASSWORD_RESET": return "Password Reset";
    default: return "Notification";
  }
}

module.exports = { renderTemplate, emailSubject };
