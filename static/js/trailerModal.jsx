
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
            <section className='modal-main'>
                <iframe height='400px'
                src={trailerURL}>
                </iframe>
                <button onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </section>
        </div> }
        <div> 
            { trailerURL !== '' &&
            <button onClick={() => setModal(true)}>Play Trailer</button> }
        </div>
        
    </div>
    )
};

const kdrama_id = document.querySelector('#data').dataset.kdrama_id;
const api_key = document.querySelector('#data').dataset.api_key;
ReactDOM.render(<TrailerModal kdrama_id={kdrama_id} api_key={api_key}/>, document.querySelector('#play_trailer'));
