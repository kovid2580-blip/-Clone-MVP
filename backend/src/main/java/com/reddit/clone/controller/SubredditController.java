package com.reddit.clone.controller;

import com.reddit.clone.dto.PostResponse;
import com.reddit.clone.dto.SubredditRequest;
import com.reddit.clone.dto.SubredditResponse;
import com.reddit.clone.service.PostService;
import com.reddit.clone.service.SubredditService;
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
@RequestMapping("/api/subreddits")
@RequiredArgsConstructor
public class SubredditController {
    private final SubredditService subredditService;
    private final PostService postService;

    @GetMapping
    public List<SubredditResponse> getAll() {
        return subredditService.getAll();
    }

    @GetMapping("/{subredditId}/posts")
    public List<PostResponse> getPosts(@PathVariable Long subredditId) {
        return postService.getBySubreddit(subredditId);
    }

    @PostMapping
    public SubredditResponse create(@Valid @RequestBody SubredditRequest request) {
        return subredditService.create(request);
    }
}
