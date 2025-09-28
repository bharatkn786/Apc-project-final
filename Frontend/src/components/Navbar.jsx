import { use, useEffect, useState } from "react";
import {
  Menu,
  X,
  LogOut,
  User,
  Settings,
  BarChart2,
  FileText,
  Plus,
  Clock,
  MessageSquareWarning,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";


export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  

  const [user , setUser] = useState({
    id: null,
    name: "",
    email: "",
    role: ""
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if(!token) return;

      try{
        const response = await axios.get("http://localhost:8080/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser({
          name: response.data.name, 
          email: response.data.email,
          role: response.data.role
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  } , [])

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser({ id: null, name: "", email: "" });
    alert("Logged out successfully!");
    window.location.href = "/login"; 
  };

  return (
    <nav className="bg-white px-6 py-4 shadow-md">
      <div className="flex justify-around items-center">
        {/* Left side - Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-900 text-white p-2 rounded-lg">
            <MessageSquareWarning size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">U-Complaint</h1>
            <p className="text-xs text-gray-500 -mt-1">
              Report • Resolve • Relief
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
          <Link to="/" className="flex items-center gap-1 hover:text-blue-600">
            <BarChart2 size={16} /> Dashboard
          </Link>
          {/* Only show Submit Complaint for STUDENT role */}
          {user.role === "STUDENT" && (
            <Link to="/submit-complaint" className="flex items-center gap-1 hover:text-blue-600">
              <Plus size={16} /> Submit Complaint
            </Link>
          )}
          <Link to="/my-complaints" className="flex items-center gap-1 hover:text-blue-600">
            <FileText size={16} /> My Complaints
          </Link>
          {/* <Link to="/history" className="flex items-center gap-1 hover:text-blue-600">
            <Clock size={16} /> History
          </Link> */}
        </div>

        {/* Right side - User Profile (desktop) */}
        <div className="hidden md:block relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center"
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U" + user.name.split(" ").slice(-1)[0]?.charAt(0).toUpperCase()}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
              <ul className="py-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <User size={16} /> Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <Settings size={16} /> Settings
                  </Link>
                </li>
              </ul>
              <div className="border-t">
                <div
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <LogOut size={16} /> Log out
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-3 text-gray-700 font-medium">
          <Link to="/" className="flex items-center gap-2 hover:text-blue-600">
            <BarChart2 size={16} /> Dashboard
          </Link>
          {user?.role === "STUDENT" && (
            <Link to="/submit-complaint" className="flex items-center gap-2 hover:text-blue-600">
              <Plus size={16} /> Submit Complaint
            </Link>
          )}
          <Link to="/my-complaints" className="flex items-center gap-2 hover:text-blue-600">
            <FileText size={16} /> My Complaints
          </Link>
          {/* <Link to ="#" className="flex items-center gap-2 hover:text-blue-600">
            <Clock size={16} /> History
          </Link> */}

          {/* Mobile Profile Section */}
          <div className="border-t pt-3">
            <p className="font-medium">{user.name} </p>
            <p className="text-xs text-gray-500 mb-2">
              {user.email}
            </p>
            <Link
              to="#"
              className="flex items-center gap-2 hover:text-blue-600 py-1"
            >
              <User size={16} /> Profile
            </Link>
            <Link
              to="#"
              className="flex items-center gap-2 hover:text-blue-600 py-1"
            >
              <Settings size={16} /> Settings
            </Link>
            <Link
              to="#"
              className="flex items-center gap-2 text-red-600 py-1"
            >
              <LogOut size={16} /> Log out
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
