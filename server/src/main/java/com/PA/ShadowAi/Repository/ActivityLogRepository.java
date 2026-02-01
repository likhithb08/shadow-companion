package com.PA.ShadowAi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.PA.ShadowAi.Model.ActivityLog;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
}
