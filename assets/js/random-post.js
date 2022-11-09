---
---
function getAllPosts(){
    return allPosts = [{%- for post in site.posts -%}
        "{{ post.url | relative_url }}",
    {%- endfor -%}];
}

function linkToRandomBlogPost() {
    let allPosts = getAllPosts();
    let post = allPosts[Math.floor(Math.random() * allPosts.length)];
    let postLink = post ? `${post}` : `{{ '/' | relative_url }}`;
    return postLink;
}