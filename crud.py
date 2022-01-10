"""CRUD operations"""
from model import db, User, Kdrama, Review, Playlist, PlaylistEntry, FollowPlaylist, LikeReview, connect_to_db

def create_user(fname, lname, email, password, username, image_path='', fav_genre=''):
    """Create and return a new user"""

    user = User(fname=fname, lname=lname, email=email, password=password, username=username, 
    image_path=image_path, fav_genre=fav_genre)

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

def update_user(user_id, image_path, fav_genre):
    """Create and return a new user"""

    user = get_user_by_id(user_id)
    user.image_path = image_path
    user.fav_genre = fav_genre
    
    db.session.commit()

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

def kdrama_autocomplete(title):
    ''' Return a kdrama based off title '''
    return Kdrama.query.filter(Kdrama.title.ilike(f'%{title}%')).limit(10).all()

def get_reviews(kdrama_id):
    ''' Return a list of reviews based off kdrama_id '''
    kdrama = get_kdrama_by_id(kdrama_id)
    return kdrama.reviews

def get_review(user_id, kdrama_id):
    ''' Return a review based of user_id and kdrama_id '''
    review = Review.query.filter(Review.user_id == user_id, Review.kdrama_id == kdrama_id).first()
    return review

def get_reviews_for_user(user_id):
    ''' Get reviews created by a user '''
    user = get_user_by_id(user_id)
    return user.reviews

def create_review(rating, content, user_id, kdrama_id):
    ''' Creates and returns a new review by a user ''' 

    review = Review(rating=rating, content=content, user_id=user_id, kdrama_id = kdrama_id)

    db.session.add(review)
    db.session.commit()

    return review

def update_review(rating, content, review_id):
    ''' Updates values of review and returns updated review ''' 

    review = Review.query.get(review_id)
    review.update(rating, content)

    db.session.commit()
    return review

def create_playlist(user_id, title, content):
    '''Creates and returns a new playlist by a user '''
    playlist = Playlist(user_id=user_id, title=title, content=content)
    db.session.add(playlist)
    db.session.commit()

    return playlist

def create_playlist_entry(kdrama_id, playlist_id):
    ''' Creates and returns a new playlist entry '''
    playlist_entry = PlaylistEntry(playlist_id=playlist_id, kdrama_id=kdrama_id)
    db.session.add(playlist_entry)
    db.session.commit()

    return playlist_entry

def get_playlist_entry(kdrama_id, playlist_id):
    ''' Returns if there is an entry with kdrama and playlist id'''
    playlist_entry = PlaylistEntry.query.filter(PlaylistEntry.playlist_id==playlist_id, PlaylistEntry.kdrama_id==kdrama_id).first()
    return playlist_entry

def get_user_playlists(user_id):
    '''Returns the playlists of a user '''
    user = get_user_by_id(user_id)
    return user.playlists

def get_user_playlist(playlist_id):
    '''Returns the playlist of a user '''
    playlist = Playlist.query.get(playlist_id)
    return playlist

def delete_playlist_entry(playlist_entry_id):
    ''' Deletes playlist entry '''
    entry = PlaylistEntry.query.get(playlist_entry_id)
    db.session.delete(entry)
    db.session.commit()


def update_playlist(playlist_id, title, content):
    ''' Updates values of playlist and returns updated playlist ''' 

    playlist = Playlist.query.get(playlist_id)
    playlist.title = title
    playlist.content = content

    db.session.commit()
    return playlist


def create_follow_playlist(user_id, playlist_id):
    '''Creates a follow playlist relationship between a user and playist
    and returns the relationship '''

    follow = FollowPlaylist(user_id=user_id, playlist_id=playlist_id)
    db.session.add(follow)
    db.session.commit()

    follow.playlist.add_follower()

    db.session.commit()


    return follow

def get_follow_playlist(user_id, playlist_id):
    '''Gets a follow playlist relationship between a user and playlist
    if it exists '''
    follow = FollowPlaylist.query.filter(   FollowPlaylist.user_id == user_id, 
                            FollowPlaylist.playlist_id == playlist_id).first()
    return follow

def delete_follow_playlist(follow_playlist_id):
    '''Deletes specified follow playlist relationship '''
    follow = FollowPlaylist.query.get(follow_playlist_id)
    follow.playlist.subtract_follower()
    db.session.delete(follow)
    db.session.commit()

def get_followed_playlists(user_id):
    '''Gets all the playlists a user followed '''
    user = get_user_by_id(user_id)
    result = []
    for follow in user.followplaylists:
        result.append(follow.playlist)
    return result

def get_top_followed_playlists():
    ''' Get the top 10 playlists that users follow '''
    pls = Playlist.query.order_by(Playlist.followers.desc()).all()
    if (len(pls) > 10): return pls[:11]
    return pls
   
def create_like_review(user_id, review_id):
    '''Creates a like review relationship between a user and review
    and returns the relationship '''

    like = LikeReview(user_id=user_id, review_id=review_id)
    db.session.add(like)
    db.session.commit()

    like.review.like()
    db.session.commit()

    return like

def get_like_review(user_id, review_id):
    '''Gets a like review relationship between a user and review
    if it exists '''
    like = LikeReview.query.filter(   LikeReview.user_id == user_id, 
                            LikeReview.review_id == review_id).first()
    return like

def delete_like_review(user_id, review_id):
    '''Deletes specified like review relationship '''
    like = get_like_review(user_id, review_id)
    like.review.unlike()
    db.session.delete(like)
    db.session.commit()

def get_like_reviews(user_id):
    '''Gets all the reviews a user like '''
    user = get_user_by_id(user_id)
    result = []
    for like in user.likereviews:
        result.append(like.review)
    return result









if __name__ == '__main__':
    from server import app
    connect_to_db(app)
