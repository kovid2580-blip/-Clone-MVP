package com.reddit.clone.service;

import com.reddit.clone.dto.PostResponse;
import com.reddit.clone.dto.VoteRequest;
import com.reddit.clone.model.Post;
import com.reddit.clone.model.User;
import com.reddit.clone.model.Vote;
import com.reddit.clone.repository.PostRepository;
import com.reddit.clone.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VoteService {
    private final VoteRepository voteRepository;
    private final PostRepository postRepository;
    private final PostService postService;
    private final CurrentUserService currentUserService;

    @Transactional
    public PostResponse vote(Long postId, VoteRequest request) {
        Post post = postService.getEntity(postId);
        User user = currentUserService.getCurrentUser();
        Vote existingVote = voteRepository.findTopByPostAndUserOrderByVoteIdDesc(post, user).orElse(null);

        if (existingVote == null) {
            voteRepository.save(Vote.builder().post(post).user(user).voteType(request.voteType()).build());
            post.setVoteCount(post.getVoteCount() + request.voteType().getDirection());
        } else if (existingVote.getVoteType() != request.voteType()) {
            post.setVoteCount(post.getVoteCount() - existingVote.getVoteType().getDirection()
                    + request.voteType().getDirection());
            existingVote.setVoteType(request.voteType());
        }

        return postService.toResponse(postRepository.save(post));
    }
}
