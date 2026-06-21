package com.storerating.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 20, max = 60, message = "Name must be between 20 and 60 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\",./<>?]).{8,16}$",
        message = "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
    )
    private String password;

    @NotBlank(message = "Address is required")
    @Size(max = 400, message = "Address must not exceed 400 characters")
    private String address;

    @NotBlank(message = "Role is required")
    private String role; // USER, STORE_OWNER, ADMIN
}
