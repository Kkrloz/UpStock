package com.carlos.upstock.movement;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
public class MovementController {

    private final MovementService movementService;

    @GetMapping
    public List<MovementModel> findAll(Authentication authentication) {
        return movementService.findAll(authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovementModel create(@RequestBody CreateMovementRequest request, Authentication authentication) {
        return movementService.create(request, authentication.getName());
    }
}
