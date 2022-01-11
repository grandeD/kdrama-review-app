
const PlaylistModal = (props) => {

    const [modal, setModal] = React.useState(false);
    const [createPlaylist, setCreatePlaylist] = React.useState(false);
    const [userPlaylists, setUserPlaylists] = React.useState([]);
    const [message, setMessage] = React.useState('');


    React.useEffect(() => {
        // grabs all user playlists and assigns to state
        fetch('/playlists')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') setUserPlaylists(data.playlists);
        });
    }, []);


    const closeModal = () => {
        setModal(false);
        setCreatePlaylist(false); // resets modal create playlist to false
    };

    // Creates new playlist and adds to state to update playlist cards
    const submitPlaylist = (e) => {
        e.preventDefault();
        // checks if there is an existing title
        if (e.target.title.value !== '') {
            fetch('/playlist', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({'title': e.target.title.value, 'content': '' }),
            }).then(response => {
                response.json().then(res=> {
                    console.log(res);
                    if (res.status === 'success') {
                        // add res.playlist to list of playlists
                        setUserPlaylists([res.playlist, ...userPlaylists]);
                    }
                });
            });
        }
        setCreatePlaylist(false);
    }

    // Attempts to add the current kdrama to passed in playlist id
    // sets state message of successful or unsuccessful add
    const addToPlaylist = (playlist_id) => {
        fetch(`/playlist/${playlist_id}/entry`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({'kdrama_id': props.kdrama_id}),
        }).then(response => {
            response.json().then(res=> {
                console.log(res);
                setMessage(res.message);
                closeModal();
            });
        });

    };


    const plCards = [];

    for (const playlist of userPlaylists) {
        plCards.push(
            <div key={playlist.playlist_id}>
                <button onClick={() => addToPlaylist(playlist.playlist_id)}>
                    <i className="fas fa-plus-square"></i>
                </button>
                <p>{playlist.title}</p>
            </div>
        );
    }

    return (
    <div>
        { modal ? 
        <div className='modal'>
            <section className='modal-main'>
                
                {createPlaylist ? <div>
                    <form onSubmit={submitPlaylist}>
                        <input type="text" placeholder="Playlist Title" name="title" />
                        <button type="submit"><i className="fas fa-plus-square"></i></button>
                    </form>
                    </div>
                    :
                    <button onClick={() => setCreatePlaylist(true)}>Create Playlist</button>    
                }
                {plCards}


                <button onClick={closeModal}><i className="fas fa-times"></i></button>

            </section>
        </div>
        :
        <div> 
            <button className='icon-button'
            onClick={() => setModal(true)}><i className="fas fa-plus"></i> <p>Add to List</p></button>
            {/* <p>{message}</p> */}
        </div>

        }
        
    </div>
    )
};

const kdrama_id = document.querySelector('#data').dataset.kdrama_id;
ReactDOM.render(<PlaylistModal kdrama_id={kdrama_id}/>, document.querySelector('#add_to_playlist'));

