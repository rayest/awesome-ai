import ipaddress
import socket
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup


class SafeWebFetcher:
    def validate_url(self, url: str) -> None:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            raise ValueError("只允许 http/https 来源")
        for address in socket.getaddrinfo(parsed.hostname, parsed.port or 443):
            ip = ipaddress.ip_address(address[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                raise ValueError("禁止采集内网地址")

    def fetch(self, url: str) -> dict[str, str]:
        self.validate_url(url)
        with httpx.Client(follow_redirects=True, timeout=15, max_redirects=3) as client:
            response = client.get(url, headers={"User-Agent": "KnowledgeHubBot/1.0"})
            response.raise_for_status()
            if len(response.content) > 5 * 1024 * 1024:
                raise ValueError("来源页面超过 5MB 限制")
        soup = BeautifulSoup(response.text, "html.parser")
        for node in soup(["script", "style", "noscript"]):
            node.decompose()
        title = soup.title.get_text(strip=True) if soup.title else url
        content = "\n".join(line.strip() for line in soup.get_text("\n").splitlines() if line.strip())
        return {"title": title[:300], "content": content[:100000]}
