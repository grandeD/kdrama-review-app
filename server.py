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

@app.route('/')
def hompage():
    ''' View Homepage '''
    return render_template('homepage.html', api_key=os.environ['TMDB_API_KEY'])

# Login page /login
@app.route('/login')
def show_login():
    '''View Login/Create Account Page'''
    return render_template('login.html')

@app.route('/logout')
def logout():
    '''Clear user session and redirect user to homepage'''
    session.clear()
    return redirect('/')


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
    else:
        response = check_password(check_email, password)
    if username and not check_username:
        response = {'status': 'error', 'message': 'Username does not exist'}
    else:
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
        crud.create_user(fname, lname, email, password, username)

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


# Account Page /profile
@app.route('/profile')
def show_profile():
    '''Shows the profile of the user that is currently in session'''
    '''View Account Page'''
    user = crud.get_user_by_id(session.get('user_id'))
    return render_template('profile.html', user=user)

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
        reviews.append({'username': rev.user.username,
                        'user_id': rev.user.user_id,
                        'rating': rev.rating, 'content': rev.content,
                        'review_date': rev.review_date.strftime('%m/%d/%Y - %H:%M')})
    
    return jsonify({'status': 'success', 'reviews': reviews})


@app.route('/create-review.json', methods=['POST'])
def create_review():
    """Create an review of kdrama for user and return new list of reviews"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonfify({   'status': 'error', 
                            'message': 'Please login to create review'})


    rating = request.get_json().get("rating")
    content = request.get_json().get("content")
    kdrama_id = request.get_json().get("kdrama_id")

    review = crud.create_review(rating, content, user_id, kdrama_id)
    rev_json = {'username': review.user.username,
                        'user_id': review.user.user_id,
                        'rating': review.rating, 'content': review.content,
                        'review_date': review.review_date.strftime('%m/%d/%Y - %H:%M')}

    return jsonify({'status': 'success', 'review': rev_json})


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