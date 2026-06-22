package com.carlos.upstock.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {

    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 6, message = "Password must have at least 6 characters")
    private String password;

    private String cargo;

    private String role;

    private String storeName;

}
