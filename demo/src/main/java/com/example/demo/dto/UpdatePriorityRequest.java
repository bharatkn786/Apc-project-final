package com.example.demo.dto;

import com.example.demo.model.Complaint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePriorityRequest {
    private Complaint.Priority priority;
}
