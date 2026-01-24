package com.example.english.repository;

import com.example.english.entity.User;
import com.example.english.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserProgressRepository extends JpaRepository<UserProgress, String> {
    List<UserProgress> findByUser(User user);

    List<UserProgress> findByUserAndStatus(User user, String status);

    List<UserProgress> findByUserAndProgressType(User user, String progressType);

    List<UserProgress> findByUserAndReferenceIdAndProgressType(User user, String referenceId, String progressType);
}
