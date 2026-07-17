import re
from datetime import datetime
from pathlib import Path

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.entities import Article, Category

DOCS_DIR = Path(__file__).resolve().parent.parent / "smarphin-knowledge-web" / "docs"
CATEGORY_NAMES = {
    "claude-code-harness": "Claude Code Harness",
    "harness-engine": "Harness Engine",
    "newsletter": "AI 信息流",
    "source-to-text": "Source to Text",
}


def title_of(markdown: str, fallback: str) -> str:
    match = re.search(r"^#\s+(.+)$", markdown, flags=re.MULTILINE)
    return match.group(1).strip() if match else fallback


def summary_of(markdown: str) -> str:
    for line in markdown.splitlines():
        value = line.strip()
        if value and not value.startswith(("#", "![", ">", "|")):
            return re.sub(r"[*_`\[\]]", "", value)[:500]
    return "围绕 AI、Agent 与工程实践整理的编辑内容。"


def main() -> None:
    if not DOCS_DIR.exists():
        raise SystemExit(f"未找到内容目录：{DOCS_DIR}")
    created = 0
    with SessionLocal() as session:
        for category_dir in sorted(path for path in DOCS_DIR.iterdir() if path.is_dir()):
            category = session.scalar(select(Category).where(Category.slug == category_dir.name))
            if not category:
                category = Category(slug=category_dir.name, name=CATEGORY_NAMES.get(category_dir.name, category_dir.name))
                session.add(category)
                session.flush()
            for source in sorted(category_dir.glob("*.md")):
                slug = f"{category_dir.name}--{source.stem}"
                if session.scalar(select(Article.id).where(Article.slug == slug)):
                    continue
                markdown = source.read_text(encoding="utf-8")
                date_match = re.match(r"(\d{4}-\d{2}-\d{2})", source.stem)
                published_at = datetime.fromisoformat(date_match.group(1)) if date_match else datetime.utcnow()
                article = Article(
                    slug=slug,
                    title=title_of(markdown, source.stem),
                    summary=summary_of(markdown),
                    content_markdown=markdown,
                    content_text=re.sub(r"[#*_>`\[\]()]", " ", markdown),
                    category_id=category.id,
                    status="published",
                    published_at=published_at,
                    source_name="历史知识库迁移",
                    source_verified=True,
                )
                session.add(article)
                created += 1
        session.commit()
    print(f"Markdown 迁移完成，新增 {created} 篇")


if __name__ == "__main__":
    main()
