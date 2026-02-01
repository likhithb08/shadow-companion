package com.PA.ShadowAi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.PA.ShadowAi.Model.Friend;

public interface FriendRepository extends JpaRepository<Friend, Long> {
}
