
const PlaylistModal = (props) => {

    const [modal, setModal] = React.useState(false);
    const [createPlaylist, setCreatePlaylist] = React.useState(false);
    const [userPlaylists, setUserPlaylists] = React.useState([]);
    const [message, setMessage] = React.useState('');


    React.useEffect(() => {
        // grabs all user playlists 
        fetch(`/user_playlists.json`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') setUserPlaylists(data.playlists);
        });
    }, []);

    const showModal = () => {
        setModal(true);
    };

    const closeModal = () => {
        setModal(false);
        setCreatePlaylist(false);
    };

    const showCreatePlaylist = () => {
        setCreatePlaylist(true);
    };

    const submitPlaylist = (e) => {
        e.preventDefault();
        
        fetch('/create-playlist.json', {
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
                setCreatePlaylist(false);
            });
        });

        setCreatePlaylist(false);
    }

    const addToPlaylist = (e) => {
        fetch('/add-to-playlist.json', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({'kdrama_id': props.kdrama_id, 'playlist_id': e.target.name }),
        }).then(response => {
            response.json().then(res=> {
                console.log(res);
                setMessage(res.message);
                closeModal();
            });
        });

    };


    const plCards = [];

    for (const ndx in userPlaylists) {
        plCards.push(
            <div key={ndx}>
                <button onClick={addToPlaylist} name={userPlaylists[ndx].playlist_id}>
                    {userPlaylists[ndx].title}</button>
                
            </div>
        );
    }

    return (
    <div>
        { modal ? 
        <div className='modal'>
            <section className='modal-main'>
                Hi Diana! {props.kdrama_id}
                
                {createPlaylist ? <div>
                    <form onSubmit={submitPlaylist}>
                        <input type="text" placeholder="Playlist Title" name="title" />
                        <button type="submit"><i className="fas fa-plus-square"></i></button>
                    </form>
                    </div>
                    :
                    <button onClick={showCreatePlaylist}>Create Playlist</button>    
                }
                {plCards}


                <button onClick={closeModal}><i className="fas fa-times"></i></button>

            </section>
        </div>
        :
        <div> 
            <button onClick={showModal}>Add to List</button>
            <p>{message}</p>
        </div>

        }
        
    </div>
    )
};

const kdrama_id = document.querySelector('#data').dataset.kdrama_id;
ReactDOM.render(<PlaylistModal kdrama_id={kdrama_id}/>, document.querySelector('#add_to_playlist'));

