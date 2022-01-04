from flask import (Flask, render_template, request, flash, session,
                   redirect, jsonify, Blueprint)
import crud
import os
from datetime import datetime

playlist_api = Blueprint('playlist_api', __name__)


## PLAYLIST
# Playlist Page
@playlist_api.route('/playlist/<playlist_id>')
def show_playlist(playlist_id):
    ''' View Page for specified Playlist '''
    return render_template('playlist.html', playlist_id=playlist_id)

# /user_playlist.json/<playlist_id>
@playlist_api.route('/playlist')
def get_playlist():
    ''' Get specified playlist and specify if playlist is made by session user'''
    playlist_id = request.args.get("playlist_id")
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

# /create-playlist.json
@playlist_api.route('/playlist', methods=['POST'])
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

# /update-playlist.json
@playlist_api.route('/playlist/<playlist_id>', methods=['PUT'])
def update_playlist(playlist_id):
    """Updates the title and content of an existing playlist"""
    title = request.get_json().get("title")
    content = request.get_json().get("content")
    # playlist_id = request.get_json().get("playlist_id")

    playlist = crud.update_playlist(playlist_id, title, content)
    pl_json = { 'playlist_id':  playlist.playlist_id,
                'title':        playlist.title,
                'content':      playlist.content }

    print(playlist, pl_json)

    return jsonify({'status': 'success', 'playlist': pl_json})


# /add-to-playlist.json
@playlist_api.route('/playlist/<playlist_id>/entry', methods=['POST'])
def add_to_playlist(playlist_id):
    """Adds a new playlist entry to a playlist"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({   'status': 'error', 
                            'message': 'Please login to add to playlist'})

    # playlist_id = request.get_json().get("playlist_id")
    kdrama_id = request.get_json().get("kdrama_id")
    existing_ple = crud.get_playlist_entry(kdrama_id, playlist_id)
    if existing_ple:
        return jsonify({  'status': 'error', 
                    'message': 'Kdrama already in playlist'})

    playlist_entry = crud.create_playlist_entry(kdrama_id, playlist_id)
    ple_json = {'playlist_entry_id': playlist_entry.playlist_entry_id, 'playlist_id': playlist_entry.playlist_id}

    return jsonify({'status': 'success', 'playlist_entry': ple_json, 'message': 'Added to playlist'})

# /delete-entry.json
@playlist_api.route('/playlist/entry/<entry_id>', methods=['DELETE'])
def delete_playlist_entry(entry_id):
    """Delete specified playlist entry from playlist"""
    # playlist_entry_id = request.get_json().get("playlist_entry_id")
    crud.delete_playlist_entry(entry_id)
    return jsonify({'status': 'success', 'message': f'deleted playlist entry: {entry_id}'})

# /follow-playlist.json
@playlist_api.route('/playlist/<playlist_id>/follow', methods=['POST'])
def follow_playlist(playlist_id):
    """The current user in session adds a follow to the specified playlist"""
    user_id = session.get('user_id')
    # playlist_id = request.get_json().get("playlist_id")
    if not user_id:
        return jsonify({   'status': 'error', 
                            'message': 'Please login to follow playlist'})

    follow = crud.create_follow_playlist(user_id, playlist_id)

    return jsonify({'status': 'success', 'follow': follow.follow_playlist_id})

# /unfollow-playlist.json
@playlist_api.route('/playlist/follow/<follow_id>', methods=['DELETE'])
def unfollow_playlist(follow_id):
    """The current user in session unfollows the specified playlist"""
    # follow_playlist_id = request.get_json().get("follow_playlist_id")
    crud.delete_follow_playlist(follow_id)

    return jsonify({'status': 'success', 'message': 'playlist unfollowed'})

# /follow/<playlist_id>
@playlist_api.route('/playlist/<playlist_id>/follow')
def user_follows(playlist_id):
    '''Returns json True or False if the user follows the specified playlist'''
    user_id = session.get('user_id')
    follow = crud.get_follow_playlist(user_id, playlist_id)
    if follow:
        return jsonify({'follow': True, 'follow_playlist_id': follow.follow_playlist_id})
    return jsonify({'follow': False})


## PLAYLISTS

# /user_playlists.json  /user_playlists.json/<user_id>
@playlist_api.route('/playlists')
@playlist_api.route('/playlists/<user_id>')
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

@playlist_api.route('/playlists/top')
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

# /followed_playlists.json/<user_id>
@playlist_api.route('/playlists/followed')
def get_followed_playlists():
    ''' Get followed playlists by specified user '''
    user_id = request.args.get("user_id")
    playlists = []

    pls = crud.get_followed_playlists(user_id)
    for pl in pls:
        playlists.append({'playlist_id': pl.playlist_id,
                        'title': pl.title,
                        'content': pl.content,
                        'amount': len(pl.playlistentries),
                        'followers': pl.followers})
    
    return jsonify({'status': 'success', 'playlists': playlists})