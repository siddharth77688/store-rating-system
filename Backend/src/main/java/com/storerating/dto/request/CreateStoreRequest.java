package com.storerating.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateStoreRequest {
    @NotBlank(message = "Store name is required")
    @Size(max = 100, message = "Store name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Store email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Store address is required")
    @Size(max = 400, message = "Store address must not exceed 400 characters")
    private String address;

    private Long ownerId; // Owner User ID (Optional)
}
