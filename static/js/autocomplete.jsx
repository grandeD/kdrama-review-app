'use strict';

const Autocomplete = () => {
    const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(-1);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [input, setInput] = React.useState('');
    const [change, setChange] = React.useState(false);

    const handleSubmit = (e) => {
      if (change) e.preventDefault();
    }

    const onChange = (e) => {
        const userInput = e.target.value;
    
        // grabs at most 10 autocomplete results based for user input
        fetch(`/search/autocomplete?search-query=${userInput}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            if (data.status === 'success') setFilteredSuggestions(data.results);
        });

        setInput(e.target.value);
        setActiveSuggestionIndex(-1);
        setShowSuggestions(true);
      };

      const handleClick = (title, kdrama_id) => {
        setFilteredSuggestions([]);
        setInput(title);
        setActiveSuggestionIndex(-1);
        setShowSuggestions(false);
        window.location = `/kdrama/${kdrama_id}`;
      };

      const onKeyDown = (e) => {

        if (e.keyCode === 13) // enter key, user selects input
        {
          if (activeSuggestionIndex > -1) {
            const selected = filteredSuggestions[activeSuggestionIndex];
            setInput(selected.title)
            setChange(true);
            window.location = `/kdrama/${selected.kdrama_id}`;
          }
            setActiveSuggestionIndex(-1);
            setShowSuggestions(false);
        }
        else if (e.keyCode === 38) // up arrow key
        {
            if (activeSuggestionIndex === -1) {
              return;
            }
            setActiveSuggestionIndex(activeSuggestionIndex - 1);

        }
        // User pressed the down arrow, increment the index
        else if (e.keyCode === 40) {
            if (activeSuggestionIndex - 1 === filteredSuggestions.length) {
                return;
            }
            setActiveSuggestionIndex(activeSuggestionIndex + 1);
        }
      }

    const autocompleteItems = filteredSuggestions.map((suggestion, index) => {
        let className;
        // Flag the active suggestion with a class
        if (index === activeSuggestionIndex) {
          className = "autocomplete-active";
        }
        return (
          <div  className={className} key={suggestion.kdrama_id} 
                onClick={() => handleClick(suggestion.title, suggestion.kdrama_id)}>
            {suggestion.title}
          </div>
        );
      });

    return (
        <form action="/search" autoComplete='off' onSubmit={handleSubmit}>
            <div className='autocomplete'>
            <input  type="text" 
                    placeholder="Search for a Korean Drama.." 
                    name="search-query"
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    value={input}
                    />
                {showSuggestions && input && 
                    <div className='autocomplete-items'>
                        {autocompleteItems}
                    </div>}
            </div>
        <button type="submit"><i className="fa fa-search"></i></button>
        </form>
    );
}

ReactDOM.render(<Autocomplete/>, document.querySelector('.search-container'));