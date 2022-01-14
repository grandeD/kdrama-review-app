'use strict';
const person_id = document.querySelector('#data').dataset.person_id;
 
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

// Takes in date string and converts it into the format Month, Day, Year
const dateString = (date_str) => {
    const date = new Date(date_str);
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString("en-US", options);
};

// Displays basic person (cast/crew) info and kdramas they were in
const PersonInfo = (props) =>  {

    const [personData, setData] = React.useState({});
    const [credits, setCredits] = React.useState({cast: [], crew: []});

    React.useEffect(() => {
        // Gets basic person (cast/crew) data from TMDB API -> kdramaData
        fetch(`https://api.themoviedb.org/3/person/${props.person_id}?language=en-US&api_key=${props.api_key}`)
          .then(response => response.json())
          .then(data => {
                console.log(data);
                setData(data)
          });
        
        // Gets cast and crew credits of person
        fetch(`https://api.themoviedb.org/3/person/${props.person_id}/tv_credits?language=en-US&api_key=${props.api_key}`)
          .then(response => response.json())
          .then(data => {
                console.log(data);
                setCredits(data)
          });
    }, []);

    let castCredits = []; let crewCredits = [];
    if (credits.cast.length > 0 ){
        // sorts cast credits in descending order
        let sortCredits = credits.cast.sort((a, b) => {return new Date(b.first_air_date) - new Date(a.first_air_date)});
        console.log(sortCredits);
        castCredits = sortCredits.map((credit, index) => {
            return (
                <tr key={index}>
                    <td>{credit.first_air_date.slice(0,4)}</td>
                    <td><a href={`/kdrama/${credit.id}`}>{credit.name}</a></td>
                    <td>{credit.character}</td>
                </tr>
            )
        });
}

    if (credits.crew.length > 0 ){
        // sorts crew credits in descending order
        let sortCredits = credits.crew.sort((a, b) => {return new Date(b.first_air_date) - new Date(a.first_air_date)});
        crewCredits = sortCredits.map((credit, index) => {
            return (
                <tr key={index}>
                    <td>{credit.first_air_date.slice(0,4)}</td>
                    <td><a href={`/kdrama/${credit.id}`}>{credit.name}</a></td>
                    <td>{credit.job}</td>
                </tr>
            )
        });
    }



    return (
        <React.Fragment>
            {personData &&
                <div className='data rounded' >
                    <div className='data-item'>
                    <img    className='poster-img rounded'
                            src={((personData.profile_path !== '' && personData.profile_path !== null) ? 
                                `${TMDB_IMAGE_URL}${personData.profile_path}`:
                                '/static/img/default-person.jpeg')} alt='Person Profile' />
                    </div>
                    <div className='dark'>
                    <h1>{personData.name}</h1>
                    
                    <h2>Biography</h2>
                    <p>{personData.biography}</p>

                    <h3>Known For</h3>
                    <p>{personData.known_for_department}</p>

                    <h3>Birthday</h3>
                    <p>{dateString(personData.birthday)}</p>

                    <h3>Place of Birth</h3>
                    <p>{personData.place_of_birth}</p>
                    </div>
                </div>                          
            }

            <div  style={{padding: '1em 2em 4em'}}>
            {/* Year    Title   role     genre */}
            {credits.cast.length > 0 &&
            <React.Fragment>
                <h3>Casted in:</h3>
                <table id='table'>
                <thead>
                <tr>
                    <th>Year</th>
                    <th>Title</th>
                    <th>Role</th>
                </tr>
                </thead>
                <tbody>
                {castCredits}
                </tbody>
                </table> 
            </React.Fragment>}

            {credits.crew.length > 0 &&
            <React.Fragment>
                <h3>Crew of:</h3>
                <table id='table'>
                <thead>
                <tr>
                    <th>Year</th>
                    <th>Title</th>
                    <th>Job</th>
                </tr>
                </thead>
                <tbody>
                {crewCredits}
                </tbody>
                </table> 
            </React.Fragment>}
            </div>

        </React.Fragment>
    );
}

const api_key = document.querySelector('#data').dataset.api_key;
ReactDOM.render(<PersonInfo person_id={person_id} api_key={api_key}/>, document.querySelector('.content'));

