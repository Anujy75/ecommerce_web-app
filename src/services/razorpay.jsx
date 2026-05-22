import axios from "axios";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async (amount, orderDetails, token, onSuccess, onError) => {
  const isScriptLoaded = await loadRazorpayScript();
  
  if (!isScriptLoaded) {
    onError("Failed to load Razorpay SDK");
    return;
  }

  try {
    // Create order on backend
    const orderResponse = await axios.post(
      "http://localhost:8080/api/payment/create-order",
      { amount: Math.round(amount * 100) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { id: orderId, amount: orderAmount, currency, key } = orderResponse.data;

    const options = {
      key: key,
      amount: orderAmount,
      currency: currency,
      name: "ShopEase",
      description: `Order Payment`,
      order_id: orderId,
      handler: async (response) => {
        // Verify payment on backend
        try {
          const verifyResponse = await axios.post(
            "http://localhost:8080/api/payment/verify",
            {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (verifyResponse.data.status === "success") {
            onSuccess(response);
          } else {
            onError("Payment verification failed");
          }
        } catch (error) {
          onError("Payment verification failed");
        }
      },
      prefill: {
        name: orderDetails.fullName,
        email: orderDetails.email,
        contact: orderDetails.phone
      },
      notes: {
        address: orderDetails.address
      },
      theme: {
        color: "#4f46e5"
      },
      modal: {
        ondismiss: () => {
          onError("Payment cancelled");
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error) {
    onError("Failed to create payment order");
  }
};