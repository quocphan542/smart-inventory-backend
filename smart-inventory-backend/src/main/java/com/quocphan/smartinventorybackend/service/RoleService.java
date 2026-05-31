package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.RoleDto;
import java.util.List;

public interface RoleService {
    List<RoleDto> getAllRoles();
    RoleDto getRoleById(Integer id);
    RoleDto createRole(RoleDto roleDto);
    RoleDto updateRole(Integer id, RoleDto roleDto);
    void deleteRole(Integer id);
}