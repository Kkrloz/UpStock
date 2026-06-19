package com.carlos.upstock.movement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateMovementRequest {
    private Long productId;
    private String productName;
    private String type;
    private Integer quantity;
    private String userName;
}
