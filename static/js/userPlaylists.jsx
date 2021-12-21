'use strict';

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

const UserPlaylists = (props) => {

    const [userPlaylists, setUserPlaylists] = React.useState([]);

    React.useEffect(() => {
        // grabs all user playlists 
        let url;
        if (props.type === 'user')
            url = `/user_playlists.json/${props.user_id}`;

        else if (props.type === 'followed')
            url = `/followed_playlists.json/${props.user_id}`;

        fetch(url)
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



const user_id = document.querySelector('#data').dataset.user_id;
ReactDOM.render(<UserPlaylists user_id={user_id} type={'user'}/>, document.querySelector('#user_playlists'));
ReactDOM.render(<UserPlaylists user_id={user_id} type={'followed'}/>, document.querySelector('#followed_playlists'));