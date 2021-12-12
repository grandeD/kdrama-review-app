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


const SignUpForm = () => {
    const [values, setValues] = React.useState({
        fname: '', lname: '', email: '', username: '',password: ''
    });

    const [submitted, setSubmitted] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [unique, setUnique] = React.useState({email: true, username: true});

    const handleInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            [event.target.name]: event.target.value,
        }));
    };

    const handleUniqueInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            [event.target.name]: event.target.value,
        }));

        if (values[event.target.name])
        {
            fetch(`get-user-id.json?${event.target.name}=${event.target.value}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                },
            }).then(response => {
                response.json().then(res => {
                    let unique_val = true;
                    if (res.user_id) {
                        unique_val = false;
                    } 
                    setUnique((unique) => ({
                        ...unique,
                        [event.target.name]: unique_val,
                    }));

                });
            });
        }


    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);
        if(values.fname && values.lname && values.email && values.username && values.password) {
            fetch('/create-user.json', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            }).then(response => {
                response.json().then(jsonResponse => {
                    console.log(jsonResponse)
  
                    setMessage(`${jsonResponse.status}: ${jsonResponse.message}`)
                });
            });

        }

    };


    return (
        <form onSubmit={handleSubmit}>
            {submitted && <p>{message}</p>}
            <h2>Create an Account</h2>

            <input placeholder='First Name' type="text" name="fname" value={values.fname} onChange={handleInputChange}/>

            <input placeholder='Last Name' type="text" name="lname" value={values.lname} onChange={handleInputChange}/>
            {submitted && !values.fname && <span className='field-error'>Please enter a first name</span>}
            {submitted && !values.lname && <span className='field-error'>Please enter a last name</span>}
            <p> 
                <input placeholder='Username' type="text" name="username" value={values.username} onChange={handleUniqueInputChange}/>
                {submitted && !values.username && <span className='field-error'>Please enter a username</span>}
                {!unique.username && <span className='field-error'>Please enter a unique username</span>}
            </p>
            <p> 
                <input placeholder='Email' type="text" name="email" value={values.email} onChange={handleUniqueInputChange}/>
                {submitted && !values.email && <span className='field-error'>Please enter an email</span>}
                {!unique.email && <span className='field-error'>Account for this email already exists</span>}
            </p>
            <p>
                <input placeholder='Password' type="password" name="password" value={values.password} onChange={handleInputChange}/>
                {submitted && !values.password && <span className='field-error'>Please enter a password</span>}
            </p>
            <p>
                <input type="submit"/>
            </p>
        </form>
    )
};



const ShowForms = (props) => {
    const [showLogin, setShowLogin] = React.useState(false);
    const [switchButton, setSwitch] = React.useState('Login');

    const handleSwitch = () => {
        if (showLogin) {
            setShowLogin(false);
            setSwitch('Login');
        } else {
            setShowLogin(true);
            setSwitch('Create Account');
        }
    }

    return (
    <div> 
        {showLogin === false &&  <SignUpForm />}
        {showLogin && <LoginForm />}
        <button type="button"  onClick={handleSwitch}>
            {switchButton}
        </button>
    </div>

    );
}

ReactDOM.render(<ShowForms/>, document.querySelector('.content'));
