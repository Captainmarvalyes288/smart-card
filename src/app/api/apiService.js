const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiService = {
  // Student related APIs
  getStudent: async (studentId) => {
    const response = await fetch(`${API_URL}/student/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch student');
    return response.json();
  },

  // Vendor related APIs
  getVendor: async (vendorId) => {
    const response = await fetch(`${API_URL}/vendor/${vendorId}`);
    if (!response.ok) throw new Error('Failed to fetch vendor');
    return response.json();
  },

  getVendorQR: async (vendorId) => {
    const response = await fetch(`${API_URL}/get_vendor_qr/${vendorId}`);
    if (!response.ok) throw new Error('Failed to fetch vendor QR');
    return response.json();
  },

  // Payment related APIs
  createPayment: async (paymentData) => {
    const response = await fetch(`${API_URL}/create_razorpay_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error('Failed to create payment');
    return response.json();
  },

  verifyPayment: async (paymentData) => {
    const response = await fetch(`${API_URL}/verify_payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error('Failed to verify payment');
    return response.json();
  },
}; 