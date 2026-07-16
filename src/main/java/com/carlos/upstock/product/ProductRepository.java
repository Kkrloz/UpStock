package com.carlos.upstock.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ProductRepository extends JpaRepository<ProductModel, Long>, JpaSpecificationExecutor<ProductModel> {
    List<ProductModel> findByUserId(Long userId);
}
