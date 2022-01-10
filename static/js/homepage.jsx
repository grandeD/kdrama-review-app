'use strict';

// Card view component of a specific korean drama
const KdramaCard = (props) => {
    return(
    <div className='card'>
        <a href={`/kdrama/${props.kdrama_id}`}>
        <img style={{height: '200px'}} 
        src={props.poster_path} 
        alt='Kdrama Poster' />
        </a>
        <p>{props.title}</p>
    </div>
    );
}

const CardView = (props) => {

    const [dramas, setDramas] = React.useState([]);
    const [fav_genre, setGenre] = React.useState('');

    const get_sorted_results = (sort_by, with_genres, currentPage=1, amount) => {
        // Gets korean dramas from TMDB API based on given page number, how to sort and 
        // which genres the user wants - amount specifies how many results returned (out of 20)

        fetch('https://api.themoviedb.org/3/discover/tv?' + new URLSearchParams(
            {
                'api_key': props.api_key,
                'language': 'en-US',
                'sort_by': sort_by,
                'with_original_language': 'ko',
                'with_genres': with_genres,
                'page': currentPage
            }))
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    setDramas(data['results'].slice(0, amount));
                });
    };

    React.useEffect(() => {
        fetch(`/user/${props.user_id}`).
        then(response => response.json())
        .then(res => {
            console.log(res);
            const fav_genre_id = res.user.fav_genre_id;
            const fav_genre = res.user.fav_genre;
            setGenre(fav_genre); 
            get_sorted_results('popularity.desc', fav_genre_id, 1, 10); 
        }); 
    }, []);

    // creates and stores filtered korean dramas as KdramaCards in kdramaCards
    const kdramaCards = [];
    for (const kdrama of dramas) {
        let poster_path = '/static/img/placeholder-image.png';
        // handles default poster if drama does not have image
        if (kdrama.poster_path !== null)
            poster_path = `https://image.tmdb.org/t/p/original/${kdrama.poster_path}`;
        kdramaCards.push(
            <KdramaCard
            key={kdrama.id}
            kdrama_id={kdrama.id} 
            poster_path={poster_path}
            title={kdrama.name}
            />
        );
    }

    return (
        <React.Fragment>
        <br></br>
        <h3>Based off your favorite genre: {fav_genre}</h3>
        <div className='flex-gap'>

            {kdramaCards}
        </div>
        </React.Fragment>
    )
};

const delay = 3000;
const Slideshow = (props) => {
    const [index, setIndex] = React.useState(0);
    // to store current timeout id
    const timeoutRef = React.useRef(null);
    const [topDramas, setTop] = React.useState([]);

    function resetTimeout() {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }

    React.useEffect(() => {
 
        // Gets most popular korean dramas from TMDB API -> 
        fetch('https://api.themoviedb.org/3/discover/tv?' + new URLSearchParams(
        {
            'api_key': props.api_key,
            'language': 'en-US',
            'sort_by': 'popularity.desc',
            'with_original_language': 'ko',
        }))
          .then(response => response.json())
          .then(data => {
                console.log(data['results']);
                setTop(data['results'].slice(0,10));  // limit results to top 10
          });
    }, []);

    // occurs every time index is changed    
      React.useEffect(() => {
        resetTimeout();
        // stores id to setTimeout so next reset has timeout id parameter
        timeoutRef.current = setTimeout(
          () =>
            setIndex((prevIndex) => // increments index after each delay
              prevIndex === topDramas.length - 1 ? 0 : prevIndex + 1
            ),
          delay
        );
      }, [index]);


    // Slideshow slides, contains a kdrama (image, link and title)
    const slides = [];
    for (const kdrama of topDramas) {
        slides.push(
            <div key={kdrama.id} className='slide' style={{
                background: `linear-gradient(
                    to bottom,
                    rgba(0, 0, 0, 0),
                    rgba(0, 0, 0, 0.6)
                  ),
                url('https://image.tmdb.org/t/p/original/${kdrama.backdrop_path}') no-repeat center center / cover`,
                backgroundSize: 'cover'
            }}>

                <a href={`/kdrama/${kdrama.id}`}  >
                    <h3>{kdrama.name}</h3> 
                    <span>{kdrama.first_air_date.slice(0,4)}</span>             
                </a>

            </div> 

            );
    }

    return (
        <React.Fragment>

            <div className='slideshow'>
            <h2>Top Korean Dramas</h2>
                <div className="slideshowSlider" // each -100% moves the slides, 1 slide div to left
                    style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
                >
                    {slides}
                </div>

                <div className="slideshowDots">
                    {topDramas.map((_, idx) => (
                    <div key={idx} 
                    className={`slideshowDot${index === idx ? " active" : ""}`}
                    onClick={() => setIndex(idx)}
                    ></div>
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
}



const Homepage = (props) =>  {

    return (
        <React.Fragment>
            <Slideshow api_key={props.api_key}/>
            {props.user_id !== 'None' &&
            <CardView user_id={props.user_id} api_key={props.api_key} />}
        </React.Fragment>
    );


}

const api_key = document.querySelector('#data').dataset.api_key;
const user_id = document.querySelector('#data').dataset.user_id;
ReactDOM.render(<Homepage api_key={api_key} user_id={user_id}/>, document.querySelector('.content'));

