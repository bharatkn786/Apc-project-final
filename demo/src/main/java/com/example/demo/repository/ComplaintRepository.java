package com.example.demo.repository;

import com.example.demo.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    // ✅ Get complaints of a specific user
    List<Complaint> findByUser_Id(Long userId);

    // ✅ Get all complaints with user details
    @Query("SELECT c FROM Complaint c JOIN FETCH c.user")
    List<Complaint> findAllWithUser();

    // ✅ Filter by Status
    List<Complaint> findByStatus(Complaint.Status status);

    // ✅ Filter by Priority
    List<Complaint> findByPriority(Complaint.Priority priority);

    // ✅ Filter by both Status and Priority
    List<Complaint> findByStatusAndPriority(Complaint.Status status, Complaint.Priority priority);

    // ✅ NEW: Get complaints by categories (for Warden & Faculty)
    List<Complaint> findByCategoryIn(List<String> categories);
}
