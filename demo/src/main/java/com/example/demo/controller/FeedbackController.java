
package com.example.demo.controller;

        import com.example.demo.model.ComplaintStatusUpdate;
        import com.example.demo.model.Complaint;
        import com.example.demo.model.User;
        import com.example.demo.repository.ComplaintStatusUpdateRepository;
        import com.example.demo.service.ComplaintService;
        import com.example.demo.service.UserService;
        import org.slf4j.Logger;
        import org.slf4j.LoggerFactory;
        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.http.HttpStatus;
        import org.springframework.http.ResponseEntity;
        import org.springframework.security.core.Authentication;
        import org.springframework.web.bind.annotation.*;

        import java.time.LocalDateTime;
        import java.util.List;
        import java.util.Map;
        import java.util.Optional;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);

    @Autowired
    private ComplaintStatusUpdateRepository statusUpdateRepository;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserService userService;

    // Submit feedback for a resolved complaint
    @PostMapping("/complaint/{id}")
    public ResponseEntity<?> submitFeedback(
            @PathVariable Long id,
            @RequestBody Map<String, Object> feedbackData,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User student = userService.getUserByEmail(email);

            logger.info("Feedback submission attempt for complaint {} by user {}", id, email);

            // Check if complaint exists and is resolved
            Complaint complaint = complaintService.getComplaintById(id);
            if (!complaint.getStatus().equals(Complaint.Status.RESOLVED)) {
                return ResponseEntity.badRequest().body("Complaint is not resolved yet");
            }

            // Find the RESOLVED status update record for this complaint
            Optional<ComplaintStatusUpdate> resolvedStatusUpdate =
                    statusUpdateRepository.findResolvedStatusUpdateByComplaintId(id);

            if (!resolvedStatusUpdate.isPresent()) {
                return ResponseEntity.badRequest().body("No resolved status update found for this complaint");
            }

            ComplaintStatusUpdate statusUpdate = resolvedStatusUpdate.get();

            // Check if feedback already exists
            if (statusUpdate.getStudentFeedback() != null) {
                return ResponseEntity.badRequest().body("Feedback already submitted for this complaint");
            }

            // Add feedback to the existing status update record
            statusUpdate.setStudentFeedback((String) feedbackData.get("feedback"));
            statusUpdate.setSatisfactionRating((Integer) feedbackData.get("satisfactionRating"));
            statusUpdate.setIsFullySolved((Boolean) feedbackData.get("isFullySolved"));
            statusUpdate.setWouldRecommend((Boolean) feedbackData.get("wouldRecommend"));
            statusUpdate.setFeedbackSubmittedAt(LocalDateTime.now());

            // Save the updated status record
            statusUpdateRepository.save(statusUpdate);

            logger.info("Feedback successfully submitted for complaint {} by user {}", id, email);
            return ResponseEntity.ok("Feedback submitted successfully");

        } catch (Exception e) {
            logger.error("Error submitting feedback for complaint {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Get feedback for specific complaint
    @GetMapping("/complaint/{id}")
    public ResponseEntity<ComplaintStatusUpdate> getComplaintFeedback(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);

            logger.info("Feedback retrieval request for complaint {} by user {}", id, email);

            // Find the feedback for this complaint
            Optional<ComplaintStatusUpdate> feedbackOptional =
                    statusUpdateRepository.findResolvedStatusUpdateByComplaintId(id);

            if (!feedbackOptional.isPresent() || feedbackOptional.get().getStudentFeedback() == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(feedbackOptional.get());

        } catch (Exception e) {
            logger.error("Error retrieving feedback for complaint {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Check if student has already provided feedback for a complaint
    @GetMapping("/complaint/{id}/status")
    public ResponseEntity<Map<String, Boolean>> checkFeedbackStatus(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);

            logger.info("Checking feedback status for complaint {} by user {}", id, email);

            // Find the resolved status update for this complaint
            Optional<ComplaintStatusUpdate> statusUpdateOptional =
                    statusUpdateRepository.findResolvedStatusUpdateByComplaintId(id);

            boolean feedbackProvided = false;
            if (statusUpdateOptional.isPresent()) {
                ComplaintStatusUpdate statusUpdate = statusUpdateOptional.get();
                feedbackProvided = statusUpdate.getStudentFeedback() != null;
            }

            Map<String, Boolean> response = Map.of("feedbackProvided", feedbackProvided);
            logger.info("Feedback status for complaint {}: {}", id, feedbackProvided);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error checking feedback status for complaint {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }
}