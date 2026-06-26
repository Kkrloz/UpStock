package com.carlos.upstock.user;

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
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Users", description = "Gerenciamento de usuários")
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Dados do usuário atual")
    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return userService.findByEmail(authentication.getName());
    }

    @Operation(summary = "Atualizar perfil do usuário atual")
    @PutMapping("/me")
    public UserResponse updateMe(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(authentication.getName(), request);
    }

    @Operation(summary = "Listar usuários", description = "Apenas admin. Retorna usuários paginados com filtros")
    @GetMapping
    public Page<UserResponse> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @PageableDefault(size = 100) Pageable pageable
    ) {
        return userService.findAll(search, role, pageable);
    }

    @Operation(summary = "Atualizar usuário", description = "Apenas admin. Atualiza dados de um usuário")
    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }

    @Operation(summary = "Criar usuário", description = "Apenas admin. Cria um novo usuário")
    @ApiResponse(responseCode = "201", description = "Usuário criado")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @Operation(summary = "Excluir usuário", description = "Apenas admin. Não permite auto-exclusão")
    @ApiResponse(responseCode = "204", description = "Usuário excluído")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        UserResponse currentUser = userService.findByEmail(authentication.getName());
        userService.delete(id, currentUser.getId());
    }

}
