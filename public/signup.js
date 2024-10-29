document.getElementById('form').addEventListener('submit', handleSignUp);

function handleSignUp(e)
{
    e.preventDefault();
    const email=document.getElementById('email').value;
    const phone=document.getElementById('phone').value;
    const password=document.getElementById('password').value;
    const name=document.getElementById('name').value;

    //console.log(email+phone+password);
    const user={
        email:email,
        phone:phone,
        password:password,
        name:name
    }
    console.log(user);
    axios.post("http://localhost:5000/user/signup",user)
    .then(r=>{
       console.log(r.data);
        const p=document.getElementById('p');
        p.innerText=r.data.message;
       window.location.href="http://localhost:5000/login.html";
    })
    .catch(e=>{
        const p=document.getElementById('p');
      
        p.innerText=e.data.message;
    })


}