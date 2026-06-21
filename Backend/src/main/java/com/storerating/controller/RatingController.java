package com.storerating.controller;

import com.storerating.dto.request.SubmitRatingRequest;
import com.storerating.dto.response.ApiResponse;
import com.storerating.dto.response.RatingResponse;
import com.storerating.security.CustomUserDetails;
import com.storerating.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<RatingResponse>> submitRating(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SubmitRatingRequest request
    ) {
        RatingResponse response = ratingService.submitRating(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Rating submitted successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<RatingResponse>> modifyRating(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody SubmitRatingRequest request
    ) {
        RatingResponse response = ratingService.modifyRating(userDetails.getUser().getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Rating updated successfully", response));
    }
}
