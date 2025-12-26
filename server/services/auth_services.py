from models.user import User


def create_user(db, email: str, full_name: str, digest: str) -> User:
    user = User(email=email, full_name=full_name, password_hash=digest)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_userid(db, user_id: int):
    return db.query(User).filter(User.id == user_id).first()
