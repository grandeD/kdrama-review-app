'use strict';

// Card view component of a specific korean drama
const KdramaCard = (props) => {
    return(
    <div className='card'>
        <a href={`/kdrama/${props.kdrama_id}`}>
        <div className='kdrama-img'>
            <img style={{width: '100%'}}
        src={props.poster_path} 
        alt='Kdrama Poster' />
        </div>
        <p>{props.title}</p>
        </a>
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
        fetch(`/playlist?playlist_id=${props.playlist_id}`)
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
        fetch(`/playlist/${props.playlist_id}/follow`)
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
        fetch(`/playlist/entry/${playlist_entry_id}`, {
            method: 'DELETE',
            headers: {
            'Content-Type': 'application/json',
            },
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
        // PUT call to flask server to update playlist
        fetch(`/playlist/${props.playlist_id}`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateInfo)
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
        fetch(`/playlist/${props.playlist_id}/follow`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
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
        // POST call to flask server to unfollow playlist
        fetch(`/playlist/follow/${follow.id}`, {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json',
            },
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
        if (entry.poster_path !== null && entry.poster_path !== '')
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
        <div style={{padding: '0 2em 4em', display: "flex", flexDirection:'column'}}>
            <div className='flex-gap'>
                <h1>{playlistInfo.title}</h1>
                {!modal && edit && 
                <button onClick={() => setModal(true)}
                        className='edit-btn'>Edit Info</button>}
            </div>

            <div className='flex-gap'>

                {!edit && !follow.show && <button onClick={followPlaylist}
                                                    className='edit-btn'>Follow</button>}

                {!edit && follow.show && <button onClick={unfollowPlaylist}
                                                className='edit-btn'>Following</button>}

                <h3>{playlistInfo.followers} {playlistInfo.followers === 1 ? ' follower' : ' followers'}</h3>

            </div>

            <h3>Total: {playlistInfo.amount} {playlistInfo.amount === 1 ? ' kdrama' : ' kdramas'}</h3>
  
            {playlistInfo.content !== '' && <p><strong>Description:</strong> {playlistInfo.content}</p>}

            {!edit && <div>
                <h3>Created by </h3>
                <a className='flex-gap-1em' href={`/profile/${playlistInfo.user_id}`}>
                    <div  className='avatar sm' >
                        <img id='avatar-img' src={playlistInfo.image_path}/> </div>
                    <p className='dark'>{playlistInfo.username}</p> 
                </a> 
            </div>}

            

            { modal &&
            <div className='modal'>
                <section className='modal-main'>
                <div className='modal-close'>
                <button onClick={closeModal}><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={updatePlaylistInfo} id='pl-info-form'>
                    <label>Playlist Title:</label>
                    <input type='text' value={updateInfo.title} name='title' onChange={handleInputChange}/>

                    <label htmlFor='text-review'>Enter a description (optional): </label>
                    <textarea id='text-review' name='content' value={updateInfo.content} onChange={handleInputChange}> </textarea>
                    
                    <button type="submit"   className='edit-btn'
                                            style={{alignSelf: 'flex-end'}}>Update</button>
                </form>
                </section>
            </div> }

            <div className='flex-gap'>
                <h2>Playlist Entries</h2>
                {!showDelete && edit && <button onClick={() => setDelete(true)}
                                                className='edit-btn'>Edit</button>}
                {showDelete && <button onClick={() => setDelete(false)}
                                                className='edit-btn done'>Done</button>}
            </div>

            <div className='flex-gap' style={{margin: '1em 0 2em'}}>
                {pleCards}
            </div>
        </div>
    )

};



const playlist_id = document.querySelector('#data').dataset.playlist_id;
ReactDOM.render(<Playlist playlist_id={playlist_id} />, document.querySelector('.content'));