---
layout: default
permalink: /random/
published: true
---

<script>
    function linkToRandomBlogPost() {
        let allPosts = [{%- for post in site.posts -%}
            "{{ post.url | relative_url }}",
        {%- endfor -%}];
        let post = allPosts[Math.floor(Math.random() * allPosts.length)];
        let postLink = post ? `${post}` : `{{ '/' | relative_url }}`;
        return postLink;
    }
    location.replace(linkToRandomBlogPost())
</script>
<noscript>Javascript is required to get a random Post</noscript>