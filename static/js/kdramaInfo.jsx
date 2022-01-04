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
        <a href={`/person/${props.cast_id}`}>
        <img style={{height: '150px'}} src={`${TMDB_IMAGE_URL}${props.profile_path}`} alt={props.name} />
        </a>
        <p>{props.name}</p>
        <p>Character: {props.character}</p>
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

    // creates and stores creators/crew in creators
    const creators = [];
    if (kdramaData.created_by) {
        for (const creator of kdramaData.created_by) {
            creators.push(
                <div key={creator.id}>
                    <a href={`/person/${creator.id}`}>
                    <img style={{height: '150px'}} src={`${TMDB_IMAGE_URL}${creator.profile_path}`} alt={creator.name} />
                    </a>
                    <p>{creator.name}</p>
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


    return (
        <React.Fragment>
            {kdramaData &&
                <div>
                    <img style={{height: '400px'}} src={`${TMDB_IMAGE_URL}${kdramaData.backdrop_path}`} alt='Kdrama Backdrop' />
                    <img style={{height: '200px'}} src={`${TMDB_IMAGE_URL}${kdramaData.poster_path}`} alt='Kdrama Poster' />

                    <div id='add_to_playlist'></div>
                    <div id='play_trailer'> </div>
                    {watch_logos.length > 0 && 
                    <div>
                        <p>Stream on: </p>
                        {watch_logos}
                    </div>
                    }

                    <h2>{kdramaData.name}</h2>
                    <p>First Air Date: {kdramaData.first_air_date}</p>

                    <h3>Overview</h3>
                    <p>{kdramaData.overview}</p>
                </div>                          
            }
            {castCards.length > 0 &&
                <h3>Cast</h3>}
                <div className='flex-gap'>
                    {castCards}
                </div>
            {creators.length > 0 &&
                <h3>Created by</h3>}
                <div className='flex-gap'>
                    {creators}
                </div>

            {recCards.length > 0 &&
                <h3>Similar Korean Dramas</h3>}
                <div className='flex-gap'>
                    {recCards}
                </div>
        </React.Fragment>
    );
}

const api_key = document.querySelector('#data').dataset.api_key;
ReactDOM.render(<KdramaInfo kdrama_id={kdrama_id} api_key={api_key}/>, document.querySelector('.content'));

