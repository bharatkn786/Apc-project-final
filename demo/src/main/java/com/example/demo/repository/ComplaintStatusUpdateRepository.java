
package com.example.demo.repository;

        import com.example.demo.model.ComplaintStatusUpdate;
        import org.springframework.data.jpa.repository.JpaRepository;
        import org.springframework.data.jpa.repository.Query;
        import org.springframework.data.repository.query.Param;

        import java.util.List;
        import java.util.Optional;

public interface ComplaintStatusUpdateRepository extends JpaRepository<ComplaintStatusUpdate, Long> {

    // Find all status updates for a complaint
    List<ComplaintStatusUpdate> findByComplaintIdOrderByUpdatedAtDesc(Long complaintId);

    // Find the resolved status update for a complaint (for feedback)
    @Query("SELECT csu FROM ComplaintStatusUpdate csu WHERE csu.complaint.id = :complaintId AND csu.status = 'RESOLVED'")
    Optional<ComplaintStatusUpdate> findResolvedStatusUpdateByComplaintId(@Param("complaintId") Long complaintId);

    // Find all status updates with feedback
    @Query("SELECT csu FROM ComplaintStatusUpdate csu WHERE csu.studentFeedback IS NOT NULL")
    List<ComplaintStatusUpdate> findAllWithFeedback();

    // Find status updates by complaint ID
    List<ComplaintStatusUpdate> findByComplaintId(Long complaintId);
}