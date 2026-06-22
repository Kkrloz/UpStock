package com.carlos.upstock.product;

import com.carlos.upstock.user.UserModel;
import com.carlos.upstock.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<ProductModel> findAll(String email) {
        UserModel user = getUser(email);
        if ("ADMIN".equals(user.getRole())) {
            List<ProductModel> products = productRepository.findAll();
            for (ProductModel p : products) {
                if (p.getUserId() != null) {
                    userRepository.findById(p.getUserId())
                        .ifPresent(owner -> {
                            String sn = owner.getStoreName();
                            if (sn != null && !sn.isBlank()) {
                                p.setStoreName(sn);
                            } else {
                                p.setStoreName(null);
                                p.setUserEmail(owner.getEmail());
                            }
                        });
                }
            }
            return products;
        }
        return productRepository.findByUserId(user.getId());
    }

    public ProductModel findById(Long id, String email) {
        ProductModel product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        UserModel user = getUser(email);
        if (!"ADMIN".equals(user.getRole()) && !product.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return product;
    }

    public ProductModel create(ProductModel product, String email) {
        UserModel user = getUser(email);
        product.setUserId(user.getId());
        return productRepository.save(product);
    }

    public ProductModel update(Long id, ProductModel updatedProduct, String email) {
        ProductModel product = findById(id, email);
        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPrice(updatedProduct.getPrice());
        product.setQuantity(updatedProduct.getQuantity());
        return productRepository.save(product);
    }

    public void delete(Long id, String email) {
        ProductModel product = findById(id, email);
        productRepository.delete(product);
    }

    private UserModel getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

}
