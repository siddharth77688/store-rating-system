package com.storerating.config;

import com.storerating.dto.request.SubmitRatingRequest;
import com.storerating.entity.Store;
import com.storerating.entity.User;
import com.storerating.enums.UserRole;
import com.storerating.repository.StoreRepository;
import com.storerating.repository.UserRepository;
import com.storerating.service.RatingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final RatingService ratingService;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(
            UserRepository userRepository,
            StoreRepository storeRepository,
            RatingService ratingService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.ratingService = ratingService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Database already seeded
        }

        // 1. Create Users
        User admin = User.builder()
                .name("System Administrator Account")
                .email("admin@storerating.com")
                .password(passwordEncoder.encode("AdminPassword123!"))
                .address("123 Admin HQ Street, Suite 100")
                .role(UserRole.ADMIN)
                .build();
        userRepository.save(admin);

        User owner1 = User.builder()
                .name("John Owner Store Account")
                .email("owner1@storerating.com")
                .password(passwordEncoder.encode("OwnerPassword123!"))
                .address("456 Owner Boulevard, Austin, TX")
                .role(UserRole.STORE_OWNER)
                .build();
        userRepository.save(owner1);

        User owner2 = User.builder()
                .name("Sarah Owner Store Account")
                .email("owner2@storerating.com")
                .password(passwordEncoder.encode("OwnerPassword123!"))
                .address("789 Retail Avenue, San Jose, CA")
                .role(UserRole.STORE_OWNER)
                .build();
        userRepository.save(owner2);

        User user1 = User.builder()
                .name("Alice Smith Normal User")
                .email("user1@storerating.com")
                .password(passwordEncoder.encode("UserPassword123!"))
                .address("111 User Residence Lane, Boston, MA")
                .role(UserRole.USER)
                .build();
        userRepository.save(user1);

        User user2 = User.builder()
                .name("Bob Johnson Normal User")
                .email("user2@storerating.com")
                .password(passwordEncoder.encode("UserPassword123!"))
                .address("222 Customer Street, Seattle, WA")
                .role(UserRole.USER)
                .build();
        userRepository.save(user2);

        // 2. Create Stores
        Store store1 = Store.builder()
                .name("SuperMart Grocery Store")
                .email("supermart@groceries.com")
                .address("100 Fresh Lane, Austin, TX")
                .owner(owner1)
                .overallRating(0.0)
                .totalRatings(0)
                .build();
        store1 = storeRepository.save(store1);

        Store store2 = Store.builder()
                .name("TechWorld Electronics")
                .email("contact@techworld.com")
                .address("200 Silicon Avenue, San Jose, CA")
                .owner(owner2)
                .overallRating(0.0)
                .totalRatings(0)
                .build();
        store2 = storeRepository.save(store2);

        Store store3 = Store.builder()
                .name("Cafe Delight Coffee")
                .email("info@cafedelight.com")
                .address("300 Brew Street, Seattle, WA")
                .owner(owner1)
                .overallRating(0.0)
                .totalRatings(0)
                .build();
        store3 = storeRepository.save(store3);

        // 3. Create Ratings via ratingService to ensure store aggregates are recalculated
        SubmitRatingRequest rating1 = new SubmitRatingRequest();
        rating1.setStoreId(store1.getId());
        rating1.setRating(5);
        ratingService.submitRating(user1.getId(), rating1);

        SubmitRatingRequest rating2 = new SubmitRatingRequest();
        rating2.setStoreId(store1.getId());
        rating2.setRating(4);
        ratingService.submitRating(user2.getId(), rating2);

        SubmitRatingRequest rating3 = new SubmitRatingRequest();
        rating3.setStoreId(store2.getId());
        rating3.setRating(3);
        ratingService.submitRating(user1.getId(), rating3);

        SubmitRatingRequest rating4 = new SubmitRatingRequest();
        rating4.setStoreId(store2.getId());
        rating4.setRating(2);
        ratingService.submitRating(user2.getId(), rating4);

        System.out.println(">>> Database seeded successfully with Admin, Owners, Users, Stores, and Ratings!");
    }
}
