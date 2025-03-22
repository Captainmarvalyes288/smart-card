"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function VendorPayment({ params }) {
  const { vendorId } = params;
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    axios.get(`/api/getVendorQr/${vendorId}`).then((res) => setQrCode(res.data.qr_code));
  }, [vendorId]);

  return (
    <div>
      <h2>Scan QR to Pay Vendor</h2>
      {qrCode && <img src={qrCode} alt="Vendor QR Code" />}
    </div>
  );
}
