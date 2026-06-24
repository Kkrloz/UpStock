package com.carlos.upstock.movement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface MovementRepository extends JpaRepository<MovementModel, Long>, JpaSpecificationExecutor<MovementModel> {
    List<MovementModel> findAllByOrderByTimestampDesc();
    List<MovementModel> findByUserIdOrderByTimestampDesc(Long userId);
}
