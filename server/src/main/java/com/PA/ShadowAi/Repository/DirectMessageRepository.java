package com.PA.ShadowAi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.PA.ShadowAi.Model.DirectMessage;

public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {
}
