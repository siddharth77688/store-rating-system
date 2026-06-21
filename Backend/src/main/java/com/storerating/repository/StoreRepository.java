package com.storerating.repository;

import com.storerating.entity.Store;
import com.storerating.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByOwner(User owner);
    Optional<Store> findFirstByOwner(User owner);

    @Query("SELECT s FROM Store s WHERE " +
           "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR LOWER(s.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:address IS NULL OR LOWER(s.address) LIKE LOWER(CONCAT('%', :address, '%')))")
    Page<Store> findFilteredStores(
            @Param("name") String name,
            @Param("email") String email,
            @Param("address") String address,
            Pageable pageable
    );

    @Query("SELECT s FROM Store s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.address) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Store> searchStores(@Param("search") String search, Pageable pageable);
}
