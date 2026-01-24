package com.example.english.repository;

import com.example.english.entity.Conversation;
import com.example.english.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, String> {
    List<Conversation> findByUser(User user);
    List<Conversation> findByUserAndStatus(User user, String status);
}


