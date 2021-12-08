'use strict';

// Card view component of a specific korean drama
const KdramaCard = (props) => {
    return(
    <div className='card'>
        <a href={`/kdrama/${props.kdrama_id}`}>
        <img style={{height: '200px'}} src={`https://image.tmdb.org/t/p/original/${props.poster_path}`} alt='Kdrama Poster' />
        </a>
        <p>{props.title}</p>
    </div>
    );
}

const Homepage = (props) =>  {
    const [topDramas, setTop] = React.useState([]);

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
                setTop(data['results']);
          });
    }, []);


    // creates and stores top korean dramas as KdramaCards in kdramaCards
    const kdramaCards = [];
    for (const kdrama of topDramas) {
        kdramaCards.push(
            <KdramaCard
            key={kdrama.id}
            kdrama_id={kdrama.id} 
            poster_path={kdrama.backdrop_path}
            title={kdrama.name}
            />
        );
    }

    return (
        <React.Fragment>
            <h2>Top Korean Dramas</h2>
            <div>{kdramaCards}</div>
        </React.Fragment>
    );
}

const api_key = document.querySelector('#data').dataset.api_key;
ReactDOM.render(<Homepage api_key={api_key}/>, document.querySelector('.content'));

