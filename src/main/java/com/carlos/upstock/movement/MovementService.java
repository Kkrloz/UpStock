package com.carlos.upstock.movement;

import com.carlos.upstock.product.ProductModel;
import com.carlos.upstock.product.ProductRepository;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovementService {

    private final MovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    @Transactional(readOnly = true)
    public Page<MovementModel> findAll(String email, String search, String type,
                                        LocalDateTime startDate, LocalDateTime endDate,
                                        Pageable pageable) {
        UserModel user = getUser(email);

        Specification<MovementModel> spec = Specification.where((root, query, cb) -> cb.conjunction());

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                cb.like(cb.lower(root.get("productName")), pattern));
        }
        if (type != null && !type.isBlank() && !"todos".equalsIgnoreCase(type)) {
            String finalType = type.toUpperCase();
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("type"), finalType));
        }
        if (startDate != null) {
            spec = spec.and((root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("timestamp"), startDate));
        }
        if (endDate != null) {
            spec = spec.and((root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("timestamp"), endDate));
        }

        if (!"ADMIN".equals(user.getRole())) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("userId"), user.getId()));
        }

        return movementRepository.findAll(spec, pageable);
    }

    @Transactional
    public MovementModel create(CreateMovementRequest request, String email) {
        UserModel user = getUser(email);

        ProductModel product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!"ADMIN".equals(user.getRole()) && !product.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        String type = request.getType().toUpperCase();
        if (!type.equals("ENTRADA") && !type.equals("SAIDA")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type must be ENTRADA or SAIDA");
        }

        if (type.equals("SAIDA") && product.getQuantity() < request.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock");
        }

        int newQuantity = type.equals("ENTRADA")
                ? product.getQuantity() + request.getQuantity()
                : product.getQuantity() - request.getQuantity();
        product.setQuantity(newQuantity);
        productRepository.save(product);

        MovementModel movement = new MovementModel();
        movement.setProductId(request.getProductId());
        movement.setProductName(request.getProductName());
        movement.setType(type);
        movement.setQuantity(request.getQuantity());
        movement.setUserName(request.getUserName());
        movement.setUserId(user.getId());
        movement.setStatus("Confirmado");

        MovementModel saved = movementRepository.save(movement);
        log.info("Movement {} ({} qty {}) created by {}", type, request.getProductName(), request.getQuantity(), email);
        sseService.broadcast("MOVEMENT_CREATED", saved.getId());
        sseService.broadcast("PRODUCT_CHANGED", request.getProductId());
        return saved;
    }

    private UserModel getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

}
