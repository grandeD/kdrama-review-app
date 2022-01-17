'use strict';
const api_url = document.querySelector('#data').dataset.review_api_url;
const user = document.querySelector('#data').dataset.user;
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/original/';

// component to allow user to see kdrama reviews and input their own
const Reviews = () => {
    const [reviews, setReviews] = React.useState([]);

    React.useEffect(() => {
        // grabs reviews based off api_url
        fetch(api_url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') setReviews(data.reviews);
        });
    }, []);


    const revCards = [];
    // Review cards populated from API call
    for (const ndx in reviews) {
        revCards.push(
            <div key={ndx} className='review-card'>
                <div style={{paddingBottom: '1em'}}>
                    <h4>{reviews[ndx].title}</h4></div>
                <div className='flex-gap' >
                <a href={`/kdrama/${reviews[ndx].kdrama_id}`}>
                    <img style={{height: '200px', paddingBottom: '1em'}} 
                    src={`${TMDB_IMAGE_URL}${reviews[ndx].poster_path}`} alt='Kdrama Poster' />
                </a>
                <div style={{flexShrink: '1'}}>

                    {user ? <div><p className='grey-400'>{reviews[ndx].rating}/10 <span className="star">&#9733;</span></p></div> 
                    :<div className='flex-gap-1em' >
                        <a href={`/profile/${reviews[ndx].user_id}`} className='avatar sm' >
                            <img id='avatar-img' src={reviews[ndx].image_path}/> </a>
                        <strong >{reviews[ndx].username}</strong> 
                        <p className='grey-400'>{reviews[ndx].rating}/10 <span className="star">&#9733;</span></p>
                    </div>  }

                    <p >{reviews[ndx].content}</p>
                    <p className='grey-400 thin'>{reviews[ndx].review_date}</p>
                    <div className='review-like'>
                        <i className="fas fa-heart grey-300"></i>
                        <span className='grey-300'> {reviews[ndx].likes} {(reviews[ndx].likes === 1 ? 'like' : 'likes')}</span> 
                    </div>
                </div>

                </div>

            </div>




        );
    }

    return (
        <div>
            <div className='rev-cards'>
            {revCards}
            </div>
        </div>

    );
};

ReactDOM.render(<Reviews/>, document.querySelector('.reviews'));
