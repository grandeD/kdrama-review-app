"""Models for kdrama review app."""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
db = SQLAlchemy()

class User(db.Model):
    """A user."""

    __tablename__ = 'users'

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    fname = db.Column(db.String(30), nullable=False)
    lname = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    username = db.Column(db.String(30), unique=True, nullable=False)
    image_path = db.Column(db.String, nullable=True)
    fav_genre = db.Column(db.Integer, nullable=True)

    reviews = db.relationship('Review', back_populates='user')
    playlists = db.relationship('Playlist', back_populates='user')
    followplaylists = db.relationship('FollowPlaylist', back_populates='user')
    likereviews = db.relationship('LikeReview', back_populates='user')

    def __repr__(self):
        return f'<User user_id={self.user_id} email={self.email} name={self.fname} {self.lname}>'


class Kdrama(db.Model):
    '''A Korean Drama'''

    __tablename__ = 'kdramas'

    kdrama_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    overview = db.Column(db.Text, nullable=True)
    release_date = db.Column(db.DateTime, nullable=True)
    poster_path = db.Column(db.String, nullable=True)
    backdrop_path = db.Column(db.String, nullable=True)

    reviews = db.relationship('Review', back_populates='kdrama')
    playlistentries = db.relationship('PlaylistEntry', back_populates='kdrama')
    
    def __repr__(self):
        return f'<Kdrama kdrama_id={self.kdrama_id} title={self.title}>'

class Review(db.Model):
    """A Kdrama Review """
    __tablename__ = "reviews"

    review_id = db.Column(db.Integer, autoincrement = True, primary_key = True)
    kdrama_id = db.Column(db.Integer, db.ForeignKey('kdramas.kdrama_id'))
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))

    kdrama = db.relationship('Kdrama', back_populates='reviews')
    user = db.relationship('User', back_populates='reviews')
    likereviews = db.relationship('LikeReview', back_populates='review')

    rating = db.Column(db.Integer, nullable=False)
    edited = db.Column(db.Boolean, nullable=False, default=False)
    review_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
    content = db.Column(db.String, nullable=True)

    likes = db.Column(db.Integer, nullable=False, default=0)

    def __repr__(self):
        return f'<Review review_id={self.review_id} rating={self.rating}'

    def update(self, rating, content):
        self.edited = True
        self.rating = rating
        self.content = content
    
    def like(self):
        self.likes += 1
    
    def unlike(self):
        self.likes -= 1

class Playlist(db.Model):
    """A Kdrama Playlist """
    __tablename__ = "playlists"

    playlist_id = db.Column(db.Integer, autoincrement = True, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    title = db.Column(db.String, nullable=False)
    content = db.Column(db.String, nullable=True)
    followers = db.Column(db.Integer, nullable=False, default=0)
    image_path = db.Column(db.String, nullable=True)

    user = db.relationship('User', back_populates='playlists')
    playlistentries = db.relationship('PlaylistEntry', back_populates='playlist')
    followplaylists = db.relationship('FollowPlaylist', back_populates='playlist')

    def __repr__(self):
        return f'<Playlist playlist_id={self.playlist_id} title={self.title}>'

    def add_follower(self):
        self.followers += 1
    
    def subtract_follower(self):
        self.followers -= 1

class PlaylistEntry(db.Model):
    """A Kdrama Playlist Entry"""
    __tablename__ = "playlistentries"

    playlist_entry_id = db.Column(db.Integer, autoincrement = True, primary_key = True)
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlists.playlist_id'))
    kdrama_id = db.Column(db.Integer, db.ForeignKey('kdramas.kdrama_id'))

    kdrama = db.relationship('Kdrama', back_populates='playlistentries')
    playlist = db.relationship('Playlist', back_populates='playlistentries')

    def __repr__(self):
        return f'<PlaylistEntry playlist_entry_id={self.playlist_entry_id}'

class FollowPlaylist(db.Model):
    '''Playlist, User relationship, where user follows another user's playlist'''

    __tablename__ = 'followplaylists'
    follow_playlist_id = db.Column(db.Integer, autoincrement = True, primary_key = True)
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlists.playlist_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    playlist = db.relationship('Playlist', back_populates='followplaylists')
    user = db.relationship('User', back_populates='followplaylists')

class LikeReview(db.Model):
    '''Review, User relationship, where user likes another user's review'''

    __tablename__ = 'likereviews'
    like_review_id = db.Column(db.Integer, autoincrement = True, primary_key = True)
    review_id = db.Column(db.Integer, db.ForeignKey('reviews.review_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    review = db.relationship('Review', back_populates='likereviews')
    user = db.relationship('User', back_populates='likereviews')

def connect_to_db(flask_app, db_uri="postgresql:///kdrama-review-db", echo=True):
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    # flask_app.config["SQLALCHEMY_ECHO"] = echo
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.app = flask_app
    db.init_app(flask_app)

    print("Connected to the db!")


if __name__ == "__main__":
    from server import app

    connect_to_db(app)
