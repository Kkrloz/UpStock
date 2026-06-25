package com.carlos.upstock.report;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class InventoryItem {
    private String productName;
    private BigDecimal price;
    private int quantity;
    private BigDecimal totalValue;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String storeName;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String userEmail;
}
