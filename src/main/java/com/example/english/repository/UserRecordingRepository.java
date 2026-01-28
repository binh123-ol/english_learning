package com.example.english.repository;

import com.example.english.entity.UserRecording;
import com.example.english.entity.UserRecordingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRecordingRepository extends JpaRepository<UserRecording, String> {
    List<UserRecording> findByUserUserId(String userId);

    List<UserRecording> findByUserUserIdAndRecordingType(String userId, UserRecordingType recordingType);

    List<UserRecording> findByReferenceId(String referenceId);
}
