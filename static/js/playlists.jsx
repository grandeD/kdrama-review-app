const PlaylistCard = (props) => {

    return (
        <div id='pl-card' style={{ background: `linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 0.6)
          ),
        url('https://image.tmdb.org/t/p/original/${props.cover_img}') no-repeat center center / cover` }}>
        <a href={`/playlist/${props.playlist_id}`}>
            <h3>{props.title} </h3>
            <div className='card-stats'>
                <p>{props.followers} <i class="fas fa-users"></i></p>
                <p>{props.amount} <i class="fas fa-film"></i></p>
            </div>
        </a>
        </div>
    );
};

const PlaylistsView = (props) => {

    const [playlists, setPlaylists] = React.useState([]);

    React.useEffect(() => {
        // grabs all user playlists 
        fetch(props.api_url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') setPlaylists(data.playlists);
        });
    }, []);

    const  plCards = [];

    for(const pl of playlists) {
        plCards.push(
            <PlaylistCard
            key={pl.playlist_id}
            playlist_id={pl.playlist_id}
            title={pl.title}
            amount={pl.amount}
            followers={pl.followers}
            cover_img={pl.cover_img}
            />
        );
    }


    return (
        <React.Fragment >
            {plCards}
        </React.Fragment >
    );
};

const api_url = document.querySelector('#data').dataset.api_url;
if (document.querySelector('.playlists') !== null ){
    ReactDOM.render(<PlaylistsView api_url={api_url} />, document.querySelector('.playlists'));
}

