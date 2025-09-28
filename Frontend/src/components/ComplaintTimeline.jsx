import React from "react";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  MessageSquare
} from "lucide-react";

const ComplaintTimeline = ({ complaint, statusHistory = [] }) => {
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
      case "NEW": return "border-yellow-300 bg-yellow-50";
      case "IN_PROGRESS": return "border-blue-300 bg-blue-50";
      case "RESOLVED": return "border-green-300 bg-green-50";
      case "REJECTED": return "border-red-300 bg-red-50";
      default: return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Complaint Timeline
        </h3>
        <span className="text-sm text-gray-500">
          Complaint #{complaint.id}
        </span>
      </div>

      {/* Current Status Card */}
      <div className={`border-l-4 ${getStatusColor(complaint.status)} p-4 mb-6`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon(complaint.status)}
          <div>
            <h4 className="font-semibold text-gray-800">
              Current Status: {complaint.status}
            </h4>
            <p className="text-sm text-gray-600">
              Last updated: {new Date(complaint.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {/* Complaint Submitted */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">Complaint Submitted</h4>
              <span className="text-sm text-gray-500">
                {new Date(complaint.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {complaint.description}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Category: {complaint.category} | Priority: {complaint.priority}
            </div>
          </div>
        </div>

        {/* Status History (if available) */}
        {statusHistory.map((history, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              {getStatusIcon(history.newStatus)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">
                  Status changed to {history.newStatus}
                </h4>
                <span className="text-sm text-gray-500">
                  {new Date(history.updatedAt).toLocaleString()}
                </span>
              </div>
              {history.comments && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Update from {history.updatedBy?.name || "Staff"}:
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{history.comments}</p>
                </div>
              )}
              {history.estimatedCompletion && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Expected completion: {new Date(history.estimatedCompletion).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Awaiting Action (if resolved) */}
        {complaint.status === "RESOLVED" && (
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">Awaiting Your Confirmation</h4>
              <p className="text-sm text-gray-600 mt-1">
                Please confirm if the issue has been resolved to your satisfaction.
              </p>
              <div className="mt-3 space-x-2">
                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  Mark as Resolved
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintTimeline;