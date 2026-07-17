from app.services.article_workflow import ArticleWorkflow


def test_published_cannot_skip_to_reviewing():
    assert "reviewing" not in ArticleWorkflow.transitions["published"]


def test_ai_never_publishes_directly():
    assert "published" not in ArticleWorkflow.transitions["draft"]
