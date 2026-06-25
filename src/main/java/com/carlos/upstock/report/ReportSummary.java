package com.carlos.upstock.report;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ReportSummary {
    private int totalProducts;
    private BigDecimal totalValue;
    private int movementsThisMonth;
    private int lowStockCount;
}
