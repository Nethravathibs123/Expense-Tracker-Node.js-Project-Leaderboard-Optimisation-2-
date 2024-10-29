
function handleSubmit(event)
{
    event.preventDefault();
    
    const expenseId = event.target.expenseId.value;
    const expenseAmount=event.target.expenseAmount.value;
    const Description=event.target.Description.value;
    const type=event.target.type.value;

    const expense={
      expenseId:expenseId,
      expenseAmount:expenseAmount,
  Description:Description,
  type:type,
  }

if(expenseId)
{
  const token=localStorage.getItem("jwt")
  axios.put(`http://localhost:5000/expense/${expenseId}`,expense,{headers:{"Authorization":token}})
  .then(r=>{
    window.location.reload();
  })
  .catch(e=>console.log(e))
}
else
{
  const token=localStorage.getItem("jwt")
  axios.post('http://localhost:5000/expense',expense,{headers:{"Authorization":token}})
  .then(r=>{
    id=r.data.id;
    console.log(expenseAmount+"-"+Description+"-"+type+"-"+id);
addExpense(expenseAmount,Description,type,id)
  })
  .catch(e=>console.log(e))
}
clearForm();
window.location.reload();
}

let currentPage = 1;
let limit = localStorage.getItem("rowsPerPage") ? Number(localStorage.getItem("rowsPerPage")) : 5;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem("jwt");

  axios.get("http://localhost:5000/premium/check", { headers: { "Authorization": token } })
    .then(r => {
      // Set the dropdown to the saved limit value
      document.getElementById('rowsPerPage').value = limit;
      fetchData(currentPage, limit);
      fetchDownload();
    }).catch(e => {
      console.log(e.response);
    });
});

function fetchData(page, limit) {
  const token = localStorage.getItem("jwt");

  axios.get(`http://localhost:5000/expense?page=${page}&limit=${limit}`, { headers: { "Authorization": token } })
    .then(r => {
      document.getElementById('addbtn').style.display = 'unset';
      document.getElementById('purchase').style.display = 'unset';
      document.getElementById('rzp-button').style.display = 'none';
      document.getElementById('leaderboard').style.display = 'unset';
      document.getElementById('download').style.display = 'unset';

      const ui = document.getElementById('ui');
      ui.innerHTML = ''; // Clear the table before adding new data

      r.data.expenses.forEach(expense => {
        const { expenseAmount, Description, type, id } = expense;
        addExpense(expenseAmount, Description, type, id);
      });

      // Enable/disable pagination buttons based on the response
      document.getElementById('prev').disabled = !r.data.previous;
      document.getElementById('next').disabled = !r.data.next;
    })
    .catch(e => console.log(e));
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchData(currentPage, limit);
  }
}

function nextPage() {
  currentPage++;
  fetchData(currentPage, limit);
}

function updateRowsPerPage() {
  const rowsPerPage = Number(document.getElementById('rowsPerPage').value);
  localStorage.setItem("rowsPerPage", rowsPerPage);
  limit = rowsPerPage;
  currentPage = 1; // Reset to first page when changing rows per page
  fetchData(currentPage, limit);
}

function addExpense(expenseAmount, Description, type, id) {
  const newTr = document.createElement('tr');
  newTr.id = id;
  newTr.innerHTML = `
    <td>${expenseAmount}</td>
    <td>${Description}</td>
    <td>${type}</td>
    <td><button onclick="handleDelete(${id})">Delete</button></td>
    <td><button onclick="handleEdit('${expenseAmount}', '${Description}', '${type}', ${id})">Edit</button></td>
  `;
  const ui = document.getElementById('ui');
  ui.appendChild(newTr);
}

function fetchDownload() {
  const token = localStorage.getItem("jwt");
  axios.get('http://localhost:5000/expense/getdownload', { headers: { "Authorization": token } })
    .then(r => {
      const ui2 = document.getElementById('ui2');
      ui2.innerHTML = ''; // Clear the history table before adding new data

      r.data.forEach((item, index) => {
        const { link } = item;
        addHistory(index + 1, link);
      });
    })
    .catch(e => console.log(e));
}

function addHistory(sni, Link) {
  const newTr = document.createElement('tr');
  newTr.innerHTML = `
    <td>${sni}</td>
    <td><a href=${Link}>${Link}</td>
  `;
  const ui2 = document.getElementById('ui2');
  ui2.appendChild(newTr);
}

function handleDelete(id)
{
  console.log(id);
  const token=localStorage.getItem("jwt")
axios.delete(`http://localhost:5000/expense/${id}`,{headers:{"Authorization":token}})
.then(r=>{
  console.log(r);
})
.catch(e=>console.log(e))
window.location.reload();
}

function handleEdit(expenseAmount,Description,type,id)
{

  const fexpenseAmount = document.getElementById('expenseAmount');
  const fDescription = document.getElementById('Description');
  const ftype = document.getElementById('type');
  const fexpenseId = document.getElementById('expenseId');

  fexpenseAmount.value = expenseAmount;
  fDescription.value = Description;
  ftype.value = type;
  fexpenseId.value = id;
 

}
function clearForm()
{
  document.getElementById('myForm').reset();
  document.getElementById('expenseId').value = '';

}


function handlePurchase(e)
{
  e.preventDefault();

  const token=localStorage.getItem('jwt');
  if (!token) {
    alert('You need to be logged in to make a purchase');
    return;
    
}
axios.get('http://localhost:5000/premium/premiummembership',{headers:{Authorization:token}})
.then(r=>{

  const orderid = r.data.order.id;
        const key_id = r.data.key_id;
console.log("order id "+orderid);
        var options = {
          "key": key_id,
          "order_id": orderid,
          "handler": function(response) {
            const payment = {
              msg:"sucessfull",
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id
            };
      
            axios.post('http://localhost:5000/premium/premiummembership', payment, { headers: { Authorization: token } })
            .then(res => {
              alert("Payment successful!");
              window.location.reload();
            })
            .catch(err => {
              console.error(err);

              payment.msg='failed'
              axios.post('http://localhost:5000/premium/premiummembership', payment, { headers: { Authorization: token } })
              .then(res => {
                alert("Payment was cancelled. Please try again.");
              })
              .catch(err => {
                console.error(err);
                alert("Payment verification failed, please contact support.");
              });

             
            });
          },
          "modal": {
            "ondismiss": function(response) {
              const payment = {
                msg:"cancel",
             
                orderId: orderid
              };
              axios.post('http://localhost:5000/premium/premiummembership', payment, { headers: { Authorization: token } })
              .then(res => {
                alert("Payment was cancelled. Please try again.");
              })
              .catch(err => {
                console.error(err);
                alert("Payment verification failed, please contact support.");
              });
            
            }
          }
        };

var rzp1=new Razorpay(options);
console.log("in purchase");
rzp1.open();

})
.catch(e=>console.log(e));


}

function showLeaderboard(event)
{
  event.preventDefault();
 
  const token=localStorage.getItem("jwt")
  console.log("hiii in learder");
 
  axios.get('http://localhost:5000/expense/board',{headers:{"Authorization":token}})
  .then(r=>{

document.getElementById('leader').style.display='unset';
      document.getElementById('ui1').innerHTML='';
 

for( i=0;i<r.data.length;i++)
{
  const {total_cost,name}=r.data[i];
  addBoard(name,total_cost)
} 


  })
  .catch(e=>console.log(e))

}


function addBoard(name,expenseAmount)
{
  const newTr = document.createElement('tr');
 
    newTr.innerHTML = `
    <td>${name}</td>
        <td>${expenseAmount}</td>
 
    `;
    const ui = document.getElementById('ui1');
    ui.appendChild(newTr);

}

async function handleDownload(e) {
  e.preventDefault();

  try {
    const token = localStorage.getItem("jwt");

    const response = await  axios.get('http://localhost:5000/expense/download', {
      headers: { "Authorization": token },
     
    });
    if (response.status !== 200) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const contentDisposition = response.headers['content-disposition'];

    console.log(contentDisposition);
    var a=document.createElement('a');
    a.href=response.data.fileUrl;
    a.download='myexpense.csv';
    a.click(); 
  // window.location.reload();
  } 
  catch (error) {
    console.error("Error during download:", error);
  }
}
