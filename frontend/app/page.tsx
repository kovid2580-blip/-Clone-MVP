"use client";

import {
  ArrowBigDown,
  ArrowBigUp,
  Loader2,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  RefreshCcw,
  Send,
  UserPlus
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Community = {
  id: number;
  name: string;
  description: string;
  username: string;
  createdDate: string;
};

type Post = {
  postId: number;
  postName: string;
  url?: string;
  description?: string;
  voteCount: number;
  author: string;
  subredditId: number;
  subredditName: string;
  createdDate: string;
};

type Comment = {
  id: number;
  text: string;
  author: string;
  createdDate: string;
};

type AuthMode = "login" | "register";
type SortMode = "latest" | "popular";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    let message = "Something went wrong";
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [selectedCommunity, setSelectedCommunity] = useState<number | "all">("all");
  const [sort, setSort] = useState<SortMode>("latest");
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [communityForm, setCommunityForm] = useState({ name: "", description: "" });
  const [postForm, setPostForm] = useState({ postName: "", url: "", description: "", subredditId: "" });
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});

  const selectedCommunityName = useMemo(() => {
    if (selectedCommunity === "all") {
      return "Home";
    }
    return communities.find((community) => community.id === selectedCommunity)?.name ?? "Community";
  }, [communities, selectedCommunity]);

  const visiblePosts = useMemo(() => {
    if (selectedCommunity === "all") {
      return posts;
    }
    return posts.filter((post) => post.subredditId === selectedCommunity);
  }, [posts, selectedCommunity]);

  useEffect(() => {
    const storedToken = localStorage.getItem("reddit-clone-token");
    const storedUsername = localStorage.getItem("reddit-clone-username");
    setToken(storedToken);
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    void loadData();
  }, [sort]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [communityData, postData] = await Promise.all([
        apiRequest<Community[]>("/subreddits"),
        apiRequest<Post[]>(`/posts?sort=${sort}`)
      ]);
      setCommunities(communityData);
      setPosts(postData);
      if (!postForm.subredditId && communityData[0]) {
        setPostForm((current) => ({ ...current, subredditId: String(communityData[0].id) }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load app data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("auth");
    setError(null);
    setNotice(null);
    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/register";
      const body =
        authMode === "login"
          ? { username: authForm.username, password: authForm.password }
          : authForm;
      const data = await apiRequest<{ token: string; username: string }>(path, {
        method: "POST",
        body: JSON.stringify(body)
      });
      localStorage.setItem("reddit-clone-token", data.token);
      localStorage.setItem("reddit-clone-username", data.username);
      setToken(data.token);
      setUsername(data.username);
      setAuthForm({ username: "", email: "", password: "" });
      setNotice(`Signed in as ${data.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusyAction(null);
    }
  }

  function logout() {
    localStorage.removeItem("reddit-clone-token");
    localStorage.removeItem("reddit-clone-username");
    setToken(null);
    setUsername(null);
    setNotice("Signed out");
  }

  async function createCommunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("community");
    setError(null);
    try {
      const community = await apiRequest<Community>(
        "/subreddits",
        {
          method: "POST",
          body: JSON.stringify(communityForm)
        },
        token
      );
      setCommunities((current) => [community, ...current]);
      setSelectedCommunity(community.id);
      setPostForm((current) => ({ ...current, subredditId: String(community.id) }));
      setCommunityForm({ name: "", description: "" });
      setNotice(`Created r/${community.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create community");
    } finally {
      setBusyAction(null);
    }
  }

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("post");
    setError(null);
    try {
      const post = await apiRequest<Post>(
        "/posts",
        {
          method: "POST",
          body: JSON.stringify({
            postName: postForm.postName,
            url: postForm.url || null,
            description: postForm.description || null,
            subredditId: Number(postForm.subredditId)
          })
        },
        token
      );
      setPosts((current) => [post, ...current]);
      setSelectedCommunity(post.subredditId);
      setPostForm((current) => ({ postName: "", url: "", description: "", subredditId: current.subredditId }));
      setNotice("Post published");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create post");
    } finally {
      setBusyAction(null);
    }
  }

  async function vote(postId: number, voteType: "UPVOTE" | "DOWNVOTE") {
    setBusyAction(`vote-${postId}`);
    setError(null);
    try {
      const updated = await apiRequest<Post>(
        `/posts/${postId}/vote`,
        {
          method: "POST",
          body: JSON.stringify({ voteType })
        },
        token
      );
      setPosts((current) => current.map((post) => (post.postId === postId ? updated : post)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to vote");
    } finally {
      setBusyAction(null);
    }
  }

  async function loadComments(postId: number) {
    setBusyAction(`comments-${postId}`);
    setError(null);
    try {
      const data = await apiRequest<Comment[]>(`/posts/${postId}/comments`);
      setComments((current) => ({ ...current, [postId]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load comments");
    } finally {
      setBusyAction(null);
    }
  }

  async function createComment(event: FormEvent<HTMLFormElement>, postId: number) {
    event.preventDefault();
    setBusyAction(`comment-${postId}`);
    setError(null);
    try {
      const comment = await apiRequest<Comment>(
        `/posts/${postId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ text: commentDrafts[postId] })
        },
        token
      );
      setComments((current) => ({ ...current, [postId]: [...(current[postId] ?? []), comment] }));
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to comment");
    } finally {
      setBusyAction(null);
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
        <section className="grid w-full max-w-5xl overflow-hidden rounded border border-silver bg-white shadow-soft md:grid-cols-[1fr_420px]">
          <div className="flex min-h-[520px] flex-col justify-between bg-gradient-to-br from-slate-800 via-ash to-silver p-8 text-white">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-xl font-black text-ink">
                r
              </span>
              <h1 className="mt-8 max-w-md text-4xl font-black leading-tight">Welcome to reddit clone</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-100">
                Sign in first to create communities, publish posts, vote, and join discussions.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-ink">{authMode === "login" ? "Login" : "Create account"}</h2>
                <p className="mt-1 text-sm text-ash">Continue to the home feed.</p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-100"
                onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                type="button"
              >
                {authMode === "login" ? <UserPlus size={16} /> : <LogIn size={16} />}
                {authMode === "login" ? "Register" : "Login"}
              </button>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleAuth}>
              <input
                className="w-full rounded border border-silver px-3 py-3 text-sm outline-none focus:border-mint"
                onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Username"
                required
                value={authForm.username}
              />
              {authMode === "register" ? (
                <input
                  className="w-full rounded border border-silver px-3 py-3 text-sm outline-none focus:border-mint"
                  onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email"
                  required
                  type="email"
                  value={authForm.email}
                />
              ) : null}
              <input
                className="w-full rounded border border-silver px-3 py-3 text-sm outline-none focus:border-mint"
                minLength={6}
                onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
                required
                type="password"
                value={authForm.password}
              />
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-mint px-4 py-3 text-sm font-black text-ink hover:bg-green-300"
                disabled={busyAction === "auth"}
                type="submit"
              >
                {busyAction === "auth" ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
                {authMode === "login" ? "Login" : "Create account"}
              </button>
            </form>

            {notice ? <p className="mt-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p> : null}
            {error ? <p className="mt-4 rounded border border-silver bg-slate-50 px-4 py-3 text-sm text-slate-700">{error}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button
            className="flex items-center gap-2 text-left"
            onClick={() => setSelectedCommunity("all")}
            type="button"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-lg font-black text-ink">
              r
            </span>
            <span>
              <span className="block text-base font-bold text-ink">reddit clone</span>
              <span className="block text-xs text-slate-500">Spring Boot + Next.js</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              onClick={loadData}
              title="Refresh feed"
              type="button"
            >
              <RefreshCcw size={18} />
            </button>
            {username ? (
              <button
                className="inline-flex items-center gap-2 rounded bg-mint px-3 py-2 text-sm font-semibold text-ink hover:bg-green-300"
                onClick={logout}
                type="button"
              >
                <LogOut size={17} />
                {username}
              </button>
            ) : (
              <span className="hidden text-sm text-slate-500 sm:inline">Sign in to post, vote, and comment</span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="space-y-4">
          <section className="rounded border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Communities</h2>
            </div>
            <div className="max-h-[360px] overflow-auto p-2">
              <button
                className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm ${
                  selectedCommunity === "all" ? "bg-green-50 font-bold text-ink" : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedCommunity("all")}
                type="button"
              >
                Home
                <span className="text-xs text-slate-400">{posts.length}</span>
              </button>
              {communities.map((community) => (
                <button
                  className={`mt-1 block w-full rounded px-3 py-2 text-left text-sm ${
                    selectedCommunity === community.id
                      ? "bg-green-50 font-bold text-ink"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  key={community.id}
                  onClick={() => setSelectedCommunity(community.id)}
                  type="button"
                >
                  <span className="block truncate">r/{community.name}</span>
                  <span className="block truncate text-xs font-normal text-slate-500">{community.description}</span>
                </button>
              ))}
              {!loading && communities.length === 0 ? (
                <p className="px-3 py-6 text-sm text-slate-500">No communities yet.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-sm font-bold text-ink">Create Community</h2>
            <form className="mt-3 space-y-3" onSubmit={createCommunity}>
              <input
                className="w-full rounded border border-silver px-3 py-2 text-sm outline-none focus:border-mint"
                disabled={!token}
                onChange={(event) => setCommunityForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="community-name"
                required
                value={communityForm.name}
              />
              <textarea
                className="min-h-20 w-full resize-y rounded border border-silver px-3 py-2 text-sm outline-none focus:border-mint"
                disabled={!token}
                onChange={(event) => setCommunityForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="What is this community about?"
                required
                value={communityForm.description}
              />
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-mint px-3 py-2 text-sm font-bold text-ink hover:bg-green-300"
                disabled={!token || busyAction === "community"}
                type="submit"
              >
                {busyAction === "community" ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                Create
              </button>
            </form>
          </section>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="rounded border border-slate-200 bg-white p-3 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-black text-ink">{selectedCommunityName}</h1>
                <p className="text-sm text-slate-500">{visiblePosts.length} posts</p>
              </div>
              <div className="inline-grid grid-cols-2 rounded border border-slate-300 bg-slate-50 p-1">
                {(["latest", "popular"] as SortMode[]).map((mode) => (
                  <button
                    className={`rounded px-3 py-1.5 text-sm font-semibold ${
                      sort === mode ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink"
                    }`}
                    key={mode}
                    onClick={() => setSort(mode)}
                    type="button"
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <section className="rounded border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-sm font-bold text-ink">Create Post</h2>
            <form className="mt-3 grid gap-3" onSubmit={createPost}>
              <input
                className="w-full rounded border border-silver px-3 py-2 text-sm outline-none focus:border-mint"
                disabled={!token}
                onChange={(event) => setPostForm((current) => ({ ...current, postName: event.target.value }))}
                placeholder="Title"
                required
                value={postForm.postName}
              />
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <input
                  className="w-full rounded border border-silver px-3 py-2 text-sm outline-none focus:border-mint"
                  disabled={!token}
                  onChange={(event) => setPostForm((current) => ({ ...current, url: event.target.value }))}
                  placeholder="Optional link"
                  type="url"
                  value={postForm.url}
                />
                <select
                  className="w-full rounded border border-silver bg-white px-3 py-2 text-sm outline-none focus:border-mint"
                  disabled={!token || communities.length === 0}
                  onChange={(event) => setPostForm((current) => ({ ...current, subredditId: event.target.value }))}
                  required
                  value={postForm.subredditId}
                >
                  <option value="" disabled>
                    Community
                  </option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      r/{community.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="min-h-24 w-full resize-y rounded border border-silver px-3 py-2 text-sm outline-none focus:border-mint"
                disabled={!token}
                onChange={(event) => setPostForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Text"
                value={postForm.description}
              />
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-mint px-3 py-2 text-sm font-bold text-ink hover:bg-green-300 sm:w-auto"
                disabled={!token || busyAction === "post" || communities.length === 0}
                type="submit"
              >
                {busyAction === "post" ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Post
              </button>
            </form>
          </section>

          {notice ? <p className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p> : null}
          {error ? <p className="rounded border border-silver bg-slate-50 px-4 py-3 text-sm text-slate-700">{error}</p> : null}

          {loading ? (
            <div className="flex min-h-60 items-center justify-center rounded border border-slate-200 bg-white text-slate-500">
              <Loader2 className="mr-2 animate-spin" size={20} />
              Loading feed
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-base font-bold text-ink">No posts here yet</p>
              <p className="mt-1 text-sm text-slate-500">Create the first post for this view.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visiblePosts.map((post) => (
                <article className="rounded border border-slate-200 bg-white shadow-soft" key={post.postId}>
                  <div className="grid grid-cols-[52px_minmax(0,1fr)]">
                    <div className="flex flex-col items-center gap-1 border-r border-slate-100 bg-slate-50 py-3">
                      <button
                        className="rounded p-1 text-slate-500 hover:bg-green-100 hover:text-ink"
                        disabled={!token || busyAction === `vote-${post.postId}`}
                        onClick={() => vote(post.postId, "UPVOTE")}
                        title="Upvote"
                        type="button"
                      >
                        <ArrowBigUp size={24} />
                      </button>
                      <span className="text-sm font-black text-ink">{post.voteCount}</span>
                      <button
                        className="rounded p-1 text-slate-500 hover:bg-blue-100 hover:text-blue-700"
                        disabled={!token || busyAction === `vote-${post.postId}`}
                        onClick={() => vote(post.postId, "DOWNVOTE")}
                        title="Downvote"
                        type="button"
                      >
                        <ArrowBigDown size={24} />
                      </button>
                    </div>

                    <div className="min-w-0 p-4">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <button
                          className="font-bold text-ink hover:text-green-700"
                          onClick={() => setSelectedCommunity(post.subredditId)}
                          type="button"
                        >
                          r/{post.subredditName}
                        </button>
                        <span>Posted by {post.author}</span>
                        <span>{formatDate(post.createdDate)}</span>
                      </div>
                      <h2 className="mt-2 break-words text-lg font-bold text-ink">{post.postName}</h2>
                      {post.description ? <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{post.description}</p> : null}
                      {post.url ? (
                        <a
                          className="mt-2 block truncate text-sm font-semibold text-blue-700 hover:underline"
                          href={post.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {post.url}
                        </a>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          className="inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                          onClick={() => loadComments(post.postId)}
                          type="button"
                        >
                          {busyAction === `comments-${post.postId}` ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <MessageCircle size={16} />
                          )}
                          Comments
                        </button>
                      </div>

                      {comments[post.postId] ? (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <form className="flex gap-2" onSubmit={(event) => createComment(event, post.postId)}>
                            <input
                              className="min-w-0 flex-1 rounded border border-silver px-3 py-2 text-sm outline-none focus:border-mint"
                              disabled={!token}
                              onChange={(event) =>
                                setCommentDrafts((current) => ({ ...current, [post.postId]: event.target.value }))
                              }
                              placeholder="Add a comment"
                              required
                              value={commentDrafts[post.postId] ?? ""}
                            />
                            <button
                              className="inline-flex h-10 w-10 items-center justify-center rounded bg-mint text-ink hover:bg-green-300"
                              disabled={!token || busyAction === `comment-${post.postId}`}
                              title="Add comment"
                              type="submit"
                            >
                              {busyAction === `comment-${post.postId}` ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <Send size={16} />
                              )}
                            </button>
                          </form>
                          <div className="mt-3 space-y-3">
                            {comments[post.postId].length === 0 ? (
                              <p className="text-sm text-slate-500">No comments yet.</p>
                            ) : (
                              comments[post.postId].map((comment) => (
                                <div className="border-l-2 border-slate-200 pl-3" key={comment.id}>
                                  <p className="text-xs font-bold text-slate-500">
                                    {comment.author} - {formatDate(comment.createdDate)}
                                  </p>
                                  <p className="mt-1 break-words text-sm text-slate-700">{comment.text}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-sm font-bold text-ink">Account</h2>
            <div className="mt-3 rounded border border-silver bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-ash">Signed in as</p>
              <p className="mt-1 break-words text-base font-black text-ink">{username}</p>
            </div>
            <button
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded bg-mint px-3 py-2 text-sm font-bold text-ink hover:bg-green-300"
              onClick={logout}
              type="button"
            >
              <LogOut size={16} />
              Logout
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}
