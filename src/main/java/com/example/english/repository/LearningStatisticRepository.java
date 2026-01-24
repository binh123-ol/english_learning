package com.example.english.repository;

import com.example.english.entity.LearningStatistic;
import com.example.english.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LearningStatisticRepository extends JpaRepository<LearningStatistic, String> {
    List<LearningStatistic> findByUser(User user);
    Optional<LearningStatistic> findByUserAndStatDate(User user, LocalDate statDate);
    List<LearningStatistic> findByUserAndStatDateBetween(User user, LocalDate startDate, LocalDate endDate);
}


