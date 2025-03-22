import axios from "axios";

export async function GET(req, { params }) {
  const studentId = params.studentId;

  const response = await axios.get(`http://localhost:8000/get_student_details/${studentId}`);

  return new Response(JSON.stringify(response.data), {
    headers: { "Content-Type": "application/json" },
  });
}
