package com.carlos.upstock.product;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public Page<ProductModel> findAll(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Integer maxStock,
            @PageableDefault(size = 100) Pageable pageable
    ) {
        return productService.findAll(authentication.getName(), search, minPrice, maxPrice, minStock, maxStock, pageable);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductModel findById(@PathVariable Long id, Authentication authentication) {
        return productService.findById(id, authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductModel create(@Valid @RequestBody CreateProductRequest request, Authentication authentication) {
        return productService.create(request, authentication.getName());
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductModel update(@PathVariable Long id, @Valid @RequestBody CreateProductRequest request, Authentication authentication) {
        return productService.update(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        productService.delete(id, authentication.getName());
    }

}
