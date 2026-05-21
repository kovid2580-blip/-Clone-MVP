package com.reddit.clone.service;

import com.reddit.clone.dto.SubredditRequest;
import com.reddit.clone.dto.SubredditResponse;
import com.reddit.clone.exception.NotFoundException;
import com.reddit.clone.model.Subreddit;
import com.reddit.clone.repository.SubredditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubredditService {
    private final SubredditRepository subredditRepository;
    private final CurrentUserService currentUserService;

    public SubredditResponse create(SubredditRequest request) {
        if (subredditRepository.findByName(request.name()).isPresent()) {
            throw new IllegalArgumentException("Community name is already taken");
        }
        Subreddit subreddit = subredditRepository.save(Subreddit.builder()
                .name(request.name())
                .description(request.description())
                .user(currentUserService.getCurrentUser())
                .build());
        return toResponse(subreddit);
    }

    public List<SubredditResponse> getAll() {
        return subredditRepository.findAll().stream().map(this::toResponse).toList();
    }

    public Subreddit getEntity(Long id) {
        return subredditRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Community not found"));
    }

    private SubredditResponse toResponse(Subreddit subreddit) {
        return new SubredditResponse(
                subreddit.getId(),
                subreddit.getName(),
                subreddit.getDescription(),
                subreddit.getUser().getUsername(),
                subreddit.getCreatedDate());
    }
}
