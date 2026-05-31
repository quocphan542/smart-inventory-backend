package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.IssueDto;
import com.quocphan.smartinventorybackend.dto.IssueRequestDto;
import com.quocphan.smartinventorybackend.entity.InventoryIssue;

import java.util.List;

public interface IssueService {
    InventoryIssue createIssue(IssueRequestDto requestDto);
    List<IssueDto> getAllIssues();
    void deleteIssue(Integer id);
}