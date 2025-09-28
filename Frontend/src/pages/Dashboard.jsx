
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  Info,
  TrendingUp, // Add these new icons
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const [complaintsData, setComplaintsData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch user info first
        const userResponse = await axios.get("http://localhost:8080/api/auth/me", config);
        setUser(userResponse.data);
        setUserLoading(false);

        // Then fetch complaints
        const complaintsResponse = await axios.get("http://localhost:8080/api/complaints", config);
        setComplaintsData(complaintsResponse.data || []);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setComplaintsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndComplaints();
  }, [navigate]);

  // Delete complaint function
  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    console.log("Attempting to delete complaint with ID:", complaintId);
    setDeleting(complaintId);
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      console.log("Making DELETE request to:", `http://localhost:8080/api/complaints/${complaintId}`);
      
      const response = await axios.delete(`http://localhost:8080/api/complaints/${complaintId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Delete response:", response.data);
      
      // Remove complaint from local state
      setComplaintsData(prev => prev.filter(complaint => complaint.id !== complaintId));
      alert("Complaint deleted successfully!");
    } catch (error) {
      console.error("Full delete error:", error);
      console.error("Delete error response:", error.response);
      
      let errorMessage = "An unexpected error occurred.";
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      alert(`Failed to delete complaint: ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  // Edit complaint function
  const handleEditComplaint = (complaint) => {
    // Store complaint data in localStorage for pre-filling the form
    localStorage.setItem("editComplaint", JSON.stringify(complaint));
    navigate("/submit-complaint?edit=true");
  };

  // Add this new function for status update
  const handleUpdateStatus = (complaint) => {
    // Store complaint data for status update
    localStorage.setItem("updateStatusComplaint", JSON.stringify(complaint));
    navigate("/update-status");
  };

  // Fetch status history for a complaint
  const fetchStatusHistory = async (complaintId) => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/complaints/${complaintId}/status-history`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStatusHistory(response.data || []);
    } catch (error) {
      console.error("Error fetching status history:", error);
      setStatusHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle progress details view
  const handleViewProgress = async (complaint) => {
    setSelectedComplaint(complaint);
    setShowProgressModal(true);
    await fetchStatusHistory(complaint.id);
  };

  // Close progress modal
  const closeProgressModal = () => {
    setShowProgressModal(false);
    setSelectedComplaint(null);
    setStatusHistory([]);
    setLoadingHistory(false);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (expectedDate) => {
    if (!expectedDate) return null;
    const today = new Date();
    const expected = new Date(expectedDate);
    const diffTime = expected - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filters - Exclude RESOLVED complaints from table (they're in MyComplaints section)
  const filteredComplaints = complaintsData.filter((c) => {
    return (
      c.status !== "RESOLVED" && // Hide resolved complaints from main table
      (statusFilter === "All" || c.status === statusFilter) &&
      (categoryFilter === "All" || c.category === categoryFilter) &&
      (searchTerm === "" ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Summary
  const summary = {
    total: complaintsData.length,
    pending: complaintsData.filter(
      (c) => c.status === "NEW" || c.status === "Pending"
    ).length,
    progress: complaintsData.filter(
      (c) => c.status === "IN_PROGRESS" || c.status === "In Progress"
    ).length,
    resolved: complaintsData.filter(
      (c) => c.status === "RESOLVED" || c.status === "Resolved"
    ).length,
    escalated: complaintsData.filter((c) => c.status === "Escalated").length,
  };

  const chartData = {
    labels: ["Pending", "In Progress", "Resolved", "Escalated"],
    datasets: [
      {
        label: "Complaints",
        data: [
          summary.pending,
          summary.progress,
          summary.resolved,
          summary.escalated,
        ],
        backgroundColor: ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"],
      },
    ],
  };

  if (loading || userLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Complaints Dashboard</h1>
              <p className="text-indigo-100 text-lg">
                Monitor and manage complaints efficiently
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur">
              <BarChart3 className="w-6 h-6 text-white" />
              <span className="font-medium">Analytics</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 space-y-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="Total Complaints"
            value={summary.total}
            icon={<Users />}
            color="bg-gray-100 text-gray-800"
          />
          <StatsCard
            title="Pending"
            value={summary.pending}
            icon={<Clock />}
            color="bg-yellow-100 text-yellow-800"
          />
          <StatsCard
            title="In Progress"
            value={summary.progress}
            icon={<AlertTriangle />}
            color="bg-blue-100 text-blue-800"
          />
          <StatsCard
            title="Resolved"
            value={summary.resolved}
            icon={<CheckCircle />}
            color="bg-green-100 text-green-800"
          />
          <StatsCard
            title="Escalated"
            value={summary.escalated}
            icon={<AlertTriangle />}
            color="bg-red-100 text-red-800"
          />
        </div>

        {/* Filters */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <Filter className="w-5 h-5 text-gray-600" />
            <span>Filters & Search</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search complaints or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Active</option>
              <option value="NEW">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="Escalated">Escalated</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Hostel">Hostel</option>
              <option value="Mess">Mess</option>
              <option value="Library">Library</option>
              <option value="Academic">Academic</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8"> 
          {/* Complaints Table */}
          <div className="xl:col-span-2 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📋 Active Complaints</h2>
            <p className="text-sm text-gray-600 mb-4">Resolved complaints are available in the "My Complaints" section for feedback</p>
            {filteredComplaints.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3">ID</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Status & Progress</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{c.id}</td>
                        <td className="p-3">{c.category}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${c.status === "NEW" ? "bg-yellow-100 text-yellow-800" : ""}
                            ${c.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" : ""}
                            ${c.status === "RESOLVED" ? "bg-green-100 text-green-800" : ""}
                            ${c.status === "Escalated" ? "bg-red-100 text-red-800" : ""}
                          `}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate">{c.description}</td>
                        <td className="p-3">{c.user?.email || c.user?.username || "N/A"}</td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            {/* Show different buttons based on role */}
                            {user.role === "STUDENT" && (
                              <>
                                {(c.status === "IN_PROGRESS" || c.expectedCompletionDate) && (
                                  <button
                                    onClick={() => handleViewProgress(c)}
                                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                                    title="View Progress Details"
                                  >
                                    <Info className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditComplaint(c)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                  title="Edit complaint"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteComplaint(c.id)}
                                  disabled={deleting === c.id}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                  title="Delete complaint"
                                >
                                  {deleting === c.id ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                            
                            {/* Show Update Status button for Warden/Faculty/Admin */}
                            {(user.role === "WARDEN" || user.role === "FACULTY" || user.role === "ADMIN") && (
                              <button
                                onClick={() => handleUpdateStatus(c)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                title="Update status"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Admin can do everything */}
                            {user.role === "ADMIN" && (
                              <>
                                <button
                                  onClick={() => handleEditComplaint(c)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                  title="Edit complaint"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteComplaint(c.id)}
                                  disabled={deleting === c.id}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                  title="Delete complaint"
                                >
                                  {deleting === c.id ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center">No complaints found.</p>
            )}
          </div>

          {/* Chart */}
          
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 max-w-5xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">📈 Complaints Overview</h2>
            <Bar data={chartData} />
          </div>

      {/* Progress Details Modal */}
      {showProgressModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                Progress Details - Complaint #{selectedComplaint.id}
              </h3>
              <button
                onClick={closeProgressModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Complaint Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{selectedComplaint.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium
                      ${selectedComplaint.status === "NEW" ? "bg-yellow-100 text-yellow-800" : ""}
                      ${selectedComplaint.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" : ""}
                      ${selectedComplaint.status === "RESOLVED" ? "bg-green-100 text-green-800" : ""}
                      ${selectedComplaint.status === "Escalated" ? "bg-red-100 text-red-800" : ""}
                    `}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Description:</span>
                    <p className="ml-2 mt-1">{selectedComplaint.description}</p>
                  </div>
                </div>
              </div>



              {/* Timeline Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Timeline
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="font-medium">{formatDate(selectedComplaint.createdAt)}</span>
                  </div>
                  
                  {selectedComplaint.lastUpdated && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{formatDate(selectedComplaint.lastUpdated)}</span>
                    </div>
                  )}
                  
                  {selectedComplaint.expectedCompletionDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Completion:</span>
                      <span className="font-medium text-green-600">
                        {formatDate(selectedComplaint.expectedCompletionDate)}
                      </span>
                    </div>
                  )}
                  
                  {selectedComplaint.status === "IN_PROGRESS" && selectedComplaint.expectedCompletionDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Remaining:</span>
                      <span className={`font-medium ${
                        getDaysRemaining(selectedComplaint.expectedCompletionDate) > 0 ? 'text-green-600' :
                        getDaysRemaining(selectedComplaint.expectedCompletionDate) === 0 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {(() => {
                          const days = getDaysRemaining(selectedComplaint.expectedCompletionDate);
                          if (days > 0) return `${days} days left`;
                          if (days === 0) return 'Due today';
                          return `${Math.abs(days)} days overdue`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status History & Work Progress */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Status History & Work Progress
                </h4>
                
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                    <span className="text-gray-600">Loading status history...</span>
                  </div>
                ) : statusHistory.length > 0 ? (
                  <div className="space-y-4">
                    {statusHistory.map((history, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${history.oldStatus === "NEW" ? "bg-yellow-100 text-yellow-800" : ""}
                              ${history.oldStatus === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" : ""}
                              ${history.oldStatus === "RESOLVED" ? "bg-green-100 text-green-800" : ""}
                              ${history.oldStatus === "REJECTED" ? "bg-red-100 text-red-800" : ""}
                            `}>
                              {history.oldStatus}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${history.newStatus === "NEW" ? "bg-yellow-100 text-yellow-800" : ""}
                              ${history.newStatus === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" : ""}
                              ${history.newStatus === "RESOLVED" ? "bg-green-100 text-green-800" : ""}
                              ${history.newStatus === "REJECTED" ? "bg-red-100 text-red-800" : ""}
                            `}>
                              {history.newStatus}
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs">{formatDate(history.createdAt)}</span>
                        </div>
                        
                        {/* Work Progress */}
                        {history.workProgress && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-2">
                            <div className="flex items-start space-x-2">
                              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-blue-800 text-sm">Work Progress:</span>
                                <p className="text-blue-700 text-sm mt-1">{history.workProgress}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Next Steps */}
                        {history.nextSteps && (
                          <div className="bg-green-50 p-3 rounded-lg mb-2">
                            <div className="flex items-start space-x-2">
                              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-green-800 text-sm">Next Steps:</span>
                                <p className="text-green-700 text-sm mt-1">{history.nextSteps}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Expected Completion Date */}
                        {history.expectedCompletionDate && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Expected completion: {formatDate(history.expectedCompletionDate)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No status updates available yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeProgressModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className={`p-5 rounded-lg shadow-md flex items-center space-x-4 ${color}`}>
      <div className="p-3 bg-white/70 rounded-full">{icon}</div>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;