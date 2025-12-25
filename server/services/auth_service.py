from models.user import User

def create_user(db, email, password_hash):
    user = User(
        email=email,
        password_hash=password_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db, email):
    return db.query(User).filter(User.email == email).first()
