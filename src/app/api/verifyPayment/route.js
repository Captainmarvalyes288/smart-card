import axios from "axios";

export async function POST(req) {
  const body = await req.json();

  const response = await axios.post("http://localhost:8000/verify_payment", body);

  return new Response(JSON.stringify(response.data), {
    headers: { "Content-Type": "application/json" },
  });
}
