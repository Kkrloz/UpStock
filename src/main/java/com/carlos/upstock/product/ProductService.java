package com.carlos.upstock.product;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public List<ProductModel> findAll() {
        return productRepository.findAll();
    }

    public ProductModel findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }
    
    public ProductModel create(ProductModel product) {
        return productRepository.save(product);
    }

    public ProductModel update(Long id, ProductModel updatedProduct) {
        ProductModel product = findById(id);
        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPrice(updatedProduct.getPrice());
        product.setQuantity(updatedProduct.getQuantity());
        return productRepository.save(product);
    }

    public void delete(Long id) {
        ProductModel product = findById(id);
        productRepository.delete(product);
    }
}
