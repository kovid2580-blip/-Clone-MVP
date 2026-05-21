package com.reddit.clone.service;

import com.reddit.clone.dto.PostRequest;
import com.reddit.clone.dto.PostResponse;
import com.reddit.clone.exception.NotFoundException;
import com.reddit.clone.model.Post;
import com.reddit.clone.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final SubredditService subredditService;
    private final CurrentUserService currentUserService;

    public PostResponse create(PostRequest request) {
        Post post = postRepository.save(Post.builder()
                .postName(request.postName())
                .url(request.url())
                .description(request.description())
                .subreddit(subredditService.getEntity(request.subredditId()))
                .user(currentUserService.getCurrentUser())
                .build());
        return toResponse(post);
    }

    public List<PostResponse> getAll(String sortBy) {
        Sort sort = "popular".equalsIgnoreCase(sortBy)
                ? Sort.by(Sort.Direction.DESC, "voteCount")
                : Sort.by(Sort.Direction.DESC, "createdDate");
        return postRepository.findAll(sort).stream().map(this::toResponse).toList();
    }

    public List<PostResponse> getBySubreddit(Long subredditId) {
        return postRepository.findBySubredditOrderByCreatedDateDesc(subredditService.getEntity(subredditId))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Post getEntity(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Post not found"));
    }

    public PostResponse toResponse(Post post) {
        return new PostResponse(
                post.getPostId(),
                post.getPostName(),
                post.getUrl(),
                post.getDescription(),
                post.getVoteCount(),
                post.getUser().getUsername(),
                post.getSubreddit().getId(),
                post.getSubreddit().getName(),
                post.getCreatedDate());
    }
}
