from models.user import User


def create_user(db, email: str, full_name: str, digest: str) -> User:
    user = User(
        email=email,
        full_name=full_name,
        password_hash=digest
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def check_user_exists(db, email: str) -> bool:
    return db.query(User).filter(User.email == email).first()
