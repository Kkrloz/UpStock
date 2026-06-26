package com.carlos.upstock.report;

import com.carlos.upstock.movement.MovementModel;
import com.carlos.upstock.movement.MovementRepository;
import com.carlos.upstock.product.ProductModel;
import com.carlos.upstock.product.ProductRepository;
import com.carlos.upstock.user.UserModel;
import com.carlos.upstock.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ProductRepository productRepository;
    private final MovementRepository movementRepository;
    private final UserRepository userRepository;

    public ReportSummary getSummary(String email) {
        UserModel user = getUser(email);
        log.debug("Generating report for {}", email);

        Specification<ProductModel> productSpec = Specification.where((root, query, cb) -> cb.conjunction());
        Specification<MovementModel> movementSpec = Specification.where((root, query, cb) -> cb.conjunction());

        if (!"ADMIN".equals(user.getRole())) {
            productSpec = productSpec.and((root, query, cb) -> cb.equal(root.get("userId"), user.getId()));
            movementSpec = movementSpec.and((root, query, cb) -> cb.equal(root.get("userId"), user.getId()));
        }

        List<ProductModel> products = productRepository.findAll(productSpec);
        int totalProducts = products.size();
        BigDecimal totalValue = products.stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int lowStockCount = (int) products.stream().filter(p -> p.getQuantity() <= 5).count();

        LocalDateTime startOfMonth = LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime now = LocalDateTime.now();

        movementSpec = movementSpec.and((root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("timestamp"), startOfMonth));
        movementSpec = movementSpec.and((root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("timestamp"), now));

        int movementsThisMonth = (int) movementRepository.count(movementSpec);

        return new ReportSummary(totalProducts, totalValue, movementsThisMonth, lowStockCount);
    }

    public List<InventoryItem> getInventory(String email) {
        UserModel user = getUser(email);

        Specification<ProductModel> spec = Specification.where((root, query, cb) -> cb.conjunction());
        if (!"ADMIN".equals(user.getRole())) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), user.getId()));
        }

        return productRepository.findAll(spec).stream()
                .map(p -> {
                    String storeName = null;
                    String userEmail = null;
                    if (p.getUserId() != null) {
                        var owner = userRepository.findById(p.getUserId());
                        if (owner.isPresent()) {
                            String sn = owner.get().getStoreName();
                            if (sn != null && !sn.isBlank()) {
                                storeName = sn;
                            } else {
                                userEmail = owner.get().getEmail();
                            }
                        }
                    }
                    return new InventoryItem(
                            p.getName(),
                            p.getPrice(),
                            p.getQuantity(),
                            p.getPrice().multiply(BigDecimal.valueOf(p.getQuantity())),
                            storeName,
                            userEmail
                    );
                })
                .toList();
    }

    private UserModel getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
