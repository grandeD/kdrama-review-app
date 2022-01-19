# Koreview

<div align="center"> 
  <img src="https://drive.google.com/uc?export=view&id=1Fg9iakvxQk1p85ZLYx4Pi63YK1dB0XtC" alt="Koreview" width="500px"/>
</div>

[koreview.diana-grande.com](http://koreview.diana-grande.com)

## Table of Contents

* [Background](#background)
  * Tech Stack
  * Description

* [Development](#development)


## Background

**Tech Stack**
`Python3` `Flask`  `React JS` `Jinja` `Postgres SQL`  `CSS`  `HTML5` `Javascript` `AWS`

**Description**

Koreview is a review web application that allows users to search, discover and interact with Korean dramas (kdramas). Users can post reviews on specific kdrama pages and create custom playlists of kdramas they want to save. User interaction is facilitated by viewing user profiles, liking reviews and following playlists. This data is persisted in a PSQL database and accessed using SQLAlchemy (ORM) and a Flask server for REST API routes.

The kdrama information displayed on the app is queried from The Movie Database API. Through a search bar at the top of the app users can see autocomplete results under the bar as they type their query. The discover page allows users to add genre filters and sort options to view the kdramas. React JS components were used for these features to allow users to interact with the pages and see feedback.



## Development

### Local Dependencies

* `python3`
* `pip3`
* `virtualenv`
* `psql`

### Setup

* Clone repo to your local machine:
```sh
git clone https://github.com/grandeD/kdrama-review-app.git
cd kdrama-review-app
```
* Create and activate virtual environment
```sh
virtualenv env
source env/bin/activate
```
* Intall required libraries for app
```sh
pip3 install -r requirements.txt
```
* Store you API key as an environment variable:
>Get an api key from [The Movie Database API](https://developers.themoviedb.org/3/getting-started/introduction)
```sh
export TMDB_API_KEY="Put your API key here";
```

* Seed database and start the server
```sh
python3 seed_database.py
python3 server.py
```
