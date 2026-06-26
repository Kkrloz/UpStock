package com.carlos.upstock.security;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    @Schema(description = "Access token JWT (24h)")
    private String token;

    @Schema(description = "Refresh token JWT (7 dias)")
    private String refreshToken;

    @Schema(example = "Admin")
    private String name;

    @Schema(example = "admin@upstock.com")
    private String email;
}
