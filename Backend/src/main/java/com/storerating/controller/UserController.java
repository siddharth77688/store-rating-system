package com.storerating.controller;

import com.storerating.dto.request.CreateUserRequest;
import com.storerating.dto.request.UpdatePasswordRequest;
import com.storerating.dto.response.ApiResponse;
import com.storerating.dto.response.DashboardStatsResponse;
import com.storerating.dto.response.UserResponse;
import com.storerating.enums.UserRole;
import com.storerating.repository.RatingRepository;
import com.storerating.repository.StoreRepository;
import com.storerating.repository.UserRepository;
import com.storerating.security.CustomUserDetails;
import com.storerating.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final RatingRepository ratingRepository;

    public UserController(
            UserService userService,
            UserRepository userRepository,
            StoreRepository storeRepository,
            RatingRepository ratingRepository
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.ratingRepository = ratingRepository;
    }

    // Common route for updating password
    @PutMapping("/users/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdatePasswordRequest request
    ) {
        userService.updatePassword(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully", null));
    }

    // Admin Routes
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getFilteredUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order
    ) {
        Sort.Direction direction = order.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort));
        Page<UserResponse> users = userService.getFilteredUsers(name, email, address, role, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", response));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/admin/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalStores = storeRepository.count();
        long totalRatings = ratingRepository.count();
        
        long adminCount = userRepository.countByRole(UserRole.ADMIN);
        long storeOwnerCount = userRepository.countByRole(UserRole.STORE_OWNER);
        long normalUserCount = userRepository.countByRole(UserRole.USER);

        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalStores(totalStores)
                .totalRatings(totalRatings)
                .adminCount(adminCount)
                .storeOwnerCount(storeOwnerCount)
                .normalUserCount(normalUserCount)
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
