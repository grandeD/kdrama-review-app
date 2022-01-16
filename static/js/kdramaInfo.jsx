'use strict';
const kdrama_id = document.querySelector('#data').dataset.kdrama_id;
 
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/original/';
// Card view component of a specific korean drama
const KdramaCard = (props) => {
    return(
        <div className='card'>
        <a href={`/kdrama/${props.kdrama_id}`}>
        <div className='kdrama-img'>
            <img style={{width: '100%'}}
        src={props.poster_path} 
        alt='Kdrama Poster' />
        </div>
        <p className='card-text'>{props.title} <span className='thin grey-400'>({props.year})</span></p>
        </a>
    </div>
    );
}

// Card view component of a specific cast member
const CastCard = (props) => {
    return(
    <div className='card'>
        <a href={`/person/${props.cast_id}`}>
        <div className='cast-img'>
            <img style={{width: '100%'}} src={props.profile_path} alt={props.name} />
        </div>

        <p className='card-text'>{props.name}</p>
        </a>
        <p className='card-text thin grey-400'>{props.character}</p>
    </div>
    );
}


// Displays basic kdrama info, cast members and similar kdramas if any
const KdramaInfo = (props) =>  {

    const [kdramaData, setData] = React.useState({});
    const [cast, setCast] = React.useState([]);
    const [recommendations, setRecommend] = React.useState([]);
    const [watchProviders, setWatch] = React.useState([]);

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

        // Gets watch provider of kdrama if there is one
        fetch(`https://api.themoviedb.org/3/tv/${props.kdrama_id}/watch/providers?api_key=${props.api_key}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.results.US && data.results.US.flatrate){
                    const logos = data.results.US.flatrate.map((watch_provider) => {
                        return watch_provider.logo_path;  
                    });

                    setWatch({  'link': data.results.US.link, 
                                'logos': logos} );
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
                    setRecommend(kdrama_results.slice(0, 10));
                }
            });
    }, []);

    // creates and stores recommendations as KdramaCards in recCards
    const recCards = [];
    for (const rec of recommendations) {
        const poster_path = (rec.poster_path !== '' ? 
        `${TMDB_IMAGE_URL}${rec.poster_path}`:
        '/static/img/placeholder-image.png');
        recCards.push(
            <KdramaCard
            key={rec.id}
            kdrama_id={rec.id} 
            poster_path={poster_path}
            title={rec.name}
            year={rec.first_air_date.slice(0,4)}
            />
        );
    }

    // creates and stores cast as CastCards in castCards
    const castCards = [];
    for (const currentCard of cast) {
        const profile_path = ((currentCard.profile_path !== '' && currentCard.profile_path !== null) ? 
                                `${TMDB_IMAGE_URL}${currentCard.profile_path}`:
                                '/static/img/default-person.jpeg');
        castCards.push(
            <CastCard
            key={currentCard.id}
            character={currentCard.character}
            name={currentCard.name}
            cast_id={currentCard.id} 
            profile_path={profile_path}
            />
        );
    }

    // creates and stores creators/crew in creators
    const creators = [];
    if (kdramaData.created_by) {
        for (const creator of kdramaData.created_by) {
            creators.push(
                <div key={creator.id}>
                    <a className='light' href={`/person/${creator.id}`}>
                    {creator.name}
                    </a>
                </div>
            );
        }
    }


    let watch_logos = [];
    if (watchProviders.logos) {
        watch_logos = watchProviders.logos.map((logo, index) => {
        return  (<a href={watchProviders.link} 
                    target='_blank' 
                    rel='noopener noreferrer'
                    key={index}>
                    <img style={{height: '50px'}} src={`${TMDB_IMAGE_URL}${logo}`} /></a> ); });
    }

    const genre_string = (kdramaData.genres ? 
                            kdramaData.genres.map((genre) => genre.name).join(', '): '');
    const eps = kdramaData.number_of_episodes;
    const episode_string = ( eps > 1 ? `${eps} episodes`: `${eps} episode`);


    return (
        <React.Fragment>
            {kdramaData &&
                <div className='data rounded'
                style={{
                    background: `linear-gradient(to right, rgba(11.76%, 10.98%, 9.02%, 1.00) 150px, rgba(11.76%, 10.98%, 9.02%, 0.84) 100%),
                    url(${TMDB_IMAGE_URL}${kdramaData.backdrop_path}) no-repeat center center / cover` }}>

                    <div className='data-item'>
                        <img className='poster-img rounded' src={`${TMDB_IMAGE_URL}${kdramaData.poster_path}`} alt='Kdrama Poster' />

                        {watch_logos.length > 0 && 
                        <div>
                            <p>Stream on: </p>
                            <div className='flex-gap-1em'>{watch_logos}</div>
                        </div>
                        }
                    </div>
                    <div className='data-item'>
                        <h1>{kdramaData.name}</h1>
                        {kdramaData.first_air_date && 
                            <h2 >{kdramaData.first_air_date.slice(0,4)}&emsp;
                            <span className='thin grey-100'>{kdramaData.original_name}</span>
                            </h2>
                        }
                        <p><span className='thin grey-100'>Genres</span>&emsp;{genre_string}</p>
                        <p><span>{episode_string}</span></p>
                        
                        <p id='pl-message'></p>
                        <div className='flex-gap-1em buttons'>
                            <div id='add_to_playlist'></div>
                            <div id='play_trailer'></div>
                        </div>

                        <h2>Overview</h2>
                        <p className='thin'>{kdramaData.overview}</p>

                        {creators.length > 0 &&
                        <h3>Created by</h3>}
                        <div className='flex-gap'>
                            {creators}
                        </div>
                    </div>
                </div>                          
            }
            <div style={{margin: '2em 0'}}>
            {castCards.length > 0 &&
                <h3>Cast</h3>}
                <div className='flex-gap center'>
                    {castCards}
                </div>

            {recCards.length > 0 &&
                <h3>Similar Korean Dramas</h3>}
                <div className='flex-gap center'>
                    {recCards}
                </div>
            </div>

        </React.Fragment>
    );
}

const api_key = document.querySelector('#data').dataset.api_key;
ReactDOM.render(<KdramaInfo kdrama_id={kdrama_id} api_key={api_key}/>, document.querySelector('.content'));

