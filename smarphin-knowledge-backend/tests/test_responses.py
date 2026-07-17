from app.core.responses import page, success


def test_success_envelope():
    assert success({"id": 1}) == {"code": 0, "message": "success", "response": {"id": 1}}


def test_page_envelope():
    result = page([{"id": 1}], 1, 1, 20)
    assert result["response"]["total"] == 1
    assert result["response"]["page_size"] == 20
