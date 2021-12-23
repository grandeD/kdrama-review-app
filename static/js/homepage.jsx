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
            <a href={`/kdrama/${kdrama.id}`} key={kdrama.id} >
            <div className='slide' >
                <img style={{height: '100%'}} 
                src={`https://image.tmdb.org/t/p/original/${kdrama.backdrop_path}`} alt='Kdrama Poster' /> 
                <p>{kdrama.name}</p>
            </div> 
            </a>
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
        </React.Fragment>
    );


}

const api_key = document.querySelector('#data').dataset.api_key;
ReactDOM.render(<Homepage api_key={api_key}/>, document.querySelector('.content'));

