'use strict';

// const sort_by = ['popularity.desc', 'popularity.asc','first_air_date.desc', 'first_air_date.asc' ];
const sort_by = [
{val: 'popularity.desc', display_val: 'Popularity Descending'}, 
{val: 'popularity.asc', display_val: 'Popularity Ascending'},
{val: 'first_air_date.desc', display_val: 'Newest First'}, 
{val: 'first_air_date.asc', display_val: 'Oldest First'}];

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

const Discover = (props) => {
    const [sortedDramas, setDramas] = React.useState([]);
    const [sort_value, setSortVal] = React.useState(sort_by[0]); // value page is currently sorted by
    // value of each genre_id is a boolean of whether it is currently selected
    const [genre_options, setGenOptions] = React.useState({}); 
    const [genres, setGenres] = React.useState({}); // genre_id: genre_name
    const [loaded, setLoaded] = React.useState(false);
    const [page, setPage] = React.useState({
        currentPage: 1, totalResults: 0, totalPages: 1
    });
    const [pageButtons, setPageButtons] = React.useState ({increment: false, decrement: true})

    const genre_string = () => {
        let true_keys = Object.keys(genre_options).filter(k => genre_options[k]);
        return true_keys.join(',');
    }

    const get_sorted_results = (sort_by, with_genres, currentPage=1) => {
        // Gets korean dramas from TMDB API based on given page number, how to sort and 
        // which genres the user wants 

        fetch('https://api.themoviedb.org/3/discover/tv?' + new URLSearchParams(
            {
                'api_key': props.api_key,
                'language': 'en-US',
                'sort_by': sort_by,
                'with_original_language': 'ko',
                'with_genres': with_genres,
                'page': currentPage
            }))
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    setDramas(data['results']);
                    setPage({   currentPage: currentPage, 
                                totalResults: data['total_results'], 
                                totalPages: data['total_pages'] });
                    handlePageButtons(currentPage, data['total_pages']);
                });
    };

    React.useEffect(() => {
        // get filtered results based on default values from the state
        get_sorted_results(sort_value, genre_string());
        // Gets TV drama genres from TMDB API -> 
        fetch('https://api.themoviedb.org/3/genre/tv/list?' + new URLSearchParams(
        {'api_key': props.api_key, 'language': 'en-US', }))
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // set genre object with values in the form genre_id : genre_name
                const gens = data.genres.reduce((gens, gen) => {
                    return {...gens, [gen.id]: gen.name} }, {});
                console.log(gens);
                setGenres(gens);
                // set genre_options object with values in the form genre_id : boolean
                const gen_ops = Object.keys(gens).reduce((gen_ops, g_id) => {
                    return {...gen_ops, [g_id]: false} }, {});
                setGenOptions(gen_ops); 
                setLoaded(true);
            }); 
            
    }, []);

    const handlePageButtons = (currentPage, totalPages) => {
        // given the current page and total pages, assign boolean 
        // if pagination button needs to be disabled
        let increment = false; let decrement = false;
        if (currentPage === totalPages) increment = true;
        else if (currentPage === 1) decrement = true;
        setPageButtons({increment: increment, decrement: decrement});
    };

    const handlePagination = (e) => { // updates currentPage based on increment/decrement button click
        let new_page = page.currentPage;
        if (e.target.name === 'increment') new_page += 1;
        else new_page -= 1;
        setPage((page) => ({...page,   ['currentPage']: new_page }));
        handlePageButtons(new_page, page.totalPages);
        get_sorted_results(sort_value, genre_string(), new_page);

        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    };


    const updateSortValue = (e) => { 
        // updates the sort value and filtered results in the state
        // based on the selected option value
        setSortVal(e.target.value);
        get_sorted_results(e.target.value, genre_string());
    };

    const updateGenreOptions = (e) => {
        // updates the boolean of the genre button clicked in genre_options state object
        // and the new filtered results based on the change
        if (genre_options[e.target.name]) genre_options[e.target.name] = false;
        else genre_options[e.target.name] = true;
        get_sorted_results(sort_value, genre_string());
    }

    // creates and stores filtered korean dramas as KdramaCards in kdramaCards
    const kdramaCards = [];
    for (const kdrama of sortedDramas) {
        let poster_path = '/static/img/placeholder-image.png';
        // handles default poster if drama does not have image
        if (kdrama.poster_path !== null)
            poster_path = `https://image.tmdb.org/t/p/original/${kdrama.poster_path}`;
        kdramaCards.push(
            <KdramaCard
            key={kdrama.id}
            kdrama_id={kdrama.id} 
            poster_path={poster_path}
            title={kdrama.name}
            />
        );
    }

    // Creates buttons of all genres where the button name = genre_id
    // and the value shown on the button is the genre name
    // class on or off is assigned based on the genre_options boolean value
    const genreButtons = [];
    for (const [g_id, on_off] of Object.entries(genre_options) ) {
        genreButtons.push(
            <button key={g_id} name={g_id} onClick={updateGenreOptions}
            className={on_off ? 'on' : 'off'} id='genre'>
                {genres[g_id]}</button>
        );
        
    }

    // create options for each value of the sort_by array for a select element
    const sortSelect = [];
    for (const ndx in sort_by) {
        sortSelect.push(<option key={ndx} value={sort_by[ndx].val}>
        {sort_by[ndx].display_val}</option>)
    }

    return (
        <div style={{padding: '0 2em', margin: '0 0 3em'}}>
            <h2>Discover</h2>
            <div className='flex-gap' style={{padding: '0 1em 2em'}}>
                {genreButtons}
            </div>
            <div className='flex-gap-1em'>
                <select id='sortSelect' value={sort_value} onChange={updateSortValue}> 
                    {sortSelect}
                </select>
                {page.totalResults > 0 &&
                <h4 className="grey-400">Page {page.currentPage} of {page.totalPages}</h4> }
            </div>

            
            <div className='flex-gap' style={{margin: '1em 0 2em'}}>
                {kdramaCards}</div>
            {(sortedDramas.length === 0 && loaded) ? 
            <h2>No results :( Try changing filter options</h2>
            :  <div>
                    <h3>{page.totalResults} results found</h3>
                    <h4 className="grey-400">Page {page.currentPage} of {page.totalPages}</h4> 
                    <div className="pagination">
                        <button name='decrement' onClick={handlePagination}
                        disabled={pageButtons.decrement}>❮</button>
                        <button name='increment' onClick={handlePagination}
                        disabled={pageButtons.increment}>❯</button>
                    </div>
                </div>}
        </div>
    );

};

const api_key = document.querySelector('#data').dataset.api_key;
ReactDOM.render(<Discover api_key={api_key}/>, document.querySelector('.content'));