package com.storerating.repository;

import com.storerating.entity.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByStoreIdAndUserId(Long storeId, Long userId);
    List<Rating> findByStoreId(Long storeId);
    Page<Rating> findByStoreId(Long storeId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.store.id = :storeId")
    Double getAverageRatingForStore(@Param("storeId") Long storeId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.store.id = :storeId")
    Long getRatingCountForStore(@Param("storeId") Long storeId);

    @Query("SELECT r.rating, COUNT(r) FROM Rating r WHERE r.store.id = :storeId GROUP BY r.rating")
    List<Object[]> getRatingDistributionForStore(@Param("storeId") Long storeId);
}
