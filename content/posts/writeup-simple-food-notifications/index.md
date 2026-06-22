+++ 
draft = false
date = 2026-06-21T20:00:00+02:00
title = "Writeup Simple Food Notifications"
description = "A writeup for the Simple Food Notifications challenge of the GPNCTF24"
slug = "writeup-simple-food-notifications-ef21cc083e00"
authors = ["sn00py1310"]
tags = ["ctf", "writeup", "gpnctf"]
categories = []
series = []
+++


Notes: This is a writeup from the author of the challenge. The handout is [simple-food-notifications.tar.gz](./simple-food-notifications.tar.gz).
## Short challenge description
Users can simulate ordering food on the website and receive a notification on a provided callback URL. The goal of the challenge is to request `/vip-meal` from the IP `127.0.0.1`.

## Challenge description
The challenge simulates a website where users can order food and receive notifications once it's ready.
The ordering logic has a simple rate limiting mechanism and starts a new thread for each order.

```python {linenos=inline linenostart=66 hl_lines=["5-8", 22]}
@app.route('/order', methods=["POST"])
def meal_notification_create():
    global last_requests

    wait_time = rate_limit - (time.time() - last_requests)
    if wait_time > 0:
        return render_template('order.html', message=f"Sorry, but our staff is limited by their walking speed. We'll invest into faster staff but currently you have to wait at least {wait_time:.0f} seconds."), 429
    last_requests = time.time()


    id = randomId()
    url = request.form.get("url", default="", type=str)
    app.logger.info(f"Received notification request for {url} with id {id}")

    if (not url):
        return render_template('order.html', message="Sorry our staff would never find your non-existing url, this is rude."), 400
    
    notifications[id] = {
        "message": "We received your order and will notify you at your url as soon as it's ready.",
        "status": "RECEIVED"
    }
    t = threading.Thread(target=create_meal, args=(id,url,), daemon=True)
    t.start()

    return render_template('order.html', message=f'We received your order, it is going to be ready soon. Once the order is ready we will notify you at your notification url. <br>We even provide a notification status api, yours is <a href="/notification/{id}">{id}</a>.')
```


Below is the notification logic.
A simple `time.sleep` simulates the cooking time.
After this, the IP of the provided hostname is resolved and checked to ensure it is a global IP address.
If the IP is global, then a request is made to the provided URL and the response is stored in the notification.

```python {linenos=inline linenostart=94 hl_lines=[10, 13, "22-24", "32-33"]}
def create_meal(id, url, *args, **kwargs):
    global notifications
    if (len(notifications.keys()) > 100):
        notifications = dict()

    notifications[id] = {
        "message": f"We are working professionally on your meal and will notify you at {url} as soon as it's ready, please wait patiently.",
        "status": "COOKING"
    }
    time.sleep(randomBetween(5, 15)) # Let him cook

    try:
        addresses = socket.getaddrinfo(urllib3.util.parse_url(url).host, 80)
    except Exception as e:
        app.logger.error(f"Could not resolve hostname {urllib3.util.parse_url(url).host}, {e}")
        notifications[id] = {
            "message": f"Our server slipped on a banana peel while trying to notify you. We are sorry and are invested to clean better in the future.",
            "status": "FAILED"
        }
        return

    for addr in addresses:
        app.logger.info(f"Resolved {addr[4][0]}")
        if (not ipaddress.ip_address(addr[4][0]).is_global):
            notifications[id] = {
                "message": "Only staff is allowed to see mess in the kitchen, we don't want you to see the rats.",
                "status": "REJECTED"
            }
            return

    try:
        r = urllib3.request('GET', url, redirect=False, timeout=urllib3.Timeout(30))
        notifications[id] = {"message": r.data.decode('utf-8', errors='replace'), "status": "DONE"}
    except Exception as e:
        app.logger.error(f"Could not notify {url}, {e}")
        notifications[id] = {
            "message": f"Wait what, this is a new banana peel, we are sorry but we can't notify you at the moment. We will invest in better shoes for our staff to prevent this in the future.",
            "status": "FAILED"
        }
```

The flag is returned from the `/vip-meal` endpoint. To get the flag the request must originate from the IP `127.0.0.1`.

```python {linenos=inline linenostart=57 hl_lines=[3]}
@app.route('/vip-meal')
def vip_meal():
    if request.remote_addr != "127.0.0.1":
        app.logger.warning(f"Your IP {request.remote_addr} is not whitelisted so see vip meals")
        return render_template('meal.html', message="You are not dressed appropriate to see even vip meals."), 401

    return render_template('meal.html', title="VIP Meal", message=f"Our chef cooked the beast meal for our vip customers, here is the flag {FLAG} with some caviar on top."), 200

```

## Exploiting
### DNS rebinding
At first glance it looks like a simple DNS rebinding attack is enough to solve this challenge.
But the author has thought about this and added a `dnsmasq` configuration to prevent this attack.

```bash {linenos=inline linenostart=1 hl_lines=[2]}
# /etc/dnsmasq.conf
min-cache-ttl=2
server=8.8.8.8
listen-address=127.0.0.1
no-resolv
```
This `min-cache-ttl=2` configuration keeps all DNS responses for a minimum of 2 seconds in the cache.
This means that any DNS rebinding attack would require at least a 2 second delay between the two resolve attempts.

```python {linenos=inline linenostart=94 hl_lines=[2, 21]}
    try:
        addresses = socket.getaddrinfo(urllib3.util.parse_url(url).host, 80)
    except Exception as e:
        app.logger.error(f"Could not resolve hostname {urllib3.util.parse_url(url).host}, {e}")
        notifications[id] = {
            "message": f"Our server slipped on a banana peel while trying to notify you. We are sorry and are invested to clean better in the future.",
            "status": "FAILED"
        }
        return

    for addr in addresses:
        app.logger.info(f"Resolved {addr[4][0]}")
        if (not ipaddress.ip_address(addr[4][0]).is_global):
            notifications[id] = {
                "message": "Only staff is allowed to see mess in the kitchen, we don't want you to see the rats.",
                "status": "REJECTED"
            }
            return

    try:
        r = urllib3.request('GET', url, redirect=False, timeout=urllib3.Timeout(30))
        notifications[id] = {"message": r.data.decode('utf-8', errors='replace'), "status": "DONE"}
    except Exception as e:
```

But between these two calls there is no attacker-controlled delay, because the code only performs some reasonably fast static checks. So the TTL is not able to expire.

Unless the attacker controls the DNS server which is used.
This is possible because the attacker can specify on which domain the notification should be sent.
Because Google's public DNS server is used, the attacker can specify any domain which has an `NS` record pointing to a name server controlled by the attacker[^1].
If the attacker specifies the domain `something-random.sub.domain.example` then the `NS` record of `sub.domain.example` is used to find the authoritative name server for `something-random.sub.domain.example`.

And because the attacker can control the authoritative name server, the attacker-controlled authoritative name server can switch the IPs between the requests. But how does the attacker force two DNS requests with the `min-cache-ttl=2`?
The solution is to drop AAAA/IPv6 responses on the attacker's name server. Because the A and AAAA requests are made in parallel, the first response will be the A response which can return a public IPv4 address. While the stub resolver on the challenge server waits for both responses (AAAA may be preferred to A), the TTL of the A record can expire and a second A lookup can then return the `127.0.0.1` IP.

Such an attacker's DNS server is implemented in https://github.com/sn00py1310/dns-delay-server.

### Request retries
In the (seemingly AI-assisted) writeup from th3b0ywh0l1v3d I discovered a new solution to the challenge[^2].
Because `urllib3.request` has a `retry` mechanism[^3] with a default value of 3 retries, if the request to the resolved IP address fails to connect, the request is retried. The DNS resolution is performed again because the TTL expired and now it is a simple DNS rebind attack. This means that if the attacker can cause a connection failure on the first request, then the subsequent retry can be used to get the flag.

[^1]: https://en.wikipedia.org/wiki/Domain_Name_System#DNS_resolvers
[^2]: https://th3b0ywh0l1v3d.github.io/ctf/gpn-ctf-2026/web/simple-food-notifications/
[^3]: https://urllib3.readthedocs.io/en/stable/reference/urllib3.request.html
