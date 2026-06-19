package com.carlos.upstock.movement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovementRepository extends JpaRepository<MovementModel, Long> {
    List<MovementModel> findAllByOrderByTimestampDesc();
}
