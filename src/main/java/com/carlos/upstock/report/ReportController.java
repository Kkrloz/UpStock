package com.carlos.upstock.report;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Reports", description = "Relatórios e inventário")
@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "Resumo do relatório", description = "Retorna totais de produtos, valor em estoque, movimentações do mês e alertas")
    @GetMapping("/summary")
    @ResponseStatus(HttpStatus.OK)
    public ReportSummary getSummary(Authentication authentication) {
        return reportService.getSummary(authentication.getName());
    }

    @Operation(summary = "Inventário completo", description = "Retorna lista detalhada de todos os produtos com valores")
    @GetMapping("/inventory")
    @ResponseStatus(HttpStatus.OK)
    public List<InventoryItem> getInventory(Authentication authentication) {
        return reportService.getInventory(authentication.getName());
    }
}
