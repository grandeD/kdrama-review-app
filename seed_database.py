"""Seed the database"""
import os
import json
from random import choice, randint
from datetime import datetime
import crud, model, server
import requests

os.system('dropdb kdrama-review-db')
os.system('createdb kdrama-review-db')

model.connect_to_db(server.app)
model.db.create_all()

def add_kdramas(kdrama_list):
    '''Given a list of kdrama dictionary items, extract
    data and store db using crud'''
    for kdrama in kdrama_list:
        title, overview, poster_path, backdrop_path, kdrama_id = (
            kdrama["name"],
            kdrama["overview"],
            kdrama["poster_path"],
            kdrama['backdrop_path'],
            kdrama['id'], 
        )
        release_date = kdrama.get("first_air_date", None)
        if not release_date: release_date = None
        if  release_date:
            release_date = datetime.strptime(release_date, "%Y-%m-%d")
        try:
            crud.create_kdrama(kdrama_id, title, overview, release_date, poster_path, backdrop_path)
        except:
            print(f'problem with INSERT for {kdrama_id}: {title}')


url = 'https://api.themoviedb.org/3/discover/tv'
payload = {'api_key': os.environ['TMDB_API_KEY'],
            'language': 'en-US',
            'sort_by': 'first_air_date.desc',
            'with_original_language': 'ko', # narrows search to only korean dramas
}

'''Get the first page of kdrama results and store total pages'''
res = requests.get(url, params=payload)
data = res.json()
pages = data['total_pages']

'''Stores kdrama data from all pages into database'''
for page in range(1, pages): 
    payload['page'] = page
    res = requests.get(url, params=payload)
    data = res.json()
    results = data.get('results')
    if results: 
        add_kdramas(results)
        print(f'---------- {page} --------------')
    else:
        print(f'---------- Skipped {page} --------------')


''' Creates 10 test users '''

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

for n in range(10):
    fname = f'User{n+1}'
    lname = 'Tester'
    email = f'user{n+1}@test.com' 
    password = 'test'
    username = f'user{n+1}'
    image_path = f'/static/img/avatars/{randint(1,14)}.png'
    fav_genre= choice(list(GENRES))
    new_user = crud.create_user(fname, lname, email, password, username, image_path, fav_genre)
