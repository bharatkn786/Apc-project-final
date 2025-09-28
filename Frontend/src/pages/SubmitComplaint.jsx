import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const categoryOptions = {
  "Mess": {
    label: "Mess",
    subcategories: ["Food Quality", "Hygiene", "Menu Issues", "Staff Behavior", "Timing Issues"]
  },
  "Hostel": {
    label: "Hostel",
    subcategories: ["Room Issues", "Common Area", "Security", "Cleanliness", "Facility Problems"]
  },
  "Maintenance": {
    label: "Maintenance",
    subcategories: ["Carpenter", "Electrician", "Plumber", "Cleaning", "Gardening"]
  },
  "Academic": {
    label: "Academic",
    subcategories: ["Library", "Classroom", "Lab Equipment", "Internet/WiFi", "Air Conditioning"]
  },
  "Transport": {
    label: "Transport",
    subcategories: ["Bus Service", "Parking", "Vehicle Issues"]
  },
  "Security": {
    label: "Security",
    subcategories: ["Gate Issues", "Lost & Found", "Unauthorized Access", "Safety Concerns"]
  },
  "Other": {
    label: "Other",
    subcategories: ["General Query", "Suggestion", "Miscellaneous"]
  }
};

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [formData, setFormData] = useState({
    category: "",
    subcategory: "",
    title: "",
    description: "",
    priority: "",
    location: "",
    contactNumber: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [complaintId, setComplaintId] = useState(null);

  // Handle edit mode initialization
  useEffect(() => {
    if (isEditMode) {
      const storedComplaint = localStorage.getItem("editComplaint");
      if (storedComplaint) {
        try {
          const complaint = JSON.parse(storedComplaint);
          setFormData({
            category: complaint.category || "",
            subcategory: complaint.subcategory || "",
            title: complaint.title || "",
            description: complaint.description || "",
            priority: complaint.priority || "",
            location: complaint.location || "",
            contactNumber: complaint.contactNumber || ""
          });
          setSelectedCategory(complaint.category || "");
          setComplaintId(complaint.id);
          
          // Clear the stored data after loading
          localStorage.removeItem("editComplaint");
        } catch (error) {
          console.error("Error parsing stored complaint data:", error);
        }
      }
    }
  }, [isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setFormData(prev => ({ ...prev, category: e.target.value, subcategory: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData
      }

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      let response;
      
      if (isEditMode && complaintId) {
        // Update existing complaint
        console.log("Updating complaint with ID:", complaintId);
        console.log("Payload being sent:", payload);
        console.log("Config:", config);
        response = await axios.put(`http://localhost:8080/api/complaints/${complaintId}`, payload, config);
        console.log("Update response:", response.data);
        alert("Complaint updated successfully!");
      } else {
        // Create new complaint
        console.log("Creating new complaint:", payload);
        response = await axios.post("http://localhost:8080/api/complaints", payload, config);
        console.log("Create response:", response.data);
        alert("Complaint submitted successfully!");
      }

      navigate("/");
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      
      let errorMessage = "An unexpected error occurred.";
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      if (isEditMode) {
        alert(`Failed to update complaint: ${errorMessage}`);
      } else {
        alert(`Failed to submit complaint: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <button onClick={() => navigate("/")} className="mb-6 text-blue-600 hover:underline">
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-center mb-2">
          {isEditMode ? "Edit Complaint" : "Submit Complaint"}
        </h1>
        <p className="text-center text-gray-500 mb-8">
          {isEditMode ? "Update your complaint details" : "Help us improve by reporting issues or concerns"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block font-medium mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select category</option>
              {Object.entries(categoryOptions).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block font-medium mb-1">Subcategory *</label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
              disabled={!selectedCategory}
            >
              <option value="">Select subcategory</option>
              {selectedCategory &&
                categoryOptions[selectedCategory]?.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block font-medium mb-1">Priority *</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block font-medium mb-1">Contact Number *</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="10-digit phone number"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium mb-1">Complaint Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title for your complaint"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block font-medium mb-1">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Room number, building, or location"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1">Detailed Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please describe the issue in detail..."
              className="w-full border rounded-md px-3 py-2 min-h-[120px]"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting 
                ? (isEditMode ? "Updating..." : "Submitting...") 
                : (isEditMode ? "Update Complaint" : "Submit Complaint")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
