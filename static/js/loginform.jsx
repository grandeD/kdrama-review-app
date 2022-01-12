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
        fetch('/login', {
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
        <form onSubmit={handleSubmit} className='form'>
            {submitted && <p>{message}</p>}
            <h2>Login</h2>

            <label className='input-label'>Username</label>
            <input placeholder='Username' type="text" name="username" value={values.username} onChange={handleInputChange}/>

            <label className='input-label'>Email</label>
            <input placeholder='Email' type="text" name="email" value={values.email} onChange={handleInputChange}/>
 
            <label className='input-label'>Password</label>
            <input placeholder='Password' type="password" name="password" value={values.password} onChange={handleInputChange}/>
   
            <input id='submit-btn' type="submit"/>

            <p>Don't have an Account? <a href='/signup'>Sign Up</a></p>
        </form>
    )
};

ReactDOM.render(<LoginForm/>, document.querySelector('.content'));
