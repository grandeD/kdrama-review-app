''' Server for Korean Drama Review Web App '''
from flask import (Flask, render_template, request, flash, session,
                   redirect, jsonify)

from model import connect_to_db
import crud

from jinja2 import StrictUndefined
import os

from datetime import datetime
from userAPI import user_api
from reviewAPI import review_api
from playlistAPI import playlist_api


app = Flask(__name__)
app.secret_key = 'thebestkoreandramareviewsiteever'
app.jinja_env.undefined = StrictUndefined

app.register_blueprint(user_api)
app.register_blueprint(review_api)
app.register_blueprint(playlist_api)

@app.route('/')
def homepage():
    ''' View Homepage '''
    # flash('hello')
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
    print(session)
    return redirect('/')

@app.route('/discover')
def show_discover():
    ''' View Discover Page '''
    return render_template('discover.html', api_key=os.environ['TMDB_API_KEY'])   

def check_password(user, password):
    if user.password == password:
        session['user_id'] = user.user_id
        session['user_image_path'] = user.image_path
        session['name'] = f'{user.fname} {user.lname}'
        session['username'] = user.username

        return {'status': 'success', 'message': 'Successfully logged in', 'user_id': user.user_id}
    else:
        return {'status': 'error', 'message': 'Password is incorrect'}

@app.route('/login', methods=['POST'])
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

# Search Results Page /search and /results
@app.route('/search')
def show_results():
    '''Take search_input from form and redirect user to respective results page'''
    search_query = request.args.get('search-query')
    kdrama_results = crud.get_kdrama_by_title(search_query)
    return render_template('results.html', search_query=search_query, kdrama_results=kdrama_results)

@app.route('/search/autocomplete')
def autocomplete_results():
    '''Take search_input and returns at most, 10 autocomplete suggestions'''
    search_query = request.args.get('search-query')
    kdrama_results = crud.kdrama_autocomplete(search_query)
    kdrama_json = []
    for kdrama in kdrama_results:
        kdrama_json.append(kdrama.title)
    return jsonify({'status':'success', 'results':kdrama_json})

# Kdrama Page
@app.route('/kdrama/<kdrama_id>')
def show_kdrama(kdrama_id):
    ''' View Page for specified Kdrama '''
    return render_template('kdrama.html', kdrama_id=kdrama_id, api_key=os.environ['TMDB_API_KEY'])

# Actor/Crew Page
@app.route('/person/<person_id>')
def show_person(person_id):
    ''' View Page for specified Person - (cast or crew of kdrama) '''
    return render_template('person.html', person_id=person_id, api_key=os.environ['TMDB_API_KEY'])

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