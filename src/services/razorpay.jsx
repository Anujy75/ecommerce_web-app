import API from "../services/api";

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
    const orderResponse = await API.post(
      `/api/payment/create-order`,  // ✅ FIXED
      { amount: Math.round(amount * 100) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { id: orderId, amount: orderAmount, currency, key } = orderResponse.data;

    const options = {
      key: key,
      amount: orderAmount,
      currency: currency || "INR",
      name: "ShopEase",
      description: "Order Payment",
      order_id: orderId,

      config: {
        display: {
          blocks: {
            upi_block: {
              name: "Pay via UPI",
              instruments: [
                {
                  method: "upi",
                  flows: ["qr", "intent", "collect"],
                },
              ],
            },
            other: {
              name: "Other Payment Methods",
              instruments: [
                { method: "card" },
                { method: "netbanking" },
                { method: "wallet" },
              ],
            },
          },
          sequence: ["block.upi_block", "block.other"],
          preferences: {
            show_default_blocks: false,
          },
        },
      },

      handler: async (response) => {
        try {
          const verifyResponse = await API.post(
            `/api/payment/verify`,  // ✅ FIXED
            {
              orderId:   response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
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
        name:    orderDetails.fullName,
        email:   orderDetails.email,
        contact: orderDetails.phone,
      },

      notes: {
        address: orderDetails.address,
      },

      theme: {
        color: "#4f46e5",
      },

      modal: {
        ondismiss: () => {
          onError("Payment cancelled");
        },
        confirm_close: true,
        animation: true,
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (response) => {
      const reason =
        response.error?.description ||
        response.error?.reason      ||
        "Payment failed. Please try again.";
      onError(reason);
    });

    razorpay.open();

  } catch (error) {
    onError("Failed to create payment order");
  }
};


