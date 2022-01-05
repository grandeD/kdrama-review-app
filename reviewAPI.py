from flask import (Flask, render_template, request, flash, session,
                   redirect, jsonify, Blueprint)
import crud
import os
from datetime import datetime

review_api = Blueprint('review_api', __name__)

# '/reviews.json/<kdrama_id>'
@review_api.route('/reviews')
def get_reviews():
    ''' Get reviews for Kdrama '''
    kdrama_id = request.args.get("kdrama_id")
    reviews = []
    revs = crud.get_reviews(kdrama_id)
    for rev in revs:
        reviews.append({'review_id': rev.review_id,
                        'username': rev.user.username,
                        'image_path': rev.user.image_path,
                        'user_id': rev.user.user_id,
                        'rating': rev.rating, 'content': rev.content,
                        'review_date': rev.review_date.strftime('%B %-d, %Y')})
    
    return jsonify({'status': 'success', 'reviews': reviews})

# /user-review.json/<kdrama_id>
@review_api.route('/review')
def get_user_review():
    ''' Get a review for a Kdrama for a specific user'''
    kdrama_id = request.args.get("kdrama_id")
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

# /create-review.json
@review_api.route('/review', methods=['POST'])
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

# update-review.json
@review_api.route('/review', methods=['PUT'])
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