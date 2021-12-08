''' Server for Korean Drama Review Web App '''
from flask import (Flask, render_template, request, flash, session,
                   redirect)

from model import connect_to_db
import crud

from jinja2 import StrictUndefined
import os

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

# Account Page /profile
@app.route('/profile')
def show_profile():
    '''View Account Page'''
    return render_template('profile.html')

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