package com.example.english.repository;

import com.example.english.entity.Conversation;
import com.example.english.entity.ConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, String> {
    List<ConversationMessage> findByConversation(Conversation conversation);
    List<ConversationMessage> findByConversationOrderBySentAtAsc(Conversation conversation);
}


