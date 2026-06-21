package com.storerating.service;

import com.storerating.dto.request.SubmitRatingRequest;
import com.storerating.dto.response.RatingResponse;
import com.storerating.entity.Rating;
import com.storerating.entity.Store;
import com.storerating.entity.User;
import com.storerating.exception.BadRequestException;
import com.storerating.exception.ResourceNotFoundException;
import com.storerating.repository.RatingRepository;
import com.storerating.repository.StoreRepository;
import com.storerating.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public RatingService(
            RatingRepository ratingRepository,
            StoreRepository storeRepository,
            UserRepository userRepository
    ) {
        this.ratingRepository = ratingRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RatingResponse submitRating(Long userId, SubmitRatingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getStoreId()));

        if (store.getOwner() != null && store.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Store owners cannot rate their own stores");
        }

        // Check if rating already exists
        Optional<Rating> existingRatingOpt = ratingRepository.findByStoreIdAndUserId(request.getStoreId(), userId);
        Rating rating;
        if (existingRatingOpt.isPresent()) {
            rating = existingRatingOpt.get();
            rating.setRating(request.getRating());
        } else {
            rating = Rating.builder()
                    .user(user)
                    .store(store)
                    .rating(request.getRating())
                    .build();
        }

        Rating savedRating = ratingRepository.save(rating);

        // Recalculate store ratings statistics
        updateStoreRatingStats(store.getId());

        return mapToRatingResponse(savedRating);
    }

    @Transactional
    public RatingResponse modifyRating(Long userId, Long ratingId, SubmitRatingRequest request) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found with id: " + ratingId));

        if (!rating.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to modify this rating");
        }

        rating.setRating(request.getRating());
        Rating savedRating = ratingRepository.save(rating);

        // Recalculate store ratings statistics
        updateStoreRatingStats(rating.getStore().getId());

        return mapToRatingResponse(savedRating);
    }

    private void updateStoreRatingStats(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        Double avg = ratingRepository.getAverageRatingForStore(storeId);
        Long count = ratingRepository.getRatingCountForStore(storeId);

        // Format overall rating to 1 decimal place
        double formattedAvg = 0.0;
        if (avg != null) {
            formattedAvg = Math.round(avg * 10.0) / 10.0;
        }

        store.setOverallRating(formattedAvg);
        store.setTotalRatings(count != null ? count.intValue() : 0);
        storeRepository.save(store);
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
