'use strict';

const Autocomplete = () => {
    const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(0);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [input, setInput] = React.useState('');

    const onChange = (e) => {
        const userInput = e.target.value;
    
        // grabs at most 10 autocomplete results based for user input
        fetch(`/search/autocomplete?search-query=${userInput}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') setFilteredSuggestions(data.results);
        });

        setInput(e.target.value);
        setActiveSuggestionIndex(0);
        setShowSuggestions(true);
      };

      const onClick = (e) => {
        console.log(e.target.key);
        setFilteredSuggestions([]);
        setInput(e.target.key);
        setActiveSuggestionIndex(0);
        setShowSuggestions(false);
      };

      const onKeyDown = (e) => {

        if (e.keyCode === 13) // enter key, user selects input
        {
            setActiveSuggestionIndex(0);
            setShowSuggestions(false);
            setInput(filteredSuggestions[activeSuggestionIndex])
        }
        else if (e.keyCode === 38) // up arrow key
        {
            if (activeSuggestionIndex === 0) {
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
          <div className={className} key={suggestion} onClick={(suggestion) => onClick(suggestion)}>
            {suggestion}
          </div>
        );
      });

    return (
        <form action="/search" autoComplete='off'>
            <div className='autocomplete'>
            <input  type="text" 
                    placeholder="Search for a Korean Drama.." 
                    name="search-query"
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    value={input}
                    onBlur={()=>setShowSuggestions(false)}
                    onClick={()=>setShowSuggestions(true)}
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