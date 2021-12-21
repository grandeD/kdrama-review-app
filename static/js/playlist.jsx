'use strict';

// Card view component of a specific korean drama
const KdramaCard = (props) => {
    return(
    <div className='card'>
        <a href={`/kdrama/${props.kdrama_id}`}>
        <img style={{height: '200px'}} src={props.poster_path} alt='Kdrama Poster' />
        </a>
        <p>{props.title}</p>
    </div>
    );
}

const Playlist = (props) => {

    const [playlistInfo, setInfo] = React.useState({title: '', content: '', amount: 0, followers: 0, user_id:0, username:''});
    const [playlistEntries, setEntries] = React.useState([]);
    // var to control showing the delete buttons for entries
    const [showDelete, setDelete] = React.useState(false);
    const [modal, setModal] = React.useState(false);
    const [updateInfo, setUpdateInfo] = React.useState({title: '', content: ''});
    const [edit, setEdit] = React.useState(false);
    const [follow, setFollow] = React.useState({show: false, id: ''})

    React.useEffect(() => {
        // grabs playlist info and playlist entries 
        fetch(`/user_playlist.json/${props.playlist_id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') {
                setInfo(data.info);
                setUpdateInfo(data.info);
                setEntries(data.entries);
                setEdit(data.edit);
                if (!data.edit) { // current user is view another user's playlist
                    checkFollow(); // check if they are following playlist and update state

                }
            }
        });
    }, []);

    const checkFollow = () => {
        fetch(`/follow/${props.playlist_id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.follow) {
                setFollow({show: true, id:data.follow_playlist_id});
            }
        });
    };

    const deleteEntry = (playlist_entry_id) => {
        // deletes playlist entry and updates state to show updated changes
        fetch('/delete-entry.json', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({'playlist_entry_id': playlist_entry_id}),
        }).then(response => {
            response.json().then(res=> {
                console.log(res);
                if (res.status === 'success') {
                    // updates state to exclude deleted entry
                    const newEntries = playlistEntries.filter(entry => entry.playlistentry_id !== playlist_entry_id);
                    setInfo({...playlistInfo, ['amount']: playlistInfo.amount - 1});
                    setEntries(newEntries);
                }
            });
        });

    }

    const updatePlaylistInfo = (e) => {
        // updates playlist info from user input modal to db
        e.preventDefault();
        // POST call to flask server to update playlist
        fetch('/update-playlist.json', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...updateInfo, ['playlist_id']: props.playlist_id})
        }).then(response => response.json())
        .then(res => {
            console.log(res);
            if(res.status === 'success') {
                // update state values for playlistInfo
                setModal(false);
                setInfo((playlistInfo) => ({
                    ...playlistInfo,
                    ['title']: updateInfo.title,
                    ['content']: updateInfo.content,
                }));

            }
        });
    };

    const followPlaylist =() => {
        // POST call to flask server to follow playlist
        fetch('/follow-playlist.json', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'playlist_id': props.playlist_id})
        }).then(response => response.json())
        .then(res => {
            console.log(res);
            if(res.status === 'success') {
                // update state values for playlistInfo
                setInfo((playlistInfo) => ({
                    ...playlistInfo,
                    ['followers']: playlistInfo.followers + 1,
                }));
                setFollow({show: true, id:res.follow});
            }
        });
    };

    const unfollowPlaylist =() => {
        // POST call to flask server to follow playlist
        fetch('/unfollow-playlist.json', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'follow_playlist_id': follow.id})
        }).then(response => response.json())
        .then(res => {
            console.log(res);
            if(res.status === 'success') {
                // update state values for playlistInfo
                setInfo((playlistInfo) => ({
                    ...playlistInfo,
                    ['followers']: playlistInfo.followers - 1,
                }));
                setFollow({show: false, id:''});
            }
        });
    };

    // updates the state vars for input 
    const handleInputChange = (event) => {
        event.persist();
        setUpdateInfo((updateInfo) => ({
            ...updateInfo,
            [event.target.name]: event.target.value,
        }));
    };

    // makes sure updateInfo values resets to original state 
    // closes input modal
    const closeModal = (event) => {
        setModal(false);
        setUpdateInfo(playlistInfo);
    };

    const pleCards = [];

    for(const entry of playlistEntries) {

        let poster_path = '/static/img/placeholder-image.png';
        // handles default poster if drama does not have image
        if (entry.poster_path !== null)
            poster_path = `https://image.tmdb.org/t/p/original/${entry.poster_path}`;
        pleCards.push(
            <div key={entry.kdrama_id}>
                {showDelete && <button onClick={() => deleteEntry(entry.playlistentry_id)}>
                    <i className="fas fa-times"></i>
                </button>}
                <KdramaCard 
                kdrama_id={entry.kdrama_id}
                title={entry.title}
                poster_path={poster_path}/>
            </div>

        )
    }
    return(
        <React.Fragment>
            <h1>{playlistInfo.title}</h1>
            {playlistInfo.content !== '' && <p>Description: {playlistInfo.content}</p>}
            {!edit && <h2>Created by <a href={`/profile/${playlistInfo.user_id}`}>{playlistInfo.username}</a></h2>}
            <h3>{playlistInfo.followers} follower(s)</h3>
            <h3>Total: {playlistInfo.amount} kdrama(s)</h3>

            { modal ? 
            <div className='modal'>
                <section className='modal-main'>

                <form onSubmit={updatePlaylistInfo} id='pl-info-form'>
                        
                    <button onClick={closeModal}><i className="fas fa-times"></i></button>
                    <label>Playlist Title:</label>
                    <input type='text' value={updateInfo.title} name='title' onChange={handleInputChange}/>

                    <label htmlFor='text-review'>Enter a description (optional): </label>
                    <textarea id='text-review' name='content' value={updateInfo.content} onChange={handleInputChange}> </textarea>
                    
                    <button type="submit">Update</button>
                </form>
                </section>
            </div>
            :
            <div> 
                {edit && 
                <button onClick={() => setModal(true)}>Edit Info</button>}
            </div>

            }
            <br></br><br></br>
            {!showDelete && edit && <button onClick={() => setDelete(true)}>Edit Entries</button>}
            {showDelete && <button onClick={() => setDelete(false)}>Done</button>}

            {!edit && !follow.show && <button onClick={followPlaylist}>Follow</button>}

            {!edit && follow.show && <button onClick={unfollowPlaylist}>Following</button>}

            <h2>Playlist Entries</h2>

            {pleCards}
        </React.Fragment>
    )

};



const playlist_id = document.querySelector('#data').dataset.playlist_id;
ReactDOM.render(<Playlist playlist_id={playlist_id} />, document.querySelector('.content'));