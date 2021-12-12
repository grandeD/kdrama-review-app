'use strict';
const kdrama_id = document.querySelector('#data').dataset.kdrama_id;
 
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/original/';
// Card view component of a specific korean drama
const KdramaCard = (props) => {
    return(
    <div className='card'>
        <a href={`/kdrama/${props.kdrama_id}`}>
        <img style={{height: '200px'}} src={`${TMDB_IMAGE_URL}${props.poster_path}`} alt='Kdrama Poster' />
        </a>
        <p>{props.title}</p>
    </div>
    );
}

// Card view component of a specific cast member
const CastCard = (props) => {
    return(
    <div className='card'>
        <a href={`/cast/${props.cast_id}`}>
        <img style={{height: '150px'}} src={`${TMDB_IMAGE_URL}${props.profile_path}`} alt={props.name} />
        </a>
        <p>{props.name}</p>
        <p>Character: {props.character}</p>
    </div>
    );
}

// Takes in basic info a korean drama and displays
const HeadContent = (props) => {
    return(
    <div className='top'>
        <img style={{height: '400px'}} src={`${TMDB_IMAGE_URL}${props.backdrop_path}`} alt='Kdrama Backdrop' />
        <img style={{height: '200px'}} src={`${TMDB_IMAGE_URL}${props.poster_path}`} alt='Kdrama Poster' />

        <h2>{props.title}</h2>
        <p>First Air Date: {props.first_air_date}</p>

        <h3>Overview</h3>
        <p>{props.overview}</p>

    </div>
    );
}


// Displays basic kdrama info, cast members and similar kdramas if any
const KdramaInfo = (props) =>  {

    const [kdramaData, setData] = React.useState({});
    const [cast, setCast] = React.useState([]);
    const [recommendations, setRecommend] = React.useState([]);

    React.useEffect(() => {
        // Gets basic kdrama data from TMDB API -> kdramaData
        fetch(`https://api.themoviedb.org/3/tv/${props.kdrama_id}?language=en-US&api_key=${props.api_key}`)
          .then(response => response.json())
          .then(data => {
                console.log(data);
                setData(data)
          });

        // Gets cast of kdrama data from TMDB API -> cast
        fetch(`https://api.themoviedb.org/3/tv/${props.kdrama_id}/credits?language=en-US&api_key=${props.api_key}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.cast !== null){
                    setCast(data.cast);
                }
                
            });

        // Gets recommended dramas from TMDB API and filters specifically korean tv shows if any -> recommendations
        fetch(`https://api.themoviedb.org/3/tv/${props.kdrama_id}/recommendations?language=en-US&api_key=${props.api_key}`)
            .then(response => response.json())
            .then(data => {
                if (data.results !== null){
                    let kdrama_results = [];
                    for (const result of data.results){
                        if (result.original_language === 'ko')
                            kdrama_results.push(result);
                    }
                    console.log(kdrama_results);
                    setRecommend(kdrama_results);
                }
            });


    }, []);

    // creates and stores recommendations as KdramaCards in recCards
    const recCards = [];
    for (const rec of recommendations) {
        recCards.push(
            <KdramaCard
            key={rec.id}
            kdrama_id={rec.id} 
            poster_path={rec.backdrop_path}
            title={rec.name}
            />
        );
    }

    // creates and stores cast as CastCards in castCards
    const castCards = [];
    for (const currentCard of cast) {
        castCards.push(
            <CastCard
            key={currentCard.id}
            character={currentCard.character}
            name={currentCard.name}
            cast_id={currentCard.id} 
            profile_path={currentCard.profile_path}
            />
        );
    }

    const content = [];
    if (kdramaData !== {}) {
        content.push(<HeadContent title={kdramaData.name} 
            first_air_date={kdramaData.first_air_date}
            overview={kdramaData.overview} 
            backdrop_path={kdramaData.backdrop_path}
            poster_path={kdramaData.poster_path}
            key={props.kdrama_id}/>);
    }

    return (
        <React.Fragment>
            {content}
            {castCards.length > 0 &&
                <h3>Cast</h3>}
            {castCards}
            {recCards.length > 0 &&
                <h3>Similar Korean Dramas</h3>}
            {recCards}
        </React.Fragment>
    );
}

// const kdrama_id = document.querySelector('#data').dataset.kdrama_id;
const api_key = document.querySelector('#data').dataset.api_key;
ReactDOM.render(<KdramaInfo kdrama_id={kdrama_id} api_key={api_key}/>, document.querySelector('.content'));

