package com.carlos.upstock.product;

import com.carlos.upstock.sse.SseService;
import com.carlos.upstock.user.UserModel;
import com.carlos.upstock.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    public List<ProductModel> findAll(String email, String search,
                                       BigDecimal minPrice, BigDecimal maxPrice,
                                       Integer minStock, Integer maxStock) {
        UserModel user = getUser(email);

        Specification<ProductModel> spec = Specification.where((Specification<ProductModel>) null);

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                cb.like(cb.lower(root.get("name")), pattern));
        }
        if (minPrice != null) {
            spec = spec.and((root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
        if (minStock != null) {
            spec = spec.and((root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("quantity"), minStock));
        }
        if (maxStock != null) {
            spec = spec.and((root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("quantity"), maxStock));
        }

        if (!"ADMIN".equals(user.getRole())) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("userId"), user.getId()));
        }

        List<ProductModel> products = productRepository.findAll(spec);

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
        ProductModel saved = productRepository.save(product);
        sseService.broadcast("PRODUCT_CHANGED", saved.getId());
        return saved;
    }

    public ProductModel update(Long id, ProductModel updatedProduct, String email) {
        ProductModel product = findById(id, email);
        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPrice(updatedProduct.getPrice());
        product.setQuantity(updatedProduct.getQuantity());
        ProductModel saved = productRepository.save(product);
        sseService.broadcast("PRODUCT_CHANGED", saved.getId());
        return saved;
    }

    public void delete(Long id, String email) {
        ProductModel product = findById(id, email);
        productRepository.delete(product);
        sseService.broadcast("PRODUCT_CHANGED", id);
    }

    private UserModel getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

}
