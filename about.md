---
layout: page
title: About
permalink: /about/
configs:
    rotating_pb: true
---
<!-- Begin custom profile picture -->
<style>
.profile-picture {
    --size: 15em;
    --border-size: 0.75em;

    overflow: hidden;
    position: relative;

    width: var(--size);
    height: var(--size);
    border-radius: 50%;

    margin: 0 auto 1em auto;
}
.profile-picture img {
    position: absolute;
    top: calc(var(--border-size) / 2);
    left: calc(var(--border-size) / 2);

    width: calc(var(--size) - var(--border-size));
    height: calc(var(--size) - var(--border-size));
    border-radius: 50%;
}
{%- if page.configs.rotating_pb -%}
.profile-picture::after {
    content: '';
    display: block;
    z-index: -1;
    position: absolute;
    bottom: 0%;
    right: 0%;

    width: var(--size);
    height: var(--size);

    background-image: conic-gradient(rgba(255,1,1,1), rgba(255,0,215,1), rgba(0,3,255,1), rgba(255,1,1,1));
    animation: rotate-profile-picture linear 3s infinite;
}
@keyframes rotate-profile-picture {
  to { transform: rotate(360deg) }
}
@media (prefers-reduced-motion) {
    .profile-picture::after {
        animation: none;
    }
}
{%- endif -%}
</style>
{% assign gh_social = site.minima.social_links | where: 'platform', 'github' | first | %}
<div class="profile-picture" title="This animation took me 4 hours">
    <a href="{{gh_social.user_url}}" target="_blank">
        <img src="{{gh_social.user_url}}.png" alt="Profile picture of me" title="Profile picture of me">
    </a>
</div>
<!-- End custom profile picture -->
Hello I'm known as sn00py1310, but most people call me just Snoopy.  
With 12 I started to code on Arduinos. Now I'm about {{ 'now' | date: "%Y" | minus: 2004 }} and I often do small projects.  

Some of them are ...
- Websites in PHP and Python
- Discord bots with Python
- Bug hunting
- Webscraper
- ...

I worked with different programming languages and had different skill levels.  
- Python
- Arduino C
- PHP
- HTML & CSS
- JavaScript
- Basic
- C#

# Blog
I hope you find this interesting. It's going to be about IT security, personal projects and some private stories.  