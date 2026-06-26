package com.carlos.upstock.security;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    @Schema(example = "admin@upstock.com", description = "Email do usuário")
    private String email;

    @NotBlank(message = "Password is required")
    @Schema(example = "123456", description = "Senha do usuário")
    private String password;
}
