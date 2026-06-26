package com.carlos.upstock.report;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    @ResponseStatus(HttpStatus.OK)
    public ReportSummary getSummary(Authentication authentication) {
        return reportService.getSummary(authentication.getName());
    }

    @GetMapping("/inventory")
    @ResponseStatus(HttpStatus.OK)
    public List<InventoryItem> getInventory(Authentication authentication) {
        return reportService.getInventory(authentication.getName());
    }
}
