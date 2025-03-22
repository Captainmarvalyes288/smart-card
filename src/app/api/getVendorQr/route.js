import axios from "axios";

export async function GET(req, { params }) {
  const vendorId = params.vendorId;

  const response = await axios.get(`http://localhost:8000/get_vendor_qr/${vendorId}`);

  return new Response(JSON.stringify(response.data), {
    headers: { "Content-Type": "application/json" },
  });
}
