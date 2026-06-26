package com.carlos.upstock.movement;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Tag(name = "Movements", description = "Movimentações de estoque (entrada/saída)")
@Slf4j
@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
public class MovementController {

    private final MovementService movementService;

    @Operation(summary = "Listar movimentações", description = "Retorna movimentações paginadas com filtros opcionais")
    @GetMapping
    public Page<MovementModel> findAll(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 100) Pageable pageable
    ) {
        return movementService.findAll(authentication.getName(), search, type, startDate, endDate, pageable);
    }

    @Operation(summary = "Registrar movimentação", description = "Registra entrada ou saída de estoque")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Movimentação registrada"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou estoque insuficiente"),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovementModel create(@Valid @RequestBody CreateMovementRequest request, Authentication authentication) {
        return movementService.create(request, authentication.getName());
    }

}
