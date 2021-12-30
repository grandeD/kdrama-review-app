''' Server for Korean Drama Review Web App '''
from flask import (Flask, render_template, request, flash, session,
                   redirect, jsonify)

from model import connect_to_db
import crud

from jinja2 import StrictUndefined
import os

from datetime import datetime

app = Flask(__name__)
app.secret_key = 'thebestkoreandramareviewsiteever'
app.jinja_env.undefined = StrictUndefined

GENRES = { "16": "Animation",
    "18": "Drama",
    "35": "Comedy",
    "37": "Western",
    "80": "Crime",
    "99": "Documentary",
    "9648": "Mystery",
    "10751": "Family",
    "10759": "Action & Adventure",
    "10762": "Kids",
    "10763": "News",
    "10764": "Reality",
    "10765": "Sci-Fi & Fantasy",
    "10766": "Soap",
    "10767": "Talk",
    "10768": "War & Politics"
}


@app.route('/')
def hompage():
    ''' View Homepage '''
    return render_template('homepage.html', api_key=os.environ['TMDB_API_KEY'])

# Login page /login
@app.route('/login')
def show_login():
    '''View Login/Create Account Page'''
    return render_template('login.html')

# Signup page /signup
@app.route('/signup')
def show_signup():
    '''View Create Account Page'''
    return render_template('signup.html')

@app.route('/logout')
def logout():
    '''Clear user session and redirect user to homepage'''
    session.clear()
    return redirect('/')

@app.route('/discover')
def show_discover():
    ''' View Discover Page '''
    return render_template('discover.html', api_key=os.environ['TMDB_API_KEY'])   


def check_password(user, password):
    if user.password == password:
        session['user_id'] = user.user_id
        return {'status': 'success', 'message': 'Successfully logged in', 'user_id': user.user_id}
    else:
        return {'status': 'error', 'message': 'Password is incorrect'}

@app.route('/login.json', methods=['POST'])
def login_user():
    '''Log in user'''
    response = {'status': 'success', 'message': 'User logged in'}
    email = request.get_json().get("email")
    username = request.get_json().get("username")
    password = request.get_json().get("password")

    check_email = crud.get_user_by_email(email)
    check_username = crud.get_user_by_username(username)

    if email and not check_email:
        response = {'status': 'error', 'message': 'Email does not exist'}
    elif check_email:
        response = check_password(check_email, password)
    if username and not check_username:
        response = {'status': 'error', 'message': 'Username does not exist'}
    elif check_username:
        response = check_password(check_username, password)

    return jsonify(response)


@app.route('/create-user.json', methods=['POST'])
def create_account():
    """Creates an account"""
    response = {'status': 'success', 'message': 'Account successfully created'}

    fname = request.get_json().get("fname")
    lname = request.get_json().get("lname")
    email = request.get_json().get("email")
    username = request.get_json().get("username")
    password = request.get_json().get("password")

    check_email = crud.get_user_by_email(email)
    check_username = crud.get_user_by_username(username)

    if check_email:
        response = {'status': 'error', 'message': 'Email taken'}
    elif check_username:
        response = {'status': 'error', 'message': 'Username taken'}
    else:
        user = crud.create_user(fname, lname, email, password, username)
        response['user'] = {'user_id': user.user_id, 'username': user.username}

    return jsonify(response)

@app.route('/update-user.json', methods=['POST'])
def update_account():
    """updates a user"""
    response = {'status': 'success', 'message': 'image and favorite genre saved'}

    user_id = request.get_json().get("user_id")
    image_path = request.get_json().get("image_path")
    fav_genre = request.get_json().get("fav_genre")

    user = crud.update_user(user_id, image_path, fav_genre)

    if not user:
        jsonify({'status': 'error', 'message': 'invalid user_id'})

    return jsonify(response)

@app.route('/get-user-id.json')
def get_user_id():
    ''' Gets user_id by email or username '''
    email = request.args.get("email")
    username = request.args.get("username")

    if email:
        user = crud.get_user_by_email(email)
    elif username:
        user = crud.get_user_by_username(username)
    else:
        return jsonify({'status': 'error', 'message': 'Invalid request, must send email or username in body'})

    if user:
        return jsonify({'status': 'success', 'user_id': user.user_id, 'message': 'Found user'})
    else:
        return jsonify({'status': 'error', 'message': 'No user with email/username'})


# gets one specific user
@app.route('/user/<user_id>')
def show_user(user_id):
    '''Returns a json of basic public info of user'''
    user = crud.get_user_by_id(user_id)
    user_js = {'username': user.username, 'user_id': user.user_id, 
                'email': user.email, 'fav_genre': user.fav_genre, 
                'image_path': user.image_path }

    return jsonify ({'status': 'success', 'user': user_js})

# users route
@app.route('/users')
def show_users():
    '''Shows the users of Koreview in list view'''
    users = crud.get_users()
    return render_template('users.html', users=users)




# Public profile page of specified user /profile
@app.route('/profile/<user_id>')
def show_user_profile(user_id):
    '''Shows the public profile of specified user'''
    user = crud.get_user_by_id(user_id)
    # set edit to false so user cannot edit public user profile
    return render_template('profile.html', user=user, edit=False, api_key=os.environ['TMDB_API_KEY'], genres=GENRES)

# Account Page /account
@app.route('/account')
def show_user_account():
    '''Shows the private account profile of specified user'''
    user_id = session.get('user_id')
    user = crud.get_user_by_id(user_id)
    # set edit to true so user can edit their profile
    return render_template('profile.html', user=user, edit=True,  api_key=os.environ['TMDB_API_KEY'], genres=GENRES)


# Search Results Page /search and /results
@app.route('/search')
def show_results():
    '''Take search_input from form and redirect user to respective results page'''
    search_query = request.args.get('search-query')
    kdrama_results = crud.get_kdrama_by_title(search_query)
    return render_template('results.html', search_query=search_query, kdrama_results=kdrama_results)


# Kdrama Page
@app.route('/kdrama/<kdrama_id>')
def show_kdrama(kdrama_id):
    ''' View Page for specified Kdrama '''
    return render_template('kdrama.html', kdrama_id=kdrama_id, api_key=os.environ['TMDB_API_KEY'])

@app.route('/reviews.json/<kdrama_id>')
def get_reviews(kdrama_id):
    ''' Get reviews for Kdrama '''
    reviews = []
    revs = crud.get_reviews(kdrama_id)
    for rev in revs:
        reviews.append({'review_id': rev.review_id,
                        'username': rev.user.username,
                        'user_id': rev.user.user_id,
                        'rating': rev.rating, 'content': rev.content,
                        'review_date': rev.review_date.strftime('%m/%d/%Y - %H:%M')})
    
    return jsonify({'status': 'success', 'reviews': reviews})

@app.route('/user-review.json/<kdrama_id>')
def get_user_review(kdrama_id):
    ''' Get a review for a Kdrama for a specific user'''
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({   'status': 'login', 
                            'message': 'Please login to create review'})

    review = crud.get_review(user_id, kdrama_id)
    if review:
        result = {'review_id': review.review_id,
                'username': review.user.username,
                'user_id': review.user.user_id,
                'rating': review.rating, 'content': review.content,
                'review_date': review.review_date.strftime('%m/%d/%Y - %H:%M')}
        return jsonify({'status': 'success', 'review': result})
    
    return jsonify({'status': 'none', 'message': 'no review for user from this drama'})


@app.route('/create-review.json', methods=['POST'])
def create_review():
    """Create an review of kdrama for user and return that review"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({   'status': 'error', 
                            'message': 'Please login to create review'})


    rating = request.get_json().get("rating")
    content = request.get_json().get("content")
    kdrama_id = request.get_json().get("kdrama_id")

    review = crud.create_review(rating, content, user_id, kdrama_id)
    rev_json = {'review_id': review.review_id, 'username': review.user.username,
                        'user_id': review.user.user_id,
                        'rating': review.rating, 'content': review.content,
                        'review_date': review.review_date.strftime('%m/%d/%Y - %H:%M')
                        }

    return jsonify({'status': 'success', 'review': rev_json})


@app.route('/update-review.json', methods=['POST'])
def update_review():
    """Updates an existing review of kdrama for user and returns updated review"""
    rating = request.get_json().get("rating")
    content = request.get_json().get("content")
    review_id = request.get_json().get("review_id")

    review = crud.update_review(rating, content, review_id)
    rev_json = {'review_id': review.review_id, 'username': review.user.username,
                        'user_id': review.user.user_id,
                        'rating': review.rating, 'content': review.content,
                        'review_date': review.review_date.strftime('%m/%d/%Y - %H:%M')}

    return jsonify({'status': 'success', 'review': rev_json})

@app.route('/create-playlist.json', methods=['POST'])
def create_playlist():
    """Create an new playlist for a user"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({   'status': 'error', 
                            'message': 'Please login to create playlist'})


    title = request.get_json().get("title")
    content = request.get_json().get("content")

    playlist = crud.create_playlist(user_id, title, content)
    pl_json = {'playlist_id': playlist.playlist_id,
                'title': playlist.title,
                'content': playlist.content
                }

    return jsonify({'status': 'success', 'playlist': pl_json})

@app.route('/user_playlists.json')
@app.route('/user_playlists.json/<user_id>')
def get_playlists(user_id=None):
    ''' Get playlists created by user '''
    playlists = []
    if not user_id: user_id = session.get('user_id')

    pls = crud.get_user_playlists(user_id)
    for pl in pls:
        playlists.append({'playlist_id': pl.playlist_id,
                        'title': pl.title,
                        'content': pl.content,
                        'amount': len(pl.playlistentries),
                        'followers': pl.followers})
    
    return jsonify({'status': 'success', 'playlists': playlists})

@app.route('/playlists/top')
def get_top_playlists():
    ''' Get top followed playlists created by all users '''
    playlists = []

    pls = crud.get_top_followed_playlists()
    for pl in pls:
        playlists.append({'playlist_id': pl.playlist_id,
                        'title': pl.title,
                        'content': pl.content,
                        'amount': len(pl.playlistentries),
                        'followers': pl.followers})
    
    return jsonify({'status': 'success', 'playlists': playlists})




@app.route('/add-to-playlist.json', methods=['POST'])
def add_to_playlist():
    """Adds a new playlist entry to a playlist"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({   'status': 'error', 
                            'message': 'Please login to add to playlist'})

    playlist_id = request.get_json().get("playlist_id")
    kdrama_id = request.get_json().get("kdrama_id")
    existing_ple = crud.get_playlist_entry(kdrama_id, playlist_id)
    if existing_ple:
        return jsonify({  'status': 'error', 
                    'message': 'Kdrama already in playlist'})

    playlist_entry = crud.create_playlist_entry(kdrama_id, playlist_id)
    ple_json = {'playlist_entry_id': playlist_entry.playlist_entry_id, 'playlist_id': playlist_entry.playlist_id}

    return jsonify({'status': 'success', 'playlist_entry': ple_json, 'message': 'Added to playlist'})


# Playlist Page
@app.route('/playlist/<playlist_id>')
def show_playlist(playlist_id):
    ''' View Page for specified Playlist '''
    return render_template('playlist.html', playlist_id=playlist_id)


@app.route('/user_playlist.json/<playlist_id>')
def get_playlist(playlist_id):
    ''' Get specified playlist created by user '''
    playlist = crud.get_user_playlist( playlist_id )
    current_user_id = session.get('user_id')

    count = 0
    entries = []
    for entry in playlist.playlistentries:
        count += 1
        entries.append({'playlistentry_id': entry.playlist_entry_id,
                        'kdrama_id': entry.kdrama.kdrama_id, 
                        'title': entry.kdrama.title,
                        'poster_path': entry.kdrama.poster_path })

    info = {'playlist_id': playlist.playlist_id,
            'title': playlist.title, 
            'content': playlist.content, 
            'followers': playlist.followers,
            'amount': count,
            'user_id': playlist.user.user_id,
            'username': playlist.user.username}
    
    # session user matches playlist user, then edit is True
    return jsonify({'status': 'success', 'info': info, 
                    'entries': entries,
                    'edit': current_user_id == playlist.user_id})


@app.route('/delete-entry.json', methods=['POST'])
def delete_playlist_entry():
    """Delete specified playlist entry from playlist"""
    playlist_entry_id = request.get_json().get("playlist_entry_id")
    crud.delete_playlist_entry(playlist_entry_id)
    return jsonify({'status': 'success', 'message': f'deleted playlist entry: {playlist_entry_id}'})


@app.route('/update-playlist.json', methods=['POST'])
def update_playlist():
    """Updates the title and content of an existing playlist"""
    title = request.get_json().get("title")
    content = request.get_json().get("content")
    playlist_id = request.get_json().get("playlist_id")

    playlist = crud.update_playlist(playlist_id, title, content)
    pl_json = { 'playlist_id':  playlist.playlist_id,
                'title':        playlist.title,
                'content':      playlist.content }

    print(playlist, pl_json)

    return jsonify({'status': 'success', 'playlist': pl_json})

@app.route('/follow-playlist.json', methods=['POST'])
def follow_playlist():
    """The current user in session adds a follow to the specified playlist"""
    user_id = session.get('user_id')
    playlist_id = request.get_json().get("playlist_id")
    if not user_id:
        return jsonify({   'status': 'error', 
                            'message': 'Please login to follow playlist'})

    follow = crud.create_follow_playlist(user_id, playlist_id)

    return jsonify({'status': 'success', 'follow': follow.follow_playlist_id})

@app.route('/unfollow-playlist.json', methods=['POST'])
def unfollow_playlist():
    """The current user in session unfollows the specified playlist"""
    follow_playlist_id = request.get_json().get("follow_playlist_id")
    crud.delete_follow_playlist(follow_playlist_id)

    return jsonify({'status': 'success', 'message': 'playlist unfollowed'})

@app.route('/follow/<playlist_id>')
def user_follows(playlist_id):
    '''Returns json True or False if the user follows the specified playlist'''
    user_id = session.get('user_id')
    follow = crud.get_follow_playlist(user_id, playlist_id)
    if follow:
        return jsonify({'follow': True, 'follow_playlist_id': follow.follow_playlist_id})
    return jsonify({'follow': False})


@app.route('/followed_playlists.json/<user_id>')
def get_followed_playlists(user_id):
    ''' Get followed playlists by user '''
    playlists = []

    pls = crud.get_followed_playlists(user_id)
    for pl in pls:
        playlists.append({'playlist_id': pl.playlist_id,
                        'title': pl.title,
                        'content': pl.content,
                        'amount': len(pl.playlistentries),
                        'followers': pl.followers})
    
    return jsonify({'status': 'success', 'playlists': playlists})


def shutdown_server():
    '''Stop current Flask app'''
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

# Shutdown route for debugging
@app.route('/shutdown', methods=['GET'])
def shutdown():
    ''' Shutdown Flask app and display message '''
    shutdown_server()
    return 'Server shutting down...'

if __name__ == '__main__':
    # DebugToolbarExtension(app)
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)