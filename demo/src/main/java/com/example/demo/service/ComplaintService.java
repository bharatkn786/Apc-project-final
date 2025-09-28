package com.example.demo.service;

import com.example.demo.model.Complaint;
import com.example.demo.repository.ComplaintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.example.demo.model.User;
import java.util.List;
import com.example.demo.dto.UpdateComplaintStatusRequest;

@Service
public class ComplaintService {

    private static final Logger logger = LoggerFactory.getLogger(ComplaintService.class);

    private final ComplaintRepository complaintRepository;

    public ComplaintService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    // ✅ Create new complaint
    public Complaint createComplaint(Complaint complaint) {
        logger.info("Creating complaint for userId={}, title={}",
                complaint.getUser().getId(), complaint.getTitle());
        return complaintRepository.save(complaint);
    }

    // ✅ Get complaints by user
    public List<Complaint> getComplaintsByUser(Long userId) {
        logger.info("Fetching complaints for userId={}", userId);
        return complaintRepository.findByUser_Id(userId);
    }

    // ✅ Get all complaints (with user details)
    public List<Complaint> getAllComplaints() {
        logger.info("Fetching all complaints with user details");
        return complaintRepository.findAllWithUser();
    }

    // ✅ Get complaints by categories (for Warden & Faculty)
    public List<Complaint> getComplaintsByCategories(List<String> categories) {
        logger.info("Fetching complaints by categories={}", categories);
        return complaintRepository.findByCategoryIn(categories);
    }

    // ✅ Get single complaint by ID (safe lookup)
    public Complaint getComplaintById(Long id) {
        logger.debug("Fetching complaint by id={}", id);
        return complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("❌ Complaint not found with ID: " + id));
    }

    // ✅ Save complaint (for updates)
    public Complaint saveComplaint(Complaint complaint) {
        logger.info("Saving complaint id={}", complaint.getId());
        return complaintRepository.save(complaint);
    }

    // ✅ Update complaint status
    public Complaint updateComplaintStatus(Long id, Complaint.Status status) {
        logger.info("Updating complaint id={} with status={}", id, status);
        Complaint complaint = getComplaintById(id);
        complaint.setStatus(status);
        return complaintRepository.save(complaint);
    }

    // ✅ Update complaint priority
    public Complaint updateComplaintPriority(Long id, Complaint.Priority priority) {
        logger.info("Updating complaint id={} with priority={}", id, priority);
        Complaint complaint = getComplaintById(id);
        complaint.setPriority(priority);
        return complaintRepository.save(complaint);
    }

    public Complaint updateComplaint(Long id, Complaint updatedComplaint, User currentUser) {
        logger.info("Updating complaint id={} by user={}", id, currentUser.getEmail());
        Complaint existingComplaint = getComplaintById(id);

        // Security Check: Only the owner or an ADMIN can edit
        if (!existingComplaint.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("❌ Access denied. You can only edit your own complaints or be an ADMIN.");
        }

        existingComplaint.setTitle(updatedComplaint.getTitle());
        existingComplaint.setDescription(updatedComplaint.getDescription());
        existingComplaint.setCategory(updatedComplaint.getCategory());
        existingComplaint.setSubcategory(updatedComplaint.getSubcategory());
        existingComplaint.setLocation(updatedComplaint.getLocation());
        existingComplaint.setContactNumber(updatedComplaint.getContactNumber());
        existingComplaint.setPriority(updatedComplaint.getPriority());

        return complaintRepository.save(existingComplaint);
    }

    public void deleteComplaint(Long id, User currentUser) {
        logger.warn("Attempting to delete complaint id={} by user={}", id, currentUser.getEmail());
        Complaint complaint = getComplaintById(id);

        // Security Check: Only the owner or an ADMIN can delete
        if (!complaint.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("❌ Access denied. You can only delete your own complaints or be an ADMIN.");
        }

        complaintRepository.delete(complaint);
        logger.info("Successfully deleted complaint id={}", id);
    }

    // ✅ Update complaint status with detailed information
    public Complaint updateComplaintStatusDetailed(Long id, UpdateComplaintStatusRequest request, User currentUser) {
        logger.info("Updating detailed status for complaint id={} by user={}", id, currentUser.getEmail());
        Complaint complaint = getComplaintById(id);

        // Only authorities can update status
        if (currentUser.getRole() == User.Role.STUDENT) {
            throw new IllegalArgumentException("❌ Students cannot update complaint status");
        }

        // Role-based category access control
        switch (currentUser.getRole()) {
            case WARDEN:
                if (!List.of("HOSTEL", "MESS").contains(complaint.getCategory())) {
                    throw new IllegalArgumentException("❌ Wardens can only update HOSTEL and MESS complaints");
                }
                break;
            case FACULTY:
                if (!"ACADEMIC".equals(complaint.getCategory())) {
                    throw new IllegalArgumentException("❌ Faculty can only update ACADEMIC complaints");
                }
                break;
            case ADMIN:
                // Admins can update any complaint
                break;
            default:
                throw new IllegalArgumentException("❌ Invalid role for status update");
        }

        complaint.setStatus(request.getStatus());
        complaint.setPriority(request.getPriority());

        return complaintRepository.save(complaint);
    }
    public Complaint updateComplaint(Complaint complaint) {
        return complaintRepository.save(complaint);
    }

}