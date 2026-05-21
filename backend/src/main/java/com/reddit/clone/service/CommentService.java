package com.reddit.clone.service;

import com.reddit.clone.dto.CommentRequest;
import com.reddit.clone.dto.CommentResponse;
import com.reddit.clone.model.Comment;
import com.reddit.clone.model.Post;
import com.reddit.clone.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostService postService;
    private final CurrentUserService currentUserService;

    public CommentResponse create(Long postId, CommentRequest request) {
        Comment comment = commentRepository.save(Comment.builder()
                .text(request.text())
                .post(postService.getEntity(postId))
                .user(currentUserService.getCurrentUser())
                .build());
        return toResponse(comment);
    }

    public List<CommentResponse> getByPost(Long postId) {
        Post post = postService.getEntity(postId);
        return commentRepository.findByPost(post).stream().map(this::toResponse).toList();
    }

    private CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getUser().getUsername(),
                comment.getCreatedDate());
    }
}
