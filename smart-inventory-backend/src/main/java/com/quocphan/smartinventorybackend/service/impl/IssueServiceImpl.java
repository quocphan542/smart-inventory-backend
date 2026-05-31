package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.IssueDetailDto;
import com.quocphan.smartinventorybackend.dto.IssueDto;
import com.quocphan.smartinventorybackend.dto.IssueRequestDto;
import com.quocphan.smartinventorybackend.entity.*;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.*;
import com.quocphan.smartinventorybackend.service.InventoryStockService;
import com.quocphan.smartinventorybackend.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Triển khai interface IssueService.
 * Chịu trách nhiệm xử lý các nghiệp vụ liên quan đến Xuất kho.
 */
@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final InventoryIssueRepository issueRepository;
    private final IssueDetailRepository detailRepository;
    private final InventoryStockService stockService;
    private final InventoryLogRepository logRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final UnitConversionRepository conversionRepository;

    /**
     * Tạo phiếu xuất kho mới.
     * Quá trình này bao gồm: lưu phiếu xuất, chuyển đổi đơn vị tính (nếu cần),
     * cập nhật số lượng tồn kho vật lý (trừ đi) và ghi log.
     *
     * @param requestDto Dữ liệu của phiếu xuất.
     * @return Phiếu xuất đã được tạo.
     */
    @Override
    @Transactional
    public InventoryIssue createIssue(IssueRequestDto requestDto) {
        InventoryIssue issue = new InventoryIssue();
        issue.setIssueCode(requestDto.getIssueCode());
        issue.setWarehouse(new Warehouse(requestDto.getWarehouseId()));
        issue.setCustomer(new Customer(requestDto.getCustomerId()));
        issue.setCreatedBy(requestDto.getCreatedBy());
        issue.setNotes(requestDto.getNotes());
        issue.setIssueDate(requestDto.getIssueDate());
        issue.setIssueStatus(requestDto.getIssueStatus());
        issue.setTotalAmount(requestDto.getTotalAmount());
        InventoryIssue savedIssue = issueRepository.save(issue);

        for (IssueDetailDto detailDto : requestDto.getDetails()) {
            Product product = productRepository.findById(detailDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + detailDto.getProductId()));
            Unit unit = unitRepository.findById(detailDto.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + detailDto.getUnitId()));
            Unit baseUnit = product.getBaseUnit();

            int originalQuantity = detailDto.getQuantity();
            int convertedQuantity = originalQuantity;

            if (baseUnit != null && !unit.getId().equals(baseUnit.getId())) {
                UnitConversion conversion = conversionRepository
                        .findByProductAndFromUnitAndToUnit(product, unit, baseUnit)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No conversion rule found for product '" + product.getProductName() +
                                "' from '" + unit.getUnitName() + "' to '" + baseUnit.getUnitName() + "'"));

                convertedQuantity = new BigDecimal(originalQuantity).multiply(conversion.getFactor()).intValue();
            }

            IssueDetail detail = new IssueDetail();
            detail.setInventoryIssue(savedIssue);
            detail.setProduct(product);
            detail.setQuantity(originalQuantity);
            detail.setUnitId(unit.getId());
            detail.setUnitPrice(detailDto.getUnitPrice());
            detail.setBatchNumber(detailDto.getBatchNumber());
            detailRepository.save(detail);

            stockService.updateStockFromIssue(
                    product.getId(),
                    savedIssue.getWarehouse().getId(),
                    detail.getBatchNumber(),
                    convertedQuantity
            );

            InventoryLog log = new InventoryLog();
            log.setProductId(product.getId());
            log.setWarehouse(savedIssue.getWarehouse());
            log.setTransactionType("ISSUE");
            log.setQuantity(-convertedQuantity);
            log.setTransactionId(savedIssue.getId());
            log.setCreatedAt(LocalDateTime.now());
            logRepository.save(log);
        }
        return savedIssue;
    }

    /**
     * Lấy danh sách tất cả các phiếu xuất.
     *
     * @return Danh sách DTO của phiếu xuất.
     */
    @Override
    public List<IssueDto> getAllIssues() {
        return issueRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Xóa một phiếu xuất theo ID.
     * Lưu ý: Trong thực tế, cần xử lý hoàn tác tồn kho trước khi xóa.
     *
     * @param id ID của phiếu xuất cần xóa.
     */
    @Override
    @Transactional
    public void deleteIssue(Integer id) {
        if (!issueRepository.existsById(id)) {
            throw new ResourceNotFoundException("Issue not found with id: " + id);
        }
        detailRepository.deleteByInventoryIssueId(id);
        issueRepository.deleteById(id);
    }

    private IssueDto convertToDto(InventoryIssue issue) {
        IssueDto dto = new IssueDto();
        dto.setId(issue.getId());
        dto.setIssueCode(issue.getIssueCode());
        if (issue.getCustomer() != null) {
            dto.setCustomerName(issue.getCustomer().getCustomerName());
        }
        dto.setIssueDate(issue.getIssueDate());
        dto.setStatus(issue.getIssueStatus());
        return dto;
    }
}