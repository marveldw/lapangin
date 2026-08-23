import Sidebar from "../../components/Sidebar";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar selalu ada di kiri */}
      <Sidebar />
      
      {/* Ini tempat konten utamanya berubah-ubah */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}