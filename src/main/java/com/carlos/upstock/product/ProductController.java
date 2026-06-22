package com.carlos.upstock.product;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ProductModel> findAll(Authentication authentication) {
        return productService.findAll(authentication.getName());
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductModel findById(@PathVariable Long id, Authentication authentication) {
        return productService.findById(id, authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductModel create(@RequestBody ProductModel product, Authentication authentication) {
        return productService.create(product, authentication.getName());
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductModel update(@PathVariable Long id, @RequestBody ProductModel product, Authentication authentication) {
        return productService.update(id, product, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        productService.delete(id, authentication.getName());
    }
}
