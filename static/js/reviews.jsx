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
            <div key={ndx} className='flex-gap'>
                <a href={`/kdrama/${reviews[ndx].kdrama_id}`}>
                    <img style={{height: '200px'}} 
                    src={`${TMDB_IMAGE_URL}${reviews[ndx].poster_path}`} alt='Kdrama Poster' />
                    <div>{reviews[ndx].title}</div>
                </a>
                <div>
                    {user ? <div><p>{reviews[ndx].rating}/10 <span className="star">&#9733;</span></p></div> 
                    : <div className='flex-gap-1em'>
                        <a href={`/profile/${reviews[ndx].user_id}`} className='flex-gap-1em' >
                            <div className='avatar sm'>
                            <img id='avatar-img' src={reviews[ndx].image_path}/> 
                            </div>    
                        <span >{reviews[ndx].username}</span> 
                        </a>
                        <p>{reviews[ndx].rating}/10 <span className="star">&#9733;</span></p>
                    </div> }
                    <p>{reviews[ndx].content}</p>
                    <p>{reviews[ndx].review_date}</p>
                    <span>{reviews[ndx].likes} Likes</span> 
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{display: 'flex', flexDirection: 'column' , gap: '1em', margin: '1.5em'}}>
                {revCards}
            </div>
        </div>

    );
};

ReactDOM.render(<Reviews/>, document.querySelector('.reviews'));
