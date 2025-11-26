import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-white font-bold text-xl flex items-center gap-2"
            >
              SuporteApp
            </Link>
          </div>

          {/* Links */}
          <div className="flex space-x-4">
            <Link
              to="/"
              className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
            >
              Tickets
            </Link>
            <Link
              to="/users"
              className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
            >
              Usuários
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
