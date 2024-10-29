
document.getElementById('loginForm').addEventListener('submit', handleLogin);

function handleLogin(event)
{
    event.preventDefault();

    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;

    const user={
        email:email,
        password:password,
    }
    console.log(user);
    axios.post('http://localhost:5000/user/login',user)
    .then(r=>{
        console.log(r.data.token);
       
        const div=document.getElementById('mydiv');
        div.innerText=r.data.msg;
        localStorage.setItem("jwt",r.data.token);
       window.location.href="http://localhost:5000/expense.html";
    })
    .catch(error=>{
       
        if (error.response) {
          
            const div = document.getElementById('mydiv');
            if (error.response.status === 404) {
                console.log(error.response.data.message);
                div.innerText = error.response.data.message; 
            } else if (error.response.status === 401) {
                console.log(error.response.data.message);
                div.innerText = error.response.data.message; 
            } else {
                console.log(error.response.data.message);
                div.innerText = 'An error occurred';
            }
        } else if (error.request) {
       
            console.log(error.request);
            const div = document.getElementById('mydiv');
            div.innerText = 'No response received from server';
        } else {

            console.log('Error', error.message);
            const div = document.getElementById('mydiv');
            div.innerText = 'An error occurred: ' + error.message;
        }

    });

}
