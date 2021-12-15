'use strict';
const kdrama_id = document.querySelector('#data').dataset.kdrama_id;

const UserReviews = () => {
    const [rating, setRating] = React.useState(0);
    const [hover, setHover] = React.useState(0);
    const [content, setContent] = React.useState(0);
    const [reviews, setReviews] = React.useState([]);
    const [userReview, setReview] = React.useState({});
    const [showInput, setInput] = React.useState(true);

    React.useEffect(() => {
        // grabs all user reviews for this kdrama page
        fetch(`/reviews.json/${kdrama_id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') setReviews(data.reviews);
        });
        // gets review of user if it already exists
        fetch(`/user-review.json/${kdrama_id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') {
                setReview(data.review);
                setInput(false);
            }
            
        });

    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (userReview.review_id) {
            fetch('/update-review.json', {
                method: 'POST',
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
        else if(rating > 0) {
            fetch('/create-review.json', {
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

    const handleEdit = (event) => {
        setInput(true);
        setRating(userReview.rating);
        setContent(userReview.content);
    };


    const revCards = [];

    for (const ndx in reviews) {
        if (userReview.review_id !== reviews[ndx].review_id)
        revCards.push(
            <div key={ndx}>
                <a>username: <span>{reviews[ndx].username}</span></a>
                <p>rating: <span>{reviews[ndx].rating}</span></p>
                <p>content: <span>{reviews[ndx].content}</span></p>
                <p>review_date: <span>{reviews[ndx].review_date}</span></p>
            </div>
        );
    }

    return (
        <div>
            <h2>Reviews</h2>
            {revCards}
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

ReactDOM.render(<UserReviews/>, document.querySelector('.user_revs'));
