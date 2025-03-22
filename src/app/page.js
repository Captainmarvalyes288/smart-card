'use client';
import { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000';

export default function Home() {
  const [students, setStudents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentData = async (id) => {
    try {
      const response = await fetch(`${API_URL}/student/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch student ${id}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  };

  const fetchVendorData = async (id) => {
    try {
      const response = await fetch(`${API_URL}/vendor/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vendor ${id}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching vendor ${id}:`, error);
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      console.log('Fetching data from backend...');
      
      // Fetch student data
      const studentIds = ['STU001', 'STU002'];
      const studentPromises = studentIds.map(fetchStudentData);
      const studentResults = await Promise.all(studentPromises);
      console.log('Student data:', studentResults);
      
      // Fetch vendor data
      const vendorIds = ['VEN001', 'VEN002'];
      const vendorPromises = vendorIds.map(fetchVendorData);
      const vendorResults = await Promise.all(vendorPromises);
      console.log('Vendor data:', vendorResults);

      setStudents(studentResults);
      setVendors(vendorResults);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Loading data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button 
          onClick={fetchData} 
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Smart Card Dashboard</h1>
      
      {/* Students Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student) => (
            <div key={student.student_id} className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="text-xl font-medium">{student.name}</h3>
              <p className="text-gray-600">ID: {student.student_id}</p>
              <p className="text-green-600 font-semibold">Balance: ₹{student.balance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vendors Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Vendors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((vendor) => (
            <div key={vendor.vendor_id} className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="text-xl font-medium">{vendor.name}</h3>
              <p className="text-gray-600">ID: {vendor.vendor_id}</p>
              <p className="text-gray-600">UPI: {vendor.upi_id}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
