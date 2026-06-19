package com.carlos.upstock.movement;

import com.carlos.upstock.product.ProductModel;
import com.carlos.upstock.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovementService {

    private final MovementRepository movementRepository;
    private final ProductRepository productRepository;

    public List<MovementModel> findAll() {
        return movementRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional
    public MovementModel create(CreateMovementRequest request) {
        ProductModel product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

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
        movement.setStatus("Confirmado");

        return movementRepository.save(movement);
    }
}
