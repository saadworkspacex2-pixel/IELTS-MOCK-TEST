# DNS Configuration — Cloudflare Nameservers

To point your domain to Cloudflare for DNS management, set the following
nameservers at your domain registrar:

## Nameservers

```
adam.ns.cloudflare.com
simone.ns.cloudflare.com
```

## How to apply

1. **Log in to your domain registrar** (where you bought the domain — e.g. Namecheap, GoDaddy, Hostinger, Onohosting).

2. **Find the DNS / Nameserver settings** for your domain. This is usually under
   *Domain Settings → Nameservers* or *DNS Management → Custom Nameservers*.

3. **Replace the existing nameservers** with the two above:
   - Primary: `adam.ns.cloudflare.com`
   - Secondary: `simone.ns.cloudflare.com`

4. **Save and wait for propagation.** DNS changes can take anywhere from a few
   minutes up to 48 hours, though most resolve within 1–2 hours.

5. **Verify propagation** at [dnschecker.org](https://dnschecker.org) by
   searching for your domain's NS records.

## Recommended DNS records (add in Cloudflare after switching)

Once your domain is on Cloudflare, add these records in the Cloudflare
dashboard under **DNS → Records**:

| Type  | Name    | Content                                 | Proxy    | TTL  |
| ----- | ------- | --------------------------------------- | -------- | ---- |
| A     | `@`     | `76.76.21.21` (Vercel)                  | Proxied  | Auto |
| CNAME | `www`   | `cname.vercel-dns.com`                  | Proxied  | Auto |
| CNAME | `api`   | `cname.vercel-dns.com`                  | Proxied  | Auto |

> Replace the A record IP with whatever your hosting provider (Vercel,
> Netlify, Railway, etc.) gives you in their dashboard.

## Environment variables

Set these so sitemap, robots and canonical URLs use your real domain:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Notes

- Cloudflare's proxy (orange cloud) gives you free SSL, DDoS protection and CDN caching.
- If you only want DNS without the proxy, click the cloud icon to grey (DNS only).
- Email sending (Resend) requires adding your domain in the Resend dashboard
  and creating the SPF/DKIM records Cloudflare shows you.
