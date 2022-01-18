'use strict';
const kdrama_id = document.querySelector('#data').dataset.kdrama_id;

// component to allow user to see kdrama reviews and input their own
const KdramaReviews = () => {

    // Rating and content - vars for user review input
    const [rating, setRating] = React.useState(0);
    const [content, setContent] = React.useState('');
    // Hover determines which stars in input rating should be filled in
    const [hover, setHover] = React.useState(0);
    // kdrama reviews of all users
    const [reviews, setReviews] = React.useState([]);
    // userReview if user already has one, showInput will disable input if user has review
    const [userReview, setReview] = React.useState({});
    const [showInput, setInput] = React.useState(true);

    React.useEffect(() => {
        // grabs all user reviews for this kdrama page
        fetch(`/reviews?kdrama_id=${kdrama_id}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            if (data.status === 'success') setReviews(data.reviews);
        });

        // gets review of user if it already exists
        fetch(`/review?kdrama_id=${kdrama_id}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            if (data.status === 'success') {
                setReview(data.review);
                setInput(false);
            }
            
        });

    }, []);

    // Submits user input to database and updates state
    const handleSubmit = (event) => {
        event.preventDefault();

        // if a user review exists, updates the existing review in the db
        if (userReview.review_id) {
            fetch('/review', {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({'review_id': userReview.review_id,
                                    'rating': rating, 'content': content, 'kdrama_id': kdrama_id }),
            }).then(response => {
                response.json().then(res=> {
                    // console.log(res)
                    setReview(res.review);
                    setInput(false);
                });
            });
        }
        // Create review and submit to db
        else if(rating > 0) {
            fetch('/review', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({'rating': rating, 'content': content, 'kdrama_id': kdrama_id }),
            }).then(response => {
                response.json().then(res=> {
                    // console.log(res)
                    setReview(res.review);
                    setInput(false);
                });
            });

        }


    };

    // If user wants to edit existing review, will enable input
    // and set the placeholder values to existing review content and rating
    const handleEdit = (event) => {
        setInput(true);
        setRating(userReview.rating);
        setContent(userReview.content);
    };


    const handleLike = (review, index) => {
        // console.log(review);
        // default values are for unlike review
        let method = 'DELETE'; let user_like = false; let like = -1
        if (!review.user_like)  {
            method = 'POST';       user_like = true;      like = 1;
        }

        // POST call to flask server to like a review
        fetch(`/review/${review.review_id}/like`, {
            method: method,  headers: {'Content-Type': 'application/json'},})
        .then(response => response.json())
        .then(res => {
            // console.log(res);
            if(res.status === 'success') {
                // update state values for reviews
                let newReviews = [...reviews];
                newReviews[index].likes += like;
                newReviews[index].user_like = user_like;
                setReviews(newReviews);
            }
        });
    };

    const revCards = [];
    // Review cards of Kdrama reviews by all users
    for (const ndx in reviews) {
        if (userReview.review_id !== reviews[ndx].review_id)
        revCards.push(
            <div key={ndx} className='review-card'>
                <div className='flex-gap-1em'>
                    <a href={`/profile/${reviews[ndx].user_id}`} className='avatar sm' >
                        <img id='avatar-img' src={reviews[ndx].image_path}/> </a>
                    <strong >{reviews[ndx].username}</strong> 
                    <p className='grey-400'>{reviews[ndx].rating}/10 <span className="star">&#9733;</span></p>
                </div> 
                <p>{reviews[ndx].content}</p>
                <p className='grey-400 thin'>{reviews[ndx].review_date}</p>
                <div className='review-like'>
                    <button onClick={() => handleLike(reviews[ndx], ndx)}>
                        {(reviews[ndx].user_like ? <i className="fas fa-heart accent"></i>
                                                : <i className="far fa-heart grey-300"></i>)}
                    </button> 
                    <span className='grey-300'>{reviews[ndx].likes} {(reviews[ndx].likes === 1 ? 'like' : 'likes')}</span> 
                </div>
            </div>
        );
    }

    return (
        <div style={{margin: '2em 0'}}>
            <h2>Reviews</h2>
            <div className='rev-cards'>
                {revCards}
            </div>

            <div className='rev-cards' style={{minHeight: '20em'}}>
        {showInput ? 
        <form onSubmit={handleSubmit} className='rev-form'>
            {/* Rating out of 10 in stars  */}
            <div id='stars'>
                {[...Array(10)].map((star, index) => {
                    index += 1;
                    return (
                    <button
                        type="button"
                        key={index} id='star'
                        className={index <= (hover || rating) ? "on" : "off"}
                        onClick={() => setRating(index)}
                        onMouseEnter={() => setHover(index)}
                        onMouseLeave={() => setHover(rating)}
                    >
                        <span className="star">&#9733;</span>
                    </button>
                    );
                })}
            </div>
            <label htmlFor='text-review'>Enter a comment (optional): </label>
            <textarea id='text-review' name='content' value={content} onChange={(e) => setContent(e.target.value) }> </textarea>
            <button className='rev-btn' style={{alignSelf: 'flex-end'}}
                    onClick={handleSubmit}>Post</button>
        </form>:
            <div className='review-card'>
                <div className='flex-gap-1em'>
                    <h3>Your Review</h3> 
                    <button onClick={handleEdit} style={{fontSize: '0.8em'}}
                            className='rev-btn'>Edit</button>
                </div>
                <div className='flex-gap-1em'>
                    <a href={`/profile/${userReview.user_id}`} className='avatar sm' >
                        <img id='avatar-img' src={userReview.image_path}/> </a>
                    <strong >{userReview.username}</strong> 
                    <p className='grey-400'>{userReview.rating}/10 <span className="star">&#9733;</span></p>
                </div> 
                <p>{userReview.content}</p>
                <p className='grey-400 thin'>{userReview.review_date}</p>
                <div className='review-like'>
                    <i className="fas fa-heart grey-300"></i>
                    <span className='grey-300'> {userReview.likes} {(userReview.likes === 1 ? 'like' : 'likes')}</span> 
                </div>
            </div>
            }
        </div>
        </div>

    );
};

ReactDOM.render(<KdramaReviews/>, document.querySelector('#kdrama_revs'));
