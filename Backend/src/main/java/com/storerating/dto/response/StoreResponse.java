package com.storerating.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreResponse {
    private Long id;
    private String name;
    private String email;
    private String address;
    private UserResponse owner;
    private Double overallRating;
    private Integer totalRatings;
    private LocalDateTime createdAt;
    private Integer userRating; // The rating given by the currently authenticated user
}
