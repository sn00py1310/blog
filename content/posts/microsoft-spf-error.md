+++ 
draft = false
date = 2023-08-18T04:30:00+02:00
title = "Microsoft spoofs emails because of wrong SPF records for Hotmail.com."
description = "Hotmail can't send emails because of a misconfiguration from Microsoft."
slug = "microsoft-spf-error-b9e4d4ebc2db"
authors = ["sn00py1310"]
tags = ["microsoft", "email"]
categories = []
series = []
+++

## The Story
Today I wanted to test [SimpleLogin](https://simplelogin.io) and check what the service can and can't do. So I created an account and tried the email forwarding. So I did send a mail from my Gmail to my Hotmail account over the SimpleLogin forwarding service. SimpleLogin also supports [reverse aliases](https://simplelogin.io/docs/getting-started/reverse-alias/) which allows you to send email to a specific generated mail. They then forward the mail for you to the original email but from their email server, so your email address stays private. When I tested this feature and the email was sent, there were only responses similar to the [Proton Mail Rejection](#protonsimplelogin-email-rejection-message).

### The Timeline in UTC
- 20:58 First Mail from Hotmail to SimpleLogin. Directly the first mail error.
- 20:58-21:56 Trying to find the root of the errors, including researching and sending multiple emails resulting in errors.
- 21:56-22:20 Debugging the SPF records of Microsoft, Hotmail, and Outlook
- 22:28 Sending mail from Hotmail to Gmail to see if the error is not on Protons site.

### The root cause of the error
The root cause is quite simple, Microsoft servers send from IPs that are not authorized to send as hotmail.com.

The Keyword here is SPF records. Here is the short Definition from [Wikipedia](https://en.wikipedia.org/wiki/Sender_Policy_Framework).
> Sender Policy Framework (SPF) is an email authentication method which ensures the sending mail server is authorized to originate mail from the email sender's domain. [...] The list of authorized sending hosts and IP addresses for a domain is published in the DNS records for that domain.

So when you send mail from a @hotmail.com address to a @simplelogin.com address, the server of SimpleLogin will search in the DNS TXT records of hotmail.com for the SPF data. After that, they check if the IP is allowed to send in the name of hotmail.com and according to the response either accept the email or do what's specified in the SPF record. There are options to specify what to do with these emails if the check fails.

The relevant types are:
- SoftFail `~all`, allow the mails but mark them as potential spam
- Fail `-all`, strictly block the mails

### What did trigger this error?
As seen in the [SPF](#spf-records) section further down at some time around 22:00 UTC Microsoft changed the TXT record for hotmail.com and remove the `include:spf.protection.outlook.com` which removed some IPs from which they send the emails.

They also changed the `~all` to `-all` which resulted in strict blocking of the mails from Protons site. Somehow, Gmail doesn't care because the emails still get delivered.

### Solution
Because this is a configuration error from Microsoft, the only possible thing is to inform them about the error.

If you host your own email server, you could try to make an exception for hotmail.com or add the missing SFP include part at the local DNS level.

## Detailed Information
### The IPs
IPs from which I got Mails from Hotmail
- To Proton 40.92.58.60
- To GMail 2a01:111:f400:fe0c:0:0:0:825

Checks the IPs against the SPF records
- Hotmail.com IPv4: https://www.spf-record.de/spf-lookup/hotmail.com?ip=40.92.58.60&opt_out=on
- Outlook.com IPv4: https://www.spf-record.de/spf-lookup/outlook.com?ip=40.92.58.60&opt_out=on
- Hotmail.com IPv6: https://www.spf-record.de/spf-lookup/hotmail.com?ip=2a01:111:f400:fe0c:0:0:0:825&opt_out=on
- Outlook.com IPv6: https://www.spf-record.de/spf-lookup/outlook.com?ip=2a01:111:f400:fe0c:0:0:0:825&opt_out=on

### Google Email Information
|     |     |
| --- | --- |
| Nachrichten-ID | <[REDACTED]@[Redacted].[REDACTED].PROD.OUTLOOK.COM> |
| Erstellt am: | 18. August 2023 um 00:28 MESZ (Nach 1 Sekunde zugestellt) |
| Von: | [REDACTED] <[REDACTED]@hotmail.com> |
| An: | "[REDACTED]@gmail.com" <[REDACTED]@gmail.com> |
| Betreff: | Some Testing email |
| SPF: | FAIL mit IP-Adresse 2a01:111:f400:fe0c:0:0:0:825 [Weitere Informationen](https://support.google.com/a?p=show_original&hl=de) |
| DKIM: | 'PASS' mit Domain hotmail.com [Weitere Informationen](https://support.google.com/a?p=show_original&hl=de) |
| DMARC: | 'PASS' [Weitere Informationen](https://support.google.com/a?p=show_original&hl=de) |

### Proton/SimpleLogin Email Rejection Message
slmailin003.protonmail.ch hat Ihre Nachricht an die folgenden E-Mail-Adressen zurückgewiesen.

[REDACTED]@slmails.com ([REDACTED]@slmails.com)

Ihre Nachricht konnte nicht zugestellt werden, weil das E-Mail-System des Empfängers nicht bestätigen konnte, dass Ihre Nachricht von einem vertrauenswürdigen Ort gesendet wurde.

Für E-Mail-Administratoren
Dieser Fehler steht im Zusammenhang mit dem SPF (Sender Policy Framework). Die Auswertung des SPF-Eintrags für die Nachricht durch das E-Mail-Zielsystem ergab einen Fehler. Arbeiten Sie mit Ihrer Domänenregistrierungsstelle zusammen, um sicherzustellen, dass Ihre SPF-Einträge richtig konfiguriert sind.


slmailin003.protonmail.ch hat diesen Fehler ausgegeben:
<[REDACTED]@slmails.com>: Recipient address rejected: Message rejected due to: SPF fail - not authorized. Please see http://www.openspf.net/Why?s=mfrom;id=[REDACTED]@hotmail.com;ip=40.92.58.60;r=<UNKNOWN>

### SPF Records
All the records have been looked up through [SPF-Record.de](https://www.spf-record.de/spf-lookup) around 22:35 UTC if not noted otherwise.

Hotmail.com from [DNS Spy](https://dnsspy.io/scan/hotmail.com) at 00:41 UTC cached from ~3 hours ago.
As of [SecurityTrails](https://securitytrails.com/domain/hotmail.com/history/txt) the TXT record has been the same from 2022-09-10 (11 months) till 2023-08-18 (today).
```
v=spf1 ip4:157.55.9.128/25 include:spf.protection.outlook.com include:spf-a.outlook.com include:spf-b.outlook.com include:spf-a.hotmail.com include:_spf-ssg-b.microsoft.com include:_spf-ssg-c.microsoft.com ~all
```

Hotmail.com
```
v=spf1 ip4:157.55.9.128/25 include:spf-a.outlook.com include:spf-b.outlook.com include:spf-a.hotmail.com include:_spf-ssg-b.microsoft.com include:_spf-ssg-c.microsoft.com -all
```

Outlook.com
```
v=spf1 include:spf-a.outlook.com include:spf-b.outlook.com ip4:157.55.9.128/25 include:spf.protection.outlook.com include:spf-a.hotmail.com include:_spf-ssg-b.microsoft.com include:_spf-ssg-c.microsoft.com ~all
```

Live.com
```
v=spf1 include:spf-a.hotmail.com include:spf-b.hotmail.com include:spf-c.hotmail.com include:spf-d.hotmail.com include:spf.protection.outlook.com ~all
```

Microsoft.com
```
No SPF record was found.
```

#### Included SPF Records
include:spf-a.hotmail.com
```
v=spf1 ip4:157.55.0.192/26 ip4:157.55.1.128/26 ip4:157.55.2.0/25 ip4:65.54.190.0/24 ip4:65.54.51.64/26 ip4:65.54.61.64/26 ip4:65.55.111.0/24 ip4:65.55.116.0/25 ip4:65.55.34.0/24 ip4:65.55.90.0/24 ip4:65.54.241.0/24 ip4:207.46.117.0/24 ~all 
```

include:spf-b.hotmail.com
```
v=spf1 ip4:52.103.0.0/17 ip4:40.92.0.0/16 ip6:2a01:111:f403:2800::/53 ip6:2a01:111:f403:d000::/53 -all 
```

include:spf-c.hotmail.com 
```
v=spf1 ~all 
```

include:spf-d.hotmail.com
```
v=spf1 ~all
```

include:spf-a.outlook.com
```
v=spf1 ip4:157.56.232.0/21 ip4:157.56.240.0/20 ip4:207.46.198.0/25 ip4:207.46.4.128/25 ip4:157.56.24.0/25 ip4:157.55.157.128/25 ip4:157.55.61.0/24 ip4:157.55.49.0/25 ip4:65.55.174.0/25 ip4:65.55.126.0/25 ip4:65.55.113.64/26 ip4:65.55.94.0/25 -all 
```

include:spf-b.outlook.com 
```
v=spf1 ip4:65.55.78.128/25 ip4:111.221.112.0/21 ip4:207.46.58.128/25 ip4:111.221.69.128/25 ip4:111.221.66.0/25 ip4:111.221.23.128/25 ip4:70.37.151.128/25 ip4:157.56.248.0/21 ip4:213.199.177.0/26 ip4:157.55.225.0/25 ip4:157.55.11.0/25 -all 
```

include:spf.protection.outlook.com
```
v=spf1 ip4:40.92.0.0/15 ip4:40.107.0.0/16 ip4:52.100.0.0/14 ip4:104.47.0.0/17 ip6:2a01:111:f400::/48 ip6:2a01:111:f403::/49 ip6:2a01:111:f403:8000::/50 ip6:2a01:111:f403:c000::/51 ip6:2a01:111:f403:f000::/52 -all 
```

include:_spf-ssg-b.microsoft.com
```
v=spf1 ip4:207.68.169.173/30 ip4:207.68.176.0/26 ip4:207.46.132.128/27 ip4:207.68.176.96/27 ip4:65.55.238.129/26 ip4:65.55.238.129/26 ip4:207.46.116.128/29 ip4:65.55.178.128/27 ip4:213.199.161.128/27 ip4:65.55.33.64/28 ~all 
```

include:_spf-ssg-c.microsoft.com
```
v=spf1 ip4:65.54.121.120/29 ip4:65.55.81.48/28 ip4:65.55.234.192/26 ip4:207.46.200.0/27 ip4:65.55.52.224/27 ip4:94.245.112.10/31 ip4:94.245.112.0/27 ip4:111.221.26.0/27 ip4:207.46.50.192/26 ip4:207.46.50.224 ~all 
```
