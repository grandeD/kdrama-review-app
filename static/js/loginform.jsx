const LoginForm = () => {
    const [values, setValues] = React.useState({
        email: '', username: '',password: ''
    });

    const [submitted, setSubmitted] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            [event.target.name]: event.target.value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        fetch('/login.json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
          }).then(response => {
            response.json().then(jsonResponse => {
                console.log(jsonResponse)
                setSubmitted(true);
                setMessage(`${jsonResponse.status}: ${jsonResponse.message}`)
                if (jsonResponse.status === 'success'){
                    window.location = '/';
                }
            });
          });

    };
    
    return (
        <form onSubmit={handleSubmit}>
            {submitted && <p>{message}</p>}
            <h2>Login</h2>
            <p> 
                <input placeholder='Username' type="text" name="username" value={values.username} onChange={handleInputChange}/>
            </p>
            <span>or</span>
            <p> 
                <input placeholder='Email' type="text" name="email" value={values.email} onChange={handleInputChange}/>
            </p>
            <p>
                <input placeholder='Password' type="password" name="password" value={values.password} onChange={handleInputChange}/>
            </p>
            <p>
                <input type="submit"/>
            </p>
        </form>
    )
};

ReactDOM.render(<LoginForm/>, document.querySelector('.content'));
