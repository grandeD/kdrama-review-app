''' Server for Korean Drama Review Web App '''
from flask import (Flask, render_template, request, flash, session,
                   redirect)

from model import connect_to_db
import crud

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = 'thebestkoreandramareviewsiteever'
app.jinja_env.undefined = StrictUndefined

@app.route('/')
def hompage():
    ''' View Homepage '''
    return render_template('homepage.html')

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
    return render_template('results.html', search_query=search_query)


# Kdrama Page
# Person Page

if __name__ == '__main__':
    # DebugToolbarExtension(app)
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)