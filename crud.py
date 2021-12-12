"""CRUD operations"""
from model import db, User, Kdrama, Review, connect_to_db

def create_user(fname, lname, email, password, username):
    """Create and return a new user"""

    user = User(fname=fname, lname=lname, email=email, password=password, username=username)

    db.session.add(user)
    db.session.commit()

    return user

def get_users():
    '''Return a list of all users'''

    return User.query.all()

def get_user_by_id(user_id):
    '''Return a specific user'''

    return User.query.get(user_id)

def get_user_by_email(email):
    '''Return a user by email'''

    user = User.query.filter(User.email == email).first()
    return user

def get_user_by_username(username):
    '''Return a user by username'''

    user = User.query.filter(User.username == username).first()
    return user

def create_kdrama(kdrama_id, title, overview, release_date, poster_path):
    """Create and return a new kdrama."""

    kdrama = Kdrama(kdrama_id = kdrama_id, title=title, overview=overview, release_date=release_date, poster_path=poster_path)

    db.session.add(kdrama)
    db.session.commit()

    return kdrama

def get_kdramas():
    '''Return a list of all kdramas'''
    return Kdrama.query.order_by(Kdrama.title).all()

def get_kdrama_by_id(kdrama_id):
    ''' Return a kdrama based off id '''
    return Kdrama.query.get(kdrama_id)

def get_kdrama_by_title(title):
    ''' Return a kdrama based off title '''
    return Kdrama.query.filter(Kdrama.title.ilike(f'%{title}%')).all()

def get_reviews(kdrama_id):
    ''' Return a list of reviews based off kdrama_id '''
    kdrama = get_kdrama_by_id(kdrama_id)
    return kdrama.reviews

def create_review(rating, content, user_id, kdrama_id):
    ''' Creates and returns a new rating by a user ''' 

    review = Review(rating=rating, content=content, user_id=user_id, kdrama_id = kdrama_id)

    db.session.add(review)
    db.session.commit()

    return review


if __name__ == '__main__':
    from server import app
    connect_to_db(app)
