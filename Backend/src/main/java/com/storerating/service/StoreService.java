package com.storerating.service;

import com.storerating.dto.request.CreateStoreRequest;
import com.storerating.dto.response.RatingResponse;
import com.storerating.dto.response.StoreDetailResponse;
import com.storerating.dto.response.StoreResponse;
import com.storerating.dto.response.UserResponse;
import com.storerating.entity.Rating;
import com.storerating.entity.Store;
import com.storerating.entity.User;
import com.storerating.enums.UserRole;
import com.storerating.exception.BadRequestException;
import com.storerating.exception.ResourceNotFoundException;
import com.storerating.repository.RatingRepository;
import com.storerating.repository.StoreRepository;
import com.storerating.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;
    private final UserService userService;

    public StoreService(
            StoreRepository storeRepository,
            UserRepository userRepository,
            RatingRepository ratingRepository,
            UserService userService
    ) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.ratingRepository = ratingRepository;
        this.userService = userService;
    }

    @Transactional
    public StoreResponse createStore(CreateStoreRequest request) {
        User owner = null;
        if (request.getOwnerId() != null) {
            owner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Owner not found with id: " + request.getOwnerId()));
            
            if (owner.getRole() != UserRole.STORE_OWNER) {
                throw new BadRequestException("Assigned owner must have STORE_OWNER role");
            }
        }

        Store store = Store.builder()
                .name(request.getName())
                .email(request.getEmail())
                .address(request.getAddress())
                .owner(owner)
                .overallRating(0.0)
                .totalRatings(0)
                .build();

        Store savedStore = storeRepository.save(store);
        return mapToStoreResponse(savedStore, null);
    }

    @Transactional(readOnly = true)
    public Page<StoreResponse> getFilteredStores(String name, String email, String address, Long currentUserId, Pageable pageable) {
        Page<Store> stores = storeRepository.findFilteredStores(name, email, address, pageable);
        return stores.map(store -> mapToStoreResponse(store, currentUserId));
    }

    @Transactional(readOnly = true)
    public Page<StoreResponse> searchStores(String query, Long currentUserId, Pageable pageable) {
        Page<Store> stores;
        if (query == null || query.trim().isEmpty()) {
            stores = storeRepository.findAll(pageable);
        } else {
            stores = storeRepository.searchStores(query.trim(), pageable);
        }
        return stores.map(store -> mapToStoreResponse(store, currentUserId));
    }

    @Transactional(readOnly = true)
    public StoreDetailResponse getStoreDetail(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        List<Rating> ratings = ratingRepository.findByStoreId(storeId);
        List<RatingResponse> ratingResponses = ratings.stream()
                .map(this::mapToRatingResponse)
                .collect(Collectors.toList());

        // Calculate distribution
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }
        ratings.forEach(r -> {
            int val = r.getRating();
            distribution.put(val, distribution.getOrDefault(val, 0L) + 1);
        });

        return StoreDetailResponse.builder()
                .store(mapToStoreResponse(store, null))
                .ratingsDistribution(distribution)
                .ratings(ratingResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public StoreDetailResponse getStoreDetailForOwner(Long ownerUserId) {
        User owner = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        Store store = storeRepository.findFirstByOwner(owner)
                .orElseThrow(() -> new ResourceNotFoundException("No store associated with this store owner"));

        return getStoreDetail(store.getId());
    }

    public StoreResponse mapToStoreResponse(Store store, Long currentUserId) {
        Integer userRating = null;
        if (currentUserId != null) {
            Optional<Rating> ratingOpt = ratingRepository.findByStoreIdAndUserId(store.getId(), currentUserId);
            if (ratingOpt.isPresent()) {
                userRating = ratingOpt.get().getRating();
            }
        }

        UserResponse ownerResponse = null;
        if (store.getOwner() != null) {
            ownerResponse = userService.mapToUserResponse(store.getOwner());
        }

        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .email(store.getEmail())
                .address(store.getAddress())
                .owner(ownerResponse)
                .overallRating(store.getOverallRating())
                .totalRatings(store.getTotalRatings())
                .createdAt(store.getCreatedAt())
                .userRating(userRating)
                .build();
    }

    private RatingResponse mapToRatingResponse(Rating rating) {
        return RatingResponse.builder()
                .id(rating.getId())
                .userId(rating.getUser().getId())
                .userName(rating.getUser().getName())
                .storeId(rating.getStore().getId())
                .storeName(rating.getStore().getName())
                .rating(rating.getRating())
                .createdAt(rating.getCreatedAt())
                .build();
    }
}
