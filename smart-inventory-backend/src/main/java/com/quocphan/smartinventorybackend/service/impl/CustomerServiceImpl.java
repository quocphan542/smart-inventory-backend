package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.CustomerDto;
import com.quocphan.smartinventorybackend.entity.Customer;
import com.quocphan.smartinventorybackend.entity.User;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.CustomerRepository;
import com.quocphan.smartinventorybackend.repository.UserRepository;
import com.quocphan.smartinventorybackend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return convertToDto(customer);
    }

    @Override
    @Transactional
    public CustomerDto createCustomer(CustomerDto customerDto) {
        Customer customer = convertToEntity(customerDto);
        Customer savedCustomer = customerRepository.save(customer);
        return convertToDto(savedCustomer);
    }

    @Override
    @Transactional
    public CustomerDto updateCustomer(Integer id, CustomerDto customerDto) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        existingCustomer.setCustomerName(customerDto.getCustomerName());
        existingCustomer.setPhone(customerDto.getPhone());
        existingCustomer.setEmail(customerDto.getEmail());
        existingCustomer.setAddress(customerDto.getAddress());
        
        if(customerDto.getIsActive() != null) {
            existingCustomer.setIsActive(customerDto.getIsActive());
        }

        if (customerDto.getUserId() != null) {
            User user = userRepository.findById(customerDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + customerDto.getUserId()));
            existingCustomer.setUser(user);
        } else {
            existingCustomer.setUser(null);
        }

        Customer updatedCustomer = customerRepository.save(existingCustomer);
        return convertToDto(updatedCustomer);
    }

    @Override
    @Transactional
    public void deleteCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        customerRepository.delete(customer);
    }

    @Override
    @Transactional
    public void toggleCustomerStatus(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        
        if (customer.getIsActive() == null) {
            customer.setIsActive(false);
        } else {
            customer.setIsActive(!customer.getIsActive());
        }
        
        customerRepository.save(customer);
    }

    private CustomerDto convertToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setCustomerName(customer.getCustomerName());
        dto.setPhone(customer.getPhone());
        dto.setEmail(customer.getEmail());
        dto.setAddress(customer.getAddress());
        dto.setIsActive(customer.getIsActive());
        if (customer.getUser() != null) {
            dto.setUserId(customer.getUser().getId());
        }
        return dto;
    }

    private Customer convertToEntity(CustomerDto dto) {
        Customer customer = new Customer();
        customer.setCustomerName(dto.getCustomerName());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());
        customer.setAddress(dto.getAddress());
        customer.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));
            customer.setUser(user);
        }

        return customer;
    }
}