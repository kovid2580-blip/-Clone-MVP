package com.reddit.clone.controller;

import com.reddit.clone.dto.CommentRequest;
import com.reddit.clone.dto.CommentResponse;
import com.reddit.clone.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping
    public List<CommentResponse> getByPost(@PathVariable Long postId) {
        return commentService.getByPost(postId);
    }

    @PostMapping
    public CommentResponse create(@PathVariable Long postId, @Valid @RequestBody CommentRequest request) {
        return commentService.create(postId, request);
    }
}
