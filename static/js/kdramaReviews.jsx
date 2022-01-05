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
            console.log(data);
            if (data.status === 'success') setReviews(data.reviews);
        });

        // gets review of user if it already exists
        fetch(`/review?kdrama_id=${kdrama_id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
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
                    console.log(res)
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
                    console.log(res)
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

    const revCards = [];
    // Review cards of Kdrama reviews by all users
    for (const ndx in reviews) {
        if (userReview.review_id !== reviews[ndx].review_id)
        revCards.push(
            <div key={ndx}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1em'}}>
                    <a href={`/profile/${reviews[ndx].user_id}`} className='avatar sm' >
                        <img id='avatar-img' src={reviews[ndx].image_path}/> </a>
                    <span >{reviews[ndx].username}</span> 
                    <p>{reviews[ndx].rating}/10 <span className="star">&#9733;</span></p>
                </div> 
                <p>{reviews[ndx].content}</p>
                <p>{reviews[ndx].review_date}</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Reviews</h2>
            <div style={{display: 'flex', flexDirection: 'column', width: '50%', gap: '1em', margin: '1.5em'}}>
                {revCards}
            </div>

        {showInput ? 
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', width: '50%', gap: '1em'}}>
            {/* Rating out of 10 in stars  */}
            <div style={{display: 'flex', flexDirection: 'row'}}>
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
            <input type='submit'/>
        </form>:
            <div>
                <button onClick={handleEdit}>Edit Review</button>
                <h4>Your Review</h4> 
                <a>username: <span>{userReview.username}</span></a>
                <p>rating: <span>{userReview.rating}</span></p>
                <p>content: <span>{userReview.content}</span></p>
                <p>review_date: <span>{userReview.review_date}</span></p>
            </div>
            }
        </div>

    );
};

ReactDOM.render(<KdramaReviews/>, document.querySelector('#kdrama_revs'));
