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
public class RatingResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long storeId;
    private String storeName;
    private Integer rating;
    private LocalDateTime createdAt;
}
