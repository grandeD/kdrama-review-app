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
    user_id = request.args.get("user_id")
    reviews = []
    if kdrama_id:
        revs = crud.get_reviews(kdrama_id)
        user_id = session.get('user_id')
        for rev in revs:
            if rev.user_id != user_id:
                user_like = None
                if user_id:
                    user_like = crud.get_like_review(user_id, rev.review_id)
                reviews.append({'review_id': rev.review_id,
                                'username': rev.user.username,
                                'image_path': rev.user.image_path,
                                'user_id': rev.user.user_id,
                                'rating': rev.rating, 'content': rev.content,
                                'review_date': rev.review_date.strftime('%B %-d, %Y'),
                                'likes': rev.likes,
                                'user_like': user_like is not None })
    elif user_id:
        # get reviews of user in session
        user = crud.get_user_by_id(user_id)
        for rev in user.reviews:
            reviews.append({'review_id': rev.review_id,
                            'username': rev.user.username,
                            'image_path': rev.user.image_path,
                            'user_id': rev.user.user_id,
                            'rating': rev.rating, 'content': rev.content,
                            'review_date': rev.review_date.strftime('%B %-d, %Y'),
                            'likes': rev.likes,
                            'poster_path': rev.kdrama.poster_path,
                            'kdrama_id': rev.kdrama.kdrama_id,
                            'title': rev.kdrama.title})
    
    return jsonify({'status': 'success', 'reviews': reviews})

@review_api.route('/reviews/top')
def get_top_reviews():
    ''' Get top liked reviews '''
    reviews = []
    revs = crud.get_top_reviews()

    for rev in revs:
        reviews.append({'review_id': rev.review_id,
                        'username': rev.user.username,
                        'image_path': rev.user.image_path,
                        'user_id': rev.user.user_id,
                        'rating': rev.rating, 'content': rev.content,
                        'review_date': rev.review_date.strftime('%B %-d, %Y'),
                        'likes': rev.likes,
                        'poster_path': rev.kdrama.poster_path,
                        'kdrama_id': rev.kdrama.kdrama_id,
                        'title': rev.kdrama.title})
    
    return jsonify({'status': 'success', 'reviews': reviews})


# /user-review.json/<kdrama_id>
@review_api.route('/review', methods=['GET'])
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
                'image_path': review.user.image_path,
                'rating': review.rating, 'content': review.content,
                'likes': review.likes,
                'review_date': review.review_date.strftime('%B %-d, %Y')}
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
                        'image_path': review.user.image_path,
                        'rating': review.rating, 'content': review.content,'likes': review.likes,
                        'review_date': review.review_date.strftime('%B %-d, %Y')
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
                        'image_path': review.user.image_path,
                        'rating': review.rating, 'content': review.content,'likes': review.likes,
                        'review_date': review.review_date.strftime('%B %-d, %Y')}

    return jsonify({'status': 'success', 'review': rev_json})


# /review/<review_id>/like  POST
@review_api.route('/review/<review_id>/like', methods=['POST'])
def like_review(review_id):
    """The current user in session adds a like to the specified review"""
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({   'status': 'error', 
                            'message': 'Please login to like review'})

    like = crud.create_like_review(user_id, review_id)

    return jsonify({'status': 'success', 'like': like.like_review_id})

# /review/<review_id>/like  DELETE
@review_api.route('/review/<review_id>/like', methods=['DELETE'])
def unlike_review(review_id):
    """The current user in session unlikes the specified review"""
    user_id = session.get('user_id')
    crud.delete_like_review(user_id, review_id)

    return jsonify({'status': 'success', 'message': 'review unliked'})