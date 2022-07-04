---
layout: default
permalink: /random
published: false
---

<script>
    function linkToRandomBlogPost() {
        let allPosts = [{% for post in site.posts %}
            "{{ post.url }}"{% unless post.previous == nil %},{% endunless %}
        {% endfor %}];
        let post = allPosts[Math.floor(Math.random() * allPosts.length)];
        let postLink = post ? `{{ site.baseurl }}${post}` : `{{ site.baseurl }}`;
        return postLink;
    }
    location.replace(linkToRandomBlogPost())
</script>