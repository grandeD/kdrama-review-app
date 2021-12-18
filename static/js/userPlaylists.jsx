'use strict';

const PlaylistCard = (props) => {

    return (
        <a id='card' href={`/playlist/${props.playlist_id}`}>
        <div className='card'>
            <h3>{props.title}</h3>
            <p>{props.amount} items</p>
        </div>
        </a>
    );
};

const UserPlaylists = (props) => {

    const [userPlaylists, setUserPlaylists] = React.useState([]);

    React.useEffect(() => {
        // grabs all user playlists 
        fetch(`/user_playlists.json`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') setUserPlaylists(data.playlists);
        });
    }, []);

    const  plCards = [];

    for(const pl of userPlaylists) {
        plCards.push(
            <PlaylistCard
            key={pl.playlist_id}
            playlist_id={pl.playlist_id}
            title={pl.title}
            amount={pl.amount}
            />
        );
    }


    return (
        <React.Fragment >
            {plCards}
        </React.Fragment >
    );
};

ReactDOM.render(<UserPlaylists />, document.querySelector('#user_playlists'));