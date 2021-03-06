from flask import (Flask, render_template, request, flash, session,
                   redirect, jsonify, Blueprint)
import crud
import os
from datetime import datetime

user_api = Blueprint('user_api', __name__)

# /create-user.json
@user_api.route('/user', methods=['POST'])
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

# /update-user.json
@user_api.route('/user/<user_id>', methods=['PUT'])
def update_account(user_id):
    """updates a user"""
    response = {'status': 'success', 'message': 'image and favorite genre saved'}

    # user_id = request.get_json().get("user_id")
    image_path = request.get_json().get("image_path")
    fav_genre = request.get_json().get("fav_genre")

    user = crud.update_user(user_id, image_path, fav_genre)

    if not user:
        jsonify({'status': 'error', 'message': 'invalid user_id'})
    else:
        flash('Account successfully created.', 'success')

    return jsonify(response)

# /get-user-id.json
@user_api.route('/user', methods=['GET'])
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

# gets one specific user
@user_api.route('/user/<user_id>', methods=['GET'])
def show_user(user_id):
    '''Returns a json of basic public info of user'''
    user = crud.get_user_by_id(user_id)
    
    user_js = {'username': user.username, 'user_id': user.user_id, 
                'email': user.email, 'fav_genre_id': user.fav_genre, 
                'fav_genre': GENRES.get(str(user.fav_genre)), 
                'image_path': user.image_path }

    return jsonify ({'status': 'success', 'user': user_js})

# users route
@user_api.route('/users')
def show_users():
    '''Shows the users of Koreview in list view'''
    users = crud.get_users()
    current_user = crud.get_user_by_id(session.get('user_id'))
    all_users = []
    similar_users = []
    for u in users:
        if u.user_id != current_user.user_id:
            user = {'user_id': u.user_id, 'username': u.username, 
                    'fname': u.fname, 'lname': u.lname,
                    'image_path': u.image_path, 'fav_genre': GENRES.get(str(u.fav_genre))}
            if current_user.fav_genre == u.fav_genre:
                similar_users.append(user)
            all_users.append(user)
    return render_template('users.html', similar_users=similar_users, all_users=all_users)



# Public profile page of specified user /profile
@user_api.route('/profile/<user_id>')
def show_user_profile(user_id):
    '''Shows the public profile of specified user'''
    user = crud.get_user_by_id(user_id)
    # set edit to false so user cannot edit public user profile
    fav_genre=GENRES.get(str(user.fav_genre))
    return render_template('profile.html', user=user, edit=False, api_key=os.environ['TMDB_API_KEY'], fav_genre=fav_genre)

# Account Page /account
@user_api.route('/account')
def show_user_account():
    '''Shows the private account profile of specified user'''
    user_id = session.get('user_id')
    user = crud.get_user_by_id(user_id)
    fav_genre=GENRES.get(str(user.fav_genre))
    # set edit to true so user can edit their profile
    return render_template('profile.html', user=user, edit=True,  api_key=os.environ['TMDB_API_KEY'], fav_genre=fav_genre)

