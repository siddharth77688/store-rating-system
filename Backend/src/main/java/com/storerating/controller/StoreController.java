package com.storerating.controller;

import com.storerating.dto.request.CreateStoreRequest;
import com.storerating.dto.response.ApiResponse;
import com.storerating.dto.response.RatingResponse;
import com.storerating.dto.response.StoreDetailResponse;
import com.storerating.dto.response.StoreResponse;
import com.storerating.security.CustomUserDetails;
import com.storerating.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    // Admin Routes
    @GetMapping("/admin/stores")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<StoreResponse>>> getAdminFilteredStores(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String address,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order
    ) {
        Sort.Direction direction = order.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort));
        Page<StoreResponse> stores = storeService.getFilteredStores(name, email, address, null, pageable);
        return ResponseEntity.ok(ApiResponse.success(stores));
    }

    @PostMapping("/admin/stores")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoreResponse>> createStore(@Valid @RequestBody CreateStoreRequest request) {
        StoreResponse response = storeService.createStore(request);
        return ResponseEntity.ok(ApiResponse.success("Store created successfully", response));
    }

    // User Routes
    @GetMapping("/stores")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<StoreResponse>>> searchStores(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Sort.Direction direction = order.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort));
        Long currentUserId = userDetails != null ? userDetails.getUser().getId() : null;
        Page<StoreResponse> stores = storeService.searchStores(search, currentUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(stores));
    }

    @GetMapping("/stores/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> getStoreDetail(@PathVariable Long id) {
        StoreDetailResponse detail = storeService.getStoreDetail(id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    // Owner Routes
    @GetMapping("/owner/dashboard")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> getOwnerStoreDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        StoreDetailResponse detail = storeService.getStoreDetailForOwner(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @GetMapping("/owner/ratings")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<List<RatingResponse>>> getOwnerStoreRatings(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        StoreDetailResponse detail = storeService.getStoreDetailForOwner(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(detail.getRatings()));
    }
}
