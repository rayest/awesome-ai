import getpass

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.entities import AdminAccount


def main():
    email = input("管理员邮箱: ").strip().lower()
    display_name = input("显示名称: ").strip() or "内容管理员"
    password = getpass.getpass("密码: ")
    with SessionLocal() as session:
        if session.scalar(select(AdminAccount).where(AdminAccount.email == email)):
            raise SystemExit("管理员已存在")
        session.add(AdminAccount(email=email, display_name=display_name, password_hash=hash_password(password)))
        session.commit()
        print("管理员创建完成")


if __name__ == "__main__":
    main()
