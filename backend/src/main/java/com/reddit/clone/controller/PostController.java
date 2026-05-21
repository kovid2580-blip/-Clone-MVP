package com.reddit.clone.controller;

import com.reddit.clone.dto.PostRequest;
import com.reddit.clone.dto.PostResponse;
import com.reddit.clone.dto.VoteRequest;
import com.reddit.clone.service.PostService;
import com.reddit.clone.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final VoteService voteService;

    @GetMapping
    public List<PostResponse> getAll(@RequestParam(defaultValue = "latest") String sort) {
        return postService.getAll(sort);
    }

    @PostMapping
    public PostResponse create(@Valid @RequestBody PostRequest request) {
        return postService.create(request);
    }

    @PostMapping("/{postId}/vote")
    public PostResponse vote(@PathVariable Long postId, @Valid @RequestBody VoteRequest request) {
        return voteService.vote(postId, request);
    }
}
