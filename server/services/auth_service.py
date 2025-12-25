from models.user import User


def create_user(db, email: str, password_hash: str) -> User:
    user = User(
        email=email,
        password_hash=password_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def check_user_exists(db, email: str) -> bool:
    return db.query(User).filter(User.email == email).first()
