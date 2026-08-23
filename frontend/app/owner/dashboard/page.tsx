export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Owner</h1>
      
      {/* Contoh Kotak Data Dummy */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm">Total Lapangan</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">4</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm">Booking Hari Ini</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm">Pendapatan (Bulan Ini)</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">Rp 3.500.000</p>
        </div>
      </div>
    </div>
  );
}