+++ 
draft = true
date = {{ .Date }}
title = "{{ replace .Name "-" " " | title }}"
description = ""
{{- $seed := printf "%s%s%s%s" (md5 .Date) (sha256 .Date) (md5 .Date) (sha256 .Date) }}
{{ $data := substr (delimit (shuffle (split $seed "")) "") 0 12 -}}
slug = "{{ .Name }}-{{ $data }}"
authors = ["sn00py1310"]
tags = []
categories = []
externalLink = ""
series = []
+++
