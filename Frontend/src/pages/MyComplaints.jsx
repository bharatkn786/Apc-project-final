import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CheckCircle,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  FileText,
  X
} from "lucide-react";

const MyComplaints = () => {
  const [complaintsData, setComplaintsData] = useState([]);
  // Removed status filter since we only show RESOLVED complaints
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  // Removed deleting state since resolved complaints can't be deleted
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showViewFeedbackModal, setShowViewFeedbackModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintFeedback, setComplaintFeedback] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    isFullySolved: null, // true/false
    satisfactionRating: 0, // 1-5 stars
    feedback: "",
    wouldRecommend: null // true/false
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
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

        // Check if token exists
        console.log("Token exists:", !!token);
        console.log("Token value:", token ? token.substring(0, 20) + "..." : "No token");
        
        // First, fetch user info to get role
        console.log("Calling /api/auth/me endpoint...");
        const userResponse = await axios.get("http://localhost:8080/api/auth/me", config);
        const user = userResponse.data;
        setUserRole(user.role);
        console.log("Current user:", user);

        // Fetch resolved complaints using the dedicated endpoint
        console.log("Calling /api/complaints/resolved endpoint...");
        const response = await axios.get("http://localhost:8080/api/complaints/resolved", config);
        const resolvedComplaints = response.data || [];
        console.log("Resolved complaints fetched for user role", user.role, ":", resolvedComplaints);
        console.log("User details:", user);
        
        // Check feedback status for each complaint (using fallback method)
        const complaintsWithFeedbackStatus = await Promise.all(
          resolvedComplaints.map(async (complaint) => {
            try {
              console.log(`Checking feedback status for complaint ${complaint.id}`);
              
              // Use the status endpoint to check feedback
              const feedbackResponse = await axios.get(`http://localhost:8080/api/feedback/complaint/${complaint.id}/status`, config);
              const feedbackProvided = feedbackResponse.data?.feedbackProvided || false;
              console.log(`Feedback status response for complaint ${complaint.id}:`, feedbackResponse.data);
              
              return { ...complaint, feedbackProvided };
            } catch (err) {
              console.log(`Error checking feedback status for complaint ${complaint.id}:`, err);
              return { ...complaint, feedbackProvided: false };
            }
          })
        );
        
        console.log("Complaints with feedback status:", complaintsWithFeedbackStatus);
        setComplaintsData(complaintsWithFeedbackStatus);
        
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

  // Filter complaints by search term only (all are already RESOLVED)
  const filteredComplaints = complaintsData.filter((complaint) => {
    const matchesSearch = 
      complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Removed delete and edit functions since resolved complaints cannot be modified

  // Open feedback modal
  const handleProvideFeedback = (complaint) => {
    setSelectedComplaint(complaint);
    setShowFeedbackModal(true);
    setFeedbackData({
      isFullySolved: null,
      satisfactionRating: 0,
      feedback: "",
      wouldRecommend: null
    });
  };

  // Close feedback modal
  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedComplaint(null);
    setFeedbackData({
      isFullySolved: null,
      satisfactionRating: 0,
      feedback: "",
      wouldRecommend: null
    });
  };

  // Open view feedback modal for authorities
  const handleViewFeedback = async (complaint) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Fetch feedback for this complaint
      const response = await axios.get(`http://localhost:8080/api/feedback/complaint/${complaint.id}`, config);
      setComplaintFeedback(response.data);
      setSelectedComplaint(complaint);
      setShowViewFeedbackModal(true);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      alert("Error loading feedback. Please try again.");
    }
  };

  // Close view feedback modal
  const closeViewFeedbackModal = () => {
    setShowViewFeedbackModal(false);
    setSelectedComplaint(null);
    setComplaintFeedback(null);
  };

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (feedbackData.satisfactionRating === 0) {
      alert("Please provide a satisfaction rating");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const token = localStorage.getItem("token");
      
      // Submit feedback using new FeedbackController endpoint
      await axios.post(
        `http://localhost:8080/api/feedback/complaint/${selectedComplaint.id}`,
        {
          isFullySolved: feedbackData.isFullySolved,
          satisfactionRating: feedbackData.satisfactionRating,
          feedback: feedbackData.feedback,
          wouldRecommend: feedbackData.wouldRecommend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Simple success message
      alert("Your feedback has been submitted successfully! Thank you for your valuable input.");
      
      closeFeedbackModal();
      
      // Update the complaint to show feedback was provided
      setComplaintsData(prev => 
        prev.map(complaint => 
          complaint.id === selectedComplaint.id 
            ? { ...complaint, feedbackProvided: true }
            : complaint
        )
      );
      
    } catch (error) {
      console.error("Feedback submission error:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Removed status helper functions since all complaints are RESOLVED

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Resolved Complaints</h1>
              <p className="text-indigo-100 mt-1">
                {userRole === "STUDENT" 
                  ? "Provide feedback on your resolved complaints"
                  : "View feedback from students on resolved complaints"
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{complaintsData.length}</p>
              <p className="text-indigo-100">Resolved Complaints</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>Showing only resolved complaints</span>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Your Resolved Complaints
            </h2>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No resolved complaints found</p>
              <p className="text-gray-500 text-sm mt-2">Once your complaints are resolved, they will appear here for feedback</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 font-medium text-gray-700">ID</th>
                    <th className="text-left p-4 font-medium text-gray-700">Title</th>
                    <th className="text-left p-4 font-medium text-gray-700">Category</th>
                    {userRole !== "STUDENT" && (
                      <th className="text-left p-4 font-medium text-gray-700">Submitted By</th>
                    )}
                    <th className="text-left p-4 font-medium text-gray-700">Resolved Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr 
                      key={complaint.id} 
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-900">#{complaint.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{complaint.title}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {complaint.description}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {complaint.category}
                        </span>
                      </td>
                      {userRole !== "STUDENT" && (
                        <td className="p-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{complaint.submittedBy || complaint.user?.name || 'N/A'}</span>
                          </div>
                        </td>
                      )}
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{formatDate(complaint.resolvedAt || complaint.updatedAt || complaint.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {userRole === "STUDENT" ? (
                            // Student view - Give Feedback
                            !complaint.feedbackProvided ? (
                              <button
                                onClick={() => handleProvideFeedback(complaint)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                                title="Provide Feedback"
                              >
                                <Star className="w-4 h-4" />
                                <span>Give Feedback</span>
                              </button>
                            ) : (
                              <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Feedback Provided</span>
                              </span>
                            )
                          ) : (
                            // Authority view - See Feedback
                            complaint.feedbackProvided ? (
                              <button
                                onClick={() => handleViewFeedback(complaint)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
                                title="View Student Feedback"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>See Feedback</span>
                              </button>
                            ) : (
                              <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center space-x-2">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span>No Feedback</span>
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-500" />
                  Provide Feedback - Complaint #{selectedComplaint.id}
                </h3>
                <button
                  onClick={closeFeedbackModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Complaint Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Complaint Summary</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Title:</strong> {selectedComplaint.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Description:</strong> {selectedComplaint.description}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Category:</strong> {selectedComplaint.category}
                </p>
              </div>

              {/* Feedback Recipient Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Feedback Recipient
                </h4>
                <p className="text-sm text-blue-700">
                  Your feedback will be sent to the concerned{" "}
                  <strong>
                    {(() => {
                      const wardenCategories = ["Mess", "Hostel", "Maintenance", "Transport", "Security"];
                      const facultyCategories = ["Academic"];
                      
                      if (wardenCategories.includes(selectedComplaint.category)) return "Warden";
                      if (facultyCategories.includes(selectedComplaint.category)) return "Faculty";
                      return "Admin";
                    })()}
                  </strong>{" "}
                  responsible for {selectedComplaint.category} complaints for review and service improvement.
                </p>
              </div>

              {/* Is Problem Fully Solved */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Has your problem been fully solved? *
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setFeedbackData(prev => ({ ...prev, isFullySolved: true }))}
                    className={`px-4 py-2 rounded-lg border flex items-center space-x-2 transition-colors ${
                      feedbackData.isFullySolved === true 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Yes, fully solved</span>
                  </button>
                  <button
                    onClick={() => setFeedbackData(prev => ({ ...prev, isFullySolved: false }))}
                    className={`px-4 py-2 rounded-lg border flex items-center space-x-2 transition-colors ${
                      feedbackData.isFullySolved === false 
                        ? 'bg-red-100 border-red-500 text-red-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>No, partially solved</span>
                  </button>
                </div>
              </div>

              {/* Satisfaction Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How satisfied are you with the resolution? *
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackData(prev => ({ ...prev, satisfactionRating: star }))}
                      className={`p-2 rounded-lg transition-colors ${
                        star <= feedbackData.satisfactionRating
                          ? 'text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {feedbackData.satisfactionRating > 0 && (
                    `${feedbackData.satisfactionRating} out of 5 stars`
                  )}
                </p>
              </div>

              {/* Would Recommend */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Would you recommend our complaint resolution service?
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setFeedbackData(prev => ({ ...prev, wouldRecommend: true }))}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      feedbackData.wouldRecommend === true 
                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Yes, I would recommend
                  </button>
                  <button
                    onClick={() => setFeedbackData(prev => ({ ...prev, wouldRecommend: false }))}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      feedbackData.wouldRecommend === false 
                        ? 'bg-orange-100 border-orange-500 text-orange-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    No, I wouldn't recommend
                  </button>
                </div>
              </div>

              {/* Additional Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={feedbackData.feedback}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  placeholder="Share your experience, suggestions for improvement, or any other feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={closeFeedbackModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback || feedbackData.satisfactionRating === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submittingFeedback ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal for Authorities */}
      {showViewFeedbackModal && complaintFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Student Feedback</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Complaint #{selectedComplaint?.id}: {selectedComplaint?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted by: {selectedComplaint?.submittedBy || selectedComplaint?.user?.name || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={closeViewFeedbackModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Satisfaction Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Satisfaction
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      className={
                        star <= complaintFeedback.satisfactionRating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({complaintFeedback.satisfactionRating}/5 stars)
                  </span>
                </div>
              </div>

              {/* Problem Resolution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Was the problem fully resolved?
                </label>
                <div className="flex items-center space-x-2">
                  {complaintFeedback.isFullySolved ? (
                    <div className="flex items-center space-x-2 text-green-700">
                      <ThumbsUp className="w-5 h-5" />
                      <span>Yes, completely resolved</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-700">
                      <ThumbsDown className="w-5 h-5" />
                      <span>No, partially resolved or unresolved</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Would recommend our complaint resolution process?
                </label>
                <div className="flex items-center space-x-2">
                  {complaintFeedback.wouldRecommend ? (
                    <div className="flex items-center space-x-2 text-blue-700">
                      <ThumbsUp className="w-5 h-5" />
                      <span>Yes, would recommend</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-orange-700">
                      <ThumbsDown className="w-5 h-5" />
                      <span>No, wouldn't recommend</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Comments */}
              {complaintFeedback.studentFeedback && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {complaintFeedback.studentFeedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback Submitted Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Submitted
                </label>
                <p className="text-sm text-gray-600">
                  {new Date(complaintFeedback.feedbackSubmittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeViewFeedbackModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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

export default MyComplaints;
