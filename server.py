''' Server for Korean Drama Review Web App '''
from flask import (Flask, render_template, request, flash, session,
                   redirect)

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = 'thebestkoreandramareviewsiteever'
app.jinja_env.undefined = StrictUndefined

@app.route('/')
def hompage():
    ''' View Homepage '''
    return render_template('homepage.html')

# Login page
# Account Page
# Search Results Page
# Kdrama Page
# Person Page

if __name__ == '__main__':
    # DebugToolbarExtension(app)
    app.run(host="0.0.0.0", debug=True)