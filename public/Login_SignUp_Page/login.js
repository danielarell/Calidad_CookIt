
const sign_in_btn = document.querySelector('#Log-in-btn');
const sign_up_btn = document.querySelector('#sign-up-btn');
const container = document.querySelector('.container');
const sign_in_btn2 = document.querySelector('#Log-in-btn2');
const sign_up_btn2 = document.querySelector('#sign-up-btn2');
sign_up_btn.addEventListener('click', () => {
    container.classList.add('sign-up-mode');
});
sign_in_btn.addEventListener('click', () => {
    container.classList.remove('sign-up-mode');
});
sign_up_btn2.addEventListener('click', () => {
    container.classList.add('sign-up-mode2');
});
sign_in_btn2.addEventListener('click', () => {
    container.classList.remove('sign-up-mode2');
});



// eslint-disable-next-line no-unused-vars
async function login(){
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('password').value;

    console.log({email: email, pass: password});

    let userData = {email, password};

    let resp = await fetch('/api/auth/login2',{
        method :'POST',
        headers:{
            'content-type': 'Application/json'
        },
        body: JSON.stringify(userData)
    });

    console.log(resp.status);
    let data = await resp.json();
    //console.log(data);

   if(data.error)
   {
        Swal.fire('Error', data.error , 'error');
        return;
   }

    sessionStorage.setItem('token', data.token);

    window.location.href = '../index.html';
}

// eslint-disable-next-line no-unused-vars
async function signUp(){
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('sign_email').value;
    const password = document.getElementById('sign_password').value;
    const country = document.getElementById('country').value;

    let userData = {username, name, email, password, country};

    console.log(userData);

    let resp = await fetch('/api/users',{
        method :'POST',
        headers:{
            'content-type': 'Application/json'
        },
        body: JSON.stringify(userData)
    });

    console.log(resp.status);
    let data = await resp.json();
    console.log(data);

    sessionStorage.setItem('token', data.token);

    window.location.href = '../index.html';
}
