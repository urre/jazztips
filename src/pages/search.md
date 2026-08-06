---
layout: "../layouts/Search.astro"
title: "Sök"
description: "Sök på Jazztips"
pubDate: "2022-11-14"
---

<form action="https://www.google.com/search" method="get">
   <input type="hidden" name="q" value="site:http://jazztips.se">
   <input type="text" name="q" alt="sök" autofocus>
   <input type="submit" value="Sök">
</form>
