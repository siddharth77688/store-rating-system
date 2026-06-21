package com.storerating.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreDetailResponse {
    private StoreResponse store;
    private Map<Integer, Long> ratingsDistribution; // 1 to 5 star frequency count
    private List<RatingResponse> ratings; // List of ratings submitted for this store
}
