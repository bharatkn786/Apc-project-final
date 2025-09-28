package com.example.demo.dto;

import com.example.demo.model.Complaint;

public class UpdateComplaintStatusRequest {
    private Complaint.Status status;
    private Complaint.Priority priority;
    private String message;
    private String updatedBy;

    // Default constructor
    public UpdateComplaintStatusRequest() {}

    // Constructor
    public UpdateComplaintStatusRequest(Complaint.Status status, Complaint.Priority priority, String message, String updatedBy) {
        this.status = status;
        this.priority = priority;
        this.message = message;
        this.updatedBy = updatedBy;
    }

    // Getters and Setters
    public Complaint.Status getStatus() {
        return status;
    }

    public void setStatus(Complaint.Status status) {
        this.status = status;
    }

    public Complaint.Priority getPriority() {
        return priority;
    }

    public void setPriority(Complaint.Priority priority) {
        this.priority = priority;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public String toString() {
        return "UpdateComplaintStatusRequest{" +
                "status=" + status +
                ", priority=" + priority +
                ", message='" + message + '\'' +
                ", updatedBy='" + updatedBy + '\'' +
                '}';
    }
}