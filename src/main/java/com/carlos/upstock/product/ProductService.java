package com.carlos.upstock.product;

import com.carlos.upstock.sse.SseService;
import com.carlos.upstock.user.UserModel;
import com.carlos.upstock.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    public Page<ProductModel> findAll(String email, String search,
                                       BigDecimal minPrice, BigDecimal maxPrice,
                                       Integer minStock, Integer maxStock,
                                       Pageable pageable) {
        UserModel user = getUser(email);

        Specification<ProductModel> spec = Specification.where((root, query, cb) -> cb.conjunction());

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

        Page<ProductModel> products = productRepository.findAll(spec, pageable);

        Set<Long> userIds = products.stream()
                .map(ProductModel::getUserId)
                .collect(Collectors.toSet());
        if (!userIds.isEmpty()) {
            Map<Long, UserModel> userMap = userRepository.findAllById(userIds).stream()
                    .collect(Collectors.toMap(UserModel::getId, u -> u));

            for (ProductModel p : products) {
                if (p.getUserId() != null) {
                    UserModel owner = userMap.get(p.getUserId());
                    if (owner != null) {
                        String sn = owner.getStoreName();
                        if (sn != null && !sn.isBlank()) {
                            p.setStoreName(sn);
                        } else {
                            p.setStoreName(null);
                            p.setUserEmail(owner.getEmail());
                        }
                    }
                }
            }
        }

        log.debug("Found {} products (page {}/{}) for user {}", products.getNumberOfElements(), pageable.getPageNumber(), products.getTotalPages(), email);
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

    public ProductModel create(CreateProductRequest request, String email) {
        UserModel user = getUser(email);
        ProductModel product = new ProductModel();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setUserId(user.getId());
        ProductModel saved = productRepository.save(product);
        log.info("Product '{}' created by {}", saved.getName(), email);
        sseService.broadcast("PRODUCT_CHANGED", saved.getId());
        return saved;
    }

    public ProductModel update(Long id, CreateProductRequest request, String email) {
        ProductModel product = findById(id, email);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        ProductModel saved = productRepository.save(product);
        log.info("Product '{}' updated by {}", saved.getName(), email);
        sseService.broadcast("PRODUCT_CHANGED", saved.getId());
        return saved;
    }

    public void delete(Long id, String email) {
        ProductModel product = findById(id, email);
        productRepository.delete(product);
        log.info("Product '{}' deleted by {}", product.getName(), email);
        sseService.broadcast("PRODUCT_CHANGED", id);
    }

    private UserModel getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

}
