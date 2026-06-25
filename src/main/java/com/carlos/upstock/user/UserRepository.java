package com.carlos.upstock.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserModel, Long> {
    Optional<UserModel> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM UserModel u WHERE " +
           "(:search IS NULL OR u.name LIKE CONCAT('%', :search, '%') OR u.email LIKE CONCAT('%', :search, '%')) AND " +
           "(:role IS NULL OR u.role = :role)")
    List<UserModel> searchUsers(@Param("search") String search, @Param("role") String role);
}
