const genres = 
{
    "16": "Animation",
    "18": "Drama",
    "35": "Comedy",
    "37": "Western",
    "80": "Crime",
    "99": "Documentary",
    "9648": "Mystery",
    "10751": "Family",
    "10759": "Action & Adventure",
    "10762": "Kids",
    "10763": "News",
    "10764": "Reality",
    "10765": "Sci-Fi & Fantasy",
    "10766": "Soap",
    "10767": "Talk",
    "10768": "War & Politics"
};

const SignUpForm = () => {
    // 2 steps to sign up, 1: required info  2: profile image and fav genre
    const [step, setStep] = React.useState(1);
    const [message, setMessage] = React.useState(''); // message updates to user

    // true if step1 has been submitted
    const [submitted, setSubmitted] = React.useState(false);
    // values for step1
    const [values, setValues] = React.useState({
        fname: '', lname: '', email: '', username: '',password: ''
    });
    const [unique, setUnique] = React.useState({email: true, username: true});

    const [avatarImg, setAvatar] = React.useState('/static/img/avatars/1.png');
    const [favGenre, setGenre] = React.useState(16);
    const [userId, setId] = React.useState(0);

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
            fetch(`user?${event.target.name}=${event.target.value}`, {
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
        if (values.fname && values.lname && values.email && values.username && values.password) {
            fetch('/user', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            }).then(response => {
                response.json().then(res => {
                    console.log(res)
                    setMessage(`${res.status}: ${res.message}`)
                    if (res.status == 'success') { // step1 successful, set step to 2
                        // store user_id for step2 POST call to update user
                        setId(res.user.user_id)
                        setStep(2);
                    }
                });
            });

        }

    };

    const handleStep2 = () => {
        // updates user stored in userId from step 1, with image_path and fav_genre
        fetch(`/user/${userId}`, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({image_path: avatarImg, fav_genre: favGenre}),
        }).then(response => {
            response.json().then(jsonResponse => {
                console.log(jsonResponse)
                setMessage(`${jsonResponse.status}: ${jsonResponse.message}`)
                if (jsonResponse.status == 'success') {
                    // create account is complete, redirect to login form
                    window.location.replace('/login');
                }
            });
        });

    };

    // options for avatar image select dropdown
    const avatarOptions = [];
    for (let ndx = 1; ndx < 15; ndx++) {
        avatarOptions.push(
        <option key={ndx} value={`/static/img/avatars/${ndx}.png`}>{ndx}</option>);
    }

    // options for favorite genre select dropdown
    const genreOptions = [];
    for (const key of Object.keys(genres)) {
        genreOptions.push(
            <option key={key} value={key}>{genres[key]}</option>);
    }
    return (
        <React.Fragment>
        {submitted && <p>{message}</p>}


        {step === 1 && 
        <form onSubmit={handleSubmit}>

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
        </form>}


        {step === 2 &&
        <div>
            <h3>Select an Avatar</h3>
            <img src={avatarImg} style={{height: '100px'}}></img>
            <select id='avatarSelect' value={avatarImg} onChange={(e) => setAvatar(e.target.value)}>
                {avatarOptions}
            </select>
            <h3>Select your favorite genre</h3>
            <select id='genreSelect' value={favGenre} onChange={(e) => setGenre(e.target.value)}>
                {genreOptions}
            </select>
            <button onClick={handleStep2}>Submit</button>
        </div>

        }

        </React.Fragment>
    )
};

ReactDOM.render(<SignUpForm/>, document.querySelector('.content'));



