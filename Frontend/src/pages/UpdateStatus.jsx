import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Upload,
  Bell
} from "lucide-react";

const UpdateStatus = () => {
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [formData, setFormData] = useState({
    newStatus: "",
    workDone: "",
    nextSteps: "",
    requiresResources: false,
    notifyStudent: true,
    expectedCompletionDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get complaint data from localStorage
    const complaintData = localStorage.getItem("updateStatusComplaint");
    if (complaintData) {
      const parsedComplaint = JSON.parse(complaintData);
      setComplaint(parsedComplaint);
      setFormData(prev => ({
        ...prev,
        newStatus: parsedComplaint.status, // Default to current status
      }));
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      console.log("Updating complaint status:", {
        complaintId: complaint.id,
        formData
      });

      const response = await axios.put(
        `http://localhost:8080/api/complaints/${complaint.id}/update-status`,
        {
          status: formData.newStatus,
          comments: formData.workDone,
          nextSteps: formData.nextSteps,
          requiresResources: formData.requiresResources,
          notifyStudent: formData.notifyStudent,
          expectedCompletionDate: formData.expectedCompletionDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Status update response:", response.data);
      
      // Clear localStorage
      localStorage.removeItem("updateStatusComplaint");
      
      // Navigate back to dashboard with success message
      alert("Complaint status updated successfully!");
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Status update error:", error);
      let errorMessage = "Failed to update status. ";
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status) {
        errorMessage += `Server error: ${error.response.status}`;
      } else {
        errorMessage += "Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "NEW": return <Clock className="w-5 h-5 text-yellow-600" />;
      case "IN_PROGRESS": return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      case "RESOLVED": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "REJECTED": return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW": return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Update Complaint Status</h1>
              <p className="text-indigo-100 mt-1">
                Manage and track complaint progress
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Complaint Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Complaint Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Complaint ID</p>
                <p className="font-semibold text-lg">#{complaint.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(complaint.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold">{complaint.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-semibold">{complaint.priority}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Description</p>
                <p className="mt-1 text-gray-800">{complaint.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted By</p>
                <p className="font-semibold">{complaint.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{complaint.location}</p>
              </div>
            </div>
          </div>

          {/* Status Update Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Update Status & Progress
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  New Status *
                </label>
                <select
                  name="newStatus"
                  value={formData.newStatus}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Status</option>
                  <option value="NEW">NEW</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>



              {/* Expected Completion Date (only for IN_PROGRESS) */}
              {formData.newStatus === "IN_PROGRESS" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Expected Completion Date
                  </label>
                  <input
                    type="date"
                    name="expectedCompletionDate"
                    value={formData.expectedCompletionDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}





              {/* Work Done */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Work Progress / Comments *
                </label>
                <textarea
                  name="workDone"
                  value={formData.workDone}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Detailed description of work completed, current status, issues encountered, or resolution details..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Next Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Steps (Optional)
                </label>
                <textarea
                  name="nextSteps"
                  value={formData.nextSteps}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="What will be done next? Any follow-up actions required..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiresResources"
                    checked={formData.requiresResources}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    This complaint requires additional resources or approval
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="notifyStudent"
                    checked={formData.notifyStudent}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    <Bell className="w-4 h-4 inline mr-1" />
                    Notify student about this status update
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 background-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Update Status</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatus;