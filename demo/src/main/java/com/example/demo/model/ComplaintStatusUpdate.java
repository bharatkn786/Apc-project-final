package com.example.demo.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;
import com.example.demo.model.Complaint.Status;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_status_updates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class ComplaintStatusUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JoinColumn(name = "complaint_id", nullable = false)
    @JsonIgnore   // <--- Add this
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false) // CORRECT MAPPING
    private Status status;

    @Column(columnDefinition = "TEXT")
    private String message;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_user_id", nullable = false)
    @JsonIgnore            // ← prevents serializing the lazy proxy
    private User updatedByUser;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    // Work progress tracking fields
    @Column(name = "work_progress", columnDefinition = "TEXT")
    private String workProgress;

    @Column(name = "next_steps", columnDefinition = "TEXT")
    private String nextSteps;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    // Feedback fields
    @Column(name = "student_feedback", columnDefinition = "TEXT")
    private String studentFeedback;

    @Column(name = "satisfaction_rating")
    private Integer satisfactionRating;

    @Column(name = "is_fully_solved")
    private Boolean isFullySolved;

    @Column(name = "would_recommend")
    private Boolean wouldRecommend;

    @Column(name = "feedback_submitted_at")
    private LocalDateTime feedbackSubmittedAt;
}