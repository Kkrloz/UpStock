package com.carlos.upstock.security;

import com.carlos.upstock.user.CreateUserRequest;
import com.carlos.upstock.user.UserModel;
import com.carlos.upstock.user.UserRepository;
import com.carlos.upstock.user.UserResponse;
import com.carlos.upstock.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Auth", description = "Autenticação e gerenciamento de sessão")
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginRateLimiter rateLimiter;
    private final UserService userService;

    @Operation(summary = "Alterar senha", description = "Altera a senha do usuário autenticado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Senha alterada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Senhas não conferem"),
        @ApiResponse(responseCode = "401", description = "Senha atual incorreta")
    })
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            log.warn("Password change failed: passwords do not match for {}", authentication.getName());
            return ResponseEntity.badRequest().build();
        }

        UserModel user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Password change failed: wrong current password for {}", authentication.getName());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for {}", authentication.getName());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Registrar", description = "Cria um novo usuário e retorna os tokens")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuário registrado com sucesso"),
        @ApiResponse(responseCode = "409", description = "Email já cadastrado")
    })
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody CreateUserRequest request) {
        UserResponse user = userService.create(request);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        log.info("User {} registered successfully", user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token, refreshToken, user.getName(), user.getEmail()));
    }

    @Operation(summary = "Login", description = "Autentica o usuário e retorna tokens de acesso e refresh")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login bem-sucedido"),
        @ApiResponse(responseCode = "401", description = "Credenciais inválidas"),
        @ApiResponse(responseCode = "429", description = "Muitas tentativas de login")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        if (rateLimiter.isBlocked(httpRequest)) {
            log.warn("Rate limit exceeded for login from IP: {}", httpRequest.getRemoteAddr());
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }

        var userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            rateLimiter.recordAttempt(httpRequest);
            log.warn("Failed login attempt for {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserModel user = userOpt.get();
        rateLimiter.reset(request.getEmail());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        log.info("User {} logged in successfully", user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token, refreshToken, user.getName(), user.getEmail()));
    }

    @Operation(summary = "Renovar token", description = "Gera novos tokens de acesso e refresh a partir do refresh token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tokens renovados"),
        @ApiResponse(responseCode = "401", description = "Refresh token inválido ou expirado")
    })
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody Map<String, String> body) {
        String rt = body.get("refreshToken");
        if (rt == null || !jwtUtil.isValidRefreshToken(rt)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = jwtUtil.extractEmail(rt);
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserModel user = userOpt.get();
        String newToken = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        log.debug("Token refreshed for {}", email);
        return ResponseEntity.ok(new LoginResponse(newToken, newRefreshToken, user.getName(), user.getEmail()));
    }

}
