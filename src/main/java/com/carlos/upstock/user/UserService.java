package com.carlos.upstock.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(String search, String role, Pageable pageable) {
        Specification<UserModel> spec = Specification.where((root, query, cb) -> cb.conjunction());

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                cb.like(cb.lower(root.get("name")), pattern));
            spec = spec.or((root, query, cb) ->
                cb.like(cb.lower(root.get("email")), pattern));
        }

        if (role != null && !role.isBlank() && !"todos".equalsIgnoreCase(role)) {
            String roleParam = role.toUpperCase();
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("role"), roleParam));
        }

        return userRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getCargo() != null) user.setCargo(request.getCargo());
        if (request.getStoreName() != null) user.setStoreName(request.getStoreName());

        userRepository.save(user);
        return toResponse(user);
    }

    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UserModel user = new UserModel();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCargo(request.getCargo());
        user.setStoreName(request.getStoreName());
        user.setRole(request.getRole() != null ? request.getRole().toUpperCase() : "USER");

        userRepository.save(user);
        log.info("User '{}' ({}) created with role {}", request.getName(), request.getEmail(), user.getRole());
        return toResponse(user);
    }

    public void delete(Long id, Long currentAdminId) {
        if (id.equals(currentAdminId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete your own account");
        }
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.delete(user);
        log.warn("User '{}' ({}) deleted by admin {}", user.getName(), user.getEmail(), currentAdminId);
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (request.getCargo() != null) user.setCargo(request.getCargo());
        if (request.getRole() != null) user.setRole(request.getRole().toUpperCase());
        if (request.getStoreName() != null) user.setStoreName(request.getStoreName());

        userRepository.save(user);
        log.info("User {} updated", user.getEmail());
        return toResponse(user);
    }

    private UserResponse toResponse(UserModel user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCargo(),
                user.getRole(),
                user.getStoreName(),
                user.getCreatedAt()
        );
    }

}
