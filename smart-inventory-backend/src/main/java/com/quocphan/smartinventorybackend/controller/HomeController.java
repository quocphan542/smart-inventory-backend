package com.quocphan.smartinventorybackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String welcome() {
        return "Kết nối Backend Smart Inventory thành công rồi nhé!";
    }
}