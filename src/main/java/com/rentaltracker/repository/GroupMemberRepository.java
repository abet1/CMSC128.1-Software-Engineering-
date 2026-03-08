package com.rentaltracker.repository;

import com.rentaltracker.entity.GroupMember;
import com.rentaltracker.entity.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    List<GroupMember> findByGroupId(UUID groupId);

    @Transactional
    void deleteByIdGroupIdAndIdPersonId(UUID groupId, UUID personId);
}
