const PlaylistCard = (props) => {

    return (
        <a id='card' href={`/playlist/${props.playlist_id}`}>
        <div className='card'>
            <h3>{props.title}</h3>
            <p>{props.amount} items</p>
            <p>{props.followers} follower(s)</p>
        </div>
        </a>
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
ReactDOM.render(<PlaylistsView api_url={api_url} />, document.querySelector('.playlists'));
