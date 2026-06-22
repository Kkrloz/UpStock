package com.carlos.upstock.product;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "products")
public class ProductModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Transient
    @JsonProperty
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String storeName;

    @Transient
    @JsonProperty
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String userEmail;

}
