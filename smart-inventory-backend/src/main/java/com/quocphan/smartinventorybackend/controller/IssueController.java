package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.IssueDto;
import com.quocphan.smartinventorybackend.dto.IssueRequestDto;
import com.quocphan.smartinventorybackend.entity.InventoryIssue;
import com.quocphan.smartinventorybackend.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private static final Logger logger = LoggerFactory.getLogger(IssueController.class);
    private final IssueService issueService;

    @GetMapping
    public ResponseEntity<?> getAllIssues() {
        try {
            List<IssueDto> issues = issueService.getAllIssues();
            return ResponseEntity.ok(issues);
        } catch (Exception e) {
            logger.error("Error fetching all issues", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching all issues");
        }
    }

    @PostMapping
    public ResponseEntity<?> createIssue(@RequestBody IssueRequestDto requestDto) {
        try {
            InventoryIssue createdIssue = issueService.createIssue(requestDto);
            return ResponseEntity.ok(createdIssue);
        } catch (Exception e) {
            logger.error("Error creating issue", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating issue");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIssue(@PathVariable Integer id, @RequestBody IssueRequestDto requestDto) {
        try {
            // return ResponseEntity.ok(issueService.updateIssue(id, requestDto));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error updating issue with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating issue");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable Integer id) {
        try {
            issueService.deleteIssue(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting issue with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting issue");
        }
    }
}