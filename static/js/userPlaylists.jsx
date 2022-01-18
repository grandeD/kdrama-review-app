'use strict';

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

const UserPlaylists = (props) => {

    const [userPlaylists, setUserPlaylists] = React.useState([]);

    React.useEffect(() => {
        // grabs all user playlists 
        let url;
        if (props.type === 'user')
            url = `/playlists/${props.user_id}`;

        else if (props.type === 'followed')
            url = `/playlists/followed?user_id=${props.user_id}`;

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



const user_id = document.querySelector('#data').dataset.user_id;
ReactDOM.render(<UserPlaylists user_id={user_id} type={'user'}/>, document.querySelector('#user_playlists'));
ReactDOM.render(<UserPlaylists user_id={user_id} type={'followed'}/>, document.querySelector('#followed_playlists'));