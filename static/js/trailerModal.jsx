
const TrailerModal = (props) => {
    const [modal, setModal] = React.useState(false);
    const [trailerURL, setURL] = React.useState('');

    React.useEffect(() => {
        // Gets YouTube trailer URL from TMDB api -> 
        fetch(`https://api.themoviedb.org/3/tv/${props.kdrama_id}/videos?api_key=${props.api_key}`)
          .then(response => response.json())
          .then(data => {
                console.log(data);
                for(const video of data.results) {
                    if (video.type === 'Trailer' && video.site === 'YouTube'){
                        setURL(`https://www.youtube.com/embed/${video.key}`);
                    }
                }
          });
    }, []);

    return (
    <div>
        { modal && 
        <div className='modal'>
            <section className='modal-main dark'>
                <div className='modal-close'>
                <button onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
                </div>
                <iframe height='400px' style={{border: 'none'}}
                src={trailerURL}>
                </iframe>
            </section>
        </div> }
        <div> 
            { trailerURL !== '' &&
            <button className='icon-button'
            onClick={() => setModal(true)}><i className="fas fa-play"></i> <p>Play Trailer</p></button> }
        </div>
        
    </div>
    )
};

const kdrama_id = document.querySelector('#data').dataset.kdrama_id;
const api_key = document.querySelector('#data').dataset.api_key;
ReactDOM.render(<TrailerModal kdrama_id={kdrama_id} api_key={api_key}/>, document.querySelector('#play_trailer'));

