---
layout: "../layouts/Search.astro"
title: "Search"
description: "Search jazztips"
pubDate: "2022-11-14"
---

<form action="https://www.google.com/search" method="get">
   <input type="hidden" name="q" value="site:http://jazztips.se">
   <input type="text" name="q" alt="search" autofocus>
   <input type="submit" value="Search">
</form>
