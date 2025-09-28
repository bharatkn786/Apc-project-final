package com.example.demo.controller;
import org.springframework.http.ResponseEntity;

import com.example.demo.dto.ComplaintRequest;
import com.example.demo.dto.UpdateStatusRequest;
import com.example.demo.dto.UpdatePriorityRequest;
import com.example.demo.model.Complaint;
import com.example.demo.model.User;
import com.example.demo.model.ComplaintStatusUpdate;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ComplaintStatusUpdateRepository;
import com.example.demo.service.ComplaintService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private static final Logger logger = LoggerFactory.getLogger(ComplaintController.class);

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    private final ComplaintStatusUpdateRepository statusUpdateRepository; // Add this

    public ComplaintController(ComplaintService complaintService, UserRepository userRepository, ComplaintStatusUpdateRepository statusUpdateRepository) {
        this.complaintService = complaintService;
        this.userRepository = userRepository;
        this.statusUpdateRepository = statusUpdateRepository; // Add this
    }

    // ✅ Create complaint
    @PostMapping

    public Complaint createComplaint(@RequestBody ComplaintRequest request, Authentication authentication) {
        String email = authentication.getName(); // extract user from token
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .subcategory(request.getSubcategory())
                .location(request.getLocation())
                .contactNumber(request.getContactNumber())
                .status(Complaint.Status.NEW)
                .priority(Complaint.Priority.MEDIUM)
                .user(user)
                .build();

        return complaintService.createComplaint(complaint);
    }


    // ✅ Role-based fetching
    @GetMapping
    public List<Complaint> getComplaints(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("❌ User not found with email={}", email);
                    return new IllegalArgumentException("User not found");
                });

        logger.info("📌 Fetch complaints request by user={}, role={}", email, user.getRole());

        switch (user.getRole()) {
            case STUDENT:
                logger.debug("Returning complaints for STUDENT id={}", user.getId());
                return complaintService.getComplaintsByUser(user.getId());

            case WARDEN:
                logger.debug("Returning complaints for WARDEN categories");
                return complaintService.getComplaintsByCategories(
                        List.of("Mess", "Hostel", "Maintenance", "Transport", "Security")
                );

            case FACULTY:
                logger.debug("Returning complaints for FACULTY categories");
                return complaintService.getComplaintsByCategories(List.of("Academic"));

            case ADMIN:
                logger.debug("Returning ALL complaints for ADMIN");
                return complaintService.getAllComplaints();

            default:
                logger.error("❌ Unauthorized role access: {}", user.getRole());
                throw new SecurityException("Unauthorized role");
        }
    }

    // ✅ Get complaints by user (admin or self only)
    @GetMapping("/user/{userId}")
    public List<Complaint> getComplaintsByUser(@PathVariable Long userId, Authentication authentication) {
        String email = authentication.getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("❌ User not found with email={}", email);
                    return new IllegalArgumentException("User not found");
                });

        logger.info("📌 Fetch complaints for userId={} requested by email={}, role={}", userId, email, requester.getRole());

        if (requester.getRole() == User.Role.ADMIN || requester.getId().equals(userId)) {
            return complaintService.getComplaintsByUser(userId);
        } else {
            logger.warn("⚠️ Access denied for user={} trying to fetch complaints for userId={}", email, userId);
            throw new SecurityException("Access denied");
        }
    }

    // ✅ Update complaint status
    @PutMapping("/{id}/status")
    public Complaint updateStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        logger.info("📌 Updating status for complaintId={}, newStatus={}", id, request.getStatus());
        return complaintService.updateComplaintStatus(id, request.getStatus());
    }

    // ✅ Update complaint priority
    @PutMapping("/{id}/priority")
    public Complaint updatePriority(@PathVariable Long id, @RequestBody UpdatePriorityRequest request) {
        logger.info("📌 Updating priority for complaintId={}, newPriority={}", id, request.getPriority());
        return complaintService.updateComplaintPriority(id, request.getPriority());
    }
    @GetMapping("/resolved")
    public List<Complaint> getResolvedComplaints(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        logger.info("📌 Fetch resolved complaints request by user={}, role={}", email, user.getRole());

        switch (user.getRole()) {
            case STUDENT:
                return complaintService.getComplaintsByUser(user.getId()).stream()
                        .filter(complaint -> complaint.getStatus() == Complaint.Status.RESOLVED)
                        .collect(Collectors.toList());

            case WARDEN:
                List<String> wardenCategories = List.of("Hostel", "Mess", "Maintenance", "Transport", "Security");
                return complaintService.getComplaintsByCategories(wardenCategories).stream()
                        .filter(complaint -> complaint.getStatus() == Complaint.Status.RESOLVED)
                        .collect(Collectors.toList());

            case FACULTY:
                return complaintService.getComplaintsByCategories(List.of("Academic")).stream()
                        .filter(complaint -> complaint.getStatus() == Complaint.Status.RESOLVED)
                        .collect(Collectors.toList());

            case ADMIN:
                return complaintService.getAllComplaints().stream()
                        .filter(complaint -> complaint.getStatus() == Complaint.Status.RESOLVED)
                        .collect(Collectors.toList());

            default:
                return List.of();
        }
    }
    // ...existing code...

    // ✅ Update complaint (for students to edit their own complaints)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComplaint(
            @PathVariable Long id,
            @RequestBody ComplaintRequest request,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            logger.info("📌 Update complaint request for id={} by user={}, role={}", id, email, user.getRole());

            // Get the existing complaint
            Complaint existingComplaint = complaintService.getComplaintById(id);

            // Check if user owns this complaint (students can only edit their own)
            if (user.getRole() == User.Role.STUDENT && !existingComplaint.getUser().getId().equals(user.getId())) {
                logger.warn("⚠️ Student {} attempted to edit complaint {} owned by another user", email, id);
                return ResponseEntity.status(403).body("You can only edit your own complaints");
            }

            // Check if complaint can still be edited (only NEW or IN_PROGRESS complaints)
            if (existingComplaint.getStatus() == Complaint.Status.RESOLVED ||
                    existingComplaint.getStatus() == Complaint.Status.REJECTED) {
                return ResponseEntity.status(400).body("Cannot edit resolved or rejected complaints");
            }

            // Update the complaint fields
            existingComplaint.setTitle(request.getTitle());
            existingComplaint.setDescription(request.getDescription());
            existingComplaint.setCategory(request.getCategory());
            existingComplaint.setSubcategory(request.getSubcategory());
            existingComplaint.setLocation(request.getLocation());
            existingComplaint.setContactNumber(request.getContactNumber());

            // Save the updated complaint
            Complaint updatedComplaint = complaintService.updateComplaint(existingComplaint);

            logger.info("✅ Complaint {} updated successfully by user {}", id, email);
            return ResponseEntity.ok(updatedComplaint);

        } catch (Exception e) {
            logger.error("❌ Error updating complaint {}: {}", id, e.getMessage());
            return ResponseEntity.status(500).body("Error updating complaint: " + e.getMessage());
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Complaint existingComplaint = complaintService.getComplaintById(id);

        // Only allow admin or the owner to delete
        if (user.getRole() != User.Role.ADMIN && !existingComplaint.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("You can only delete your own complaints");
        }

        complaintService.deleteComplaint(id, user);
        return ResponseEntity.ok("Complaint deleted successfully");
    }
    // ...existing code...
// ...existing code...

    @PutMapping("/{id}/update-status")
    public ResponseEntity<?> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            logger.info("📌 Update status request for complaint {} by user {}, role {}", id, email, user.getRole());

            // Only authorities can update status
            if (user.getRole() == User.Role.STUDENT) {
                return ResponseEntity.status(403).body("Students cannot update complaint status");
            }

            // Get the complaint
            Complaint complaint = complaintService.getComplaintById(id);

            // Role-based category access control
            switch (user.getRole()) {
                case WARDEN:
                    List<String> wardenCategories = List.of("Hostel", "Mess", "Maintenance", "Transport", "Security");
                    if (!wardenCategories.contains(complaint.getCategory())) {
                        return ResponseEntity.status(403).body("Wardens can only update Hostel, Mess, Maintenance, Transport, and Security complaints");
                    }
                    break;
                case FACULTY:
                    if (!"Academic".equals(complaint.getCategory())) {
                        return ResponseEntity.status(403).body("Faculty can only update Academic complaints");
                    }
                    break;
                case ADMIN:
                    // Admins can update any complaint
                    break;
                default:
                    return ResponseEntity.status(403).body("Invalid role for status update");
            }

            // Extract data from request
            String statusStr = (String) request.get("status");
            String comments = (String) request.get("comments");
            String nextSteps = (String) request.get("nextSteps");
            String expectedCompletionDateStr = (String) request.get("expectedCompletionDate");

            // Update complaint status
            Complaint.Status newStatus = Complaint.Status.valueOf(statusStr);
            Complaint.Status oldStatus = complaint.getStatus();
            complaint.setStatus(newStatus);

            // Save the updated complaint
            Complaint updatedComplaint = complaintService.saveComplaint(complaint);

            // Create status update record for history tracking
            ComplaintStatusUpdate.ComplaintStatusUpdateBuilder builder = ComplaintStatusUpdate.builder()
                    .complaint(complaint)
                    .status(newStatus)
                    .message(comments)
                    .workProgress(comments) // Use comments as work progress
                    .nextSteps(nextSteps)
                    .updatedByUser(user) // Set the entire User object
                    .updatedAt(java.time.LocalDate.now());

            // Add expected completion date if provided
            if (expectedCompletionDateStr != null && !expectedCompletionDateStr.isEmpty()) {
                try {
                    LocalDate expectedDate = LocalDate.parse(expectedCompletionDateStr);
                    builder.expectedCompletionDate(expectedDate);
                } catch (Exception e) {
                    logger.warn("Invalid date format for expected completion: {}", expectedCompletionDateStr);
                }
            }

            statusUpdateRepository.save(builder.build());

            logger.info("✅ Complaint {} status updated from {} to {} by {}", id, oldStatus, newStatus, email);
            return ResponseEntity.ok(updatedComplaint);

        } catch (Exception e) {
            logger.error("❌ Error updating complaint status for {}: {}", id, e.getMessage());
            return ResponseEntity.status(500).body("Error updating complaint status: " + e.getMessage());
        }
    }

// ...existing code...
    // ...existing code...

    @GetMapping("/{id}/status-history")
    public ResponseEntity<List<ComplaintStatusUpdate>> getComplaintStatusHistory(
            @PathVariable Long id,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Get the complaint to check access
            Complaint complaint = complaintService.getComplaintById(id);

            // Check if user has access to this complaint
            boolean hasAccess = false;
            switch (user.getRole()) {
                case STUDENT:
                    hasAccess = complaint.getUser().getId().equals(user.getId());
                    break;
                case WARDEN:
                    List<String> wardenCategories = List.of("Hostel", "Mess", "Maintenance", "Transport", "Security");
                    hasAccess = wardenCategories.contains(complaint.getCategory());
                    break;
                case FACULTY:
                    hasAccess = "Academic".equals(complaint.getCategory());
                    break;
                case ADMIN:
                    hasAccess = true;
                    break;
            }

            if (!hasAccess) {
                return ResponseEntity.status(403).body(null);
            }

            List<ComplaintStatusUpdate> history = statusUpdateRepository.findByComplaintIdOrderByUpdatedAtDesc(id);
            return ResponseEntity.ok(history);

        } catch (Exception e) {
            logger.error("❌ Error fetching status history for complaint {}: {}", id, e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

// ...existing code...

// ...existing code...

// ...existing code...
}
