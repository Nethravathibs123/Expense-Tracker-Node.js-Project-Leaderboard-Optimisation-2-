const express=require('express');
const app=express();
const cors=require('cors');

const fs=require('fs');
const path = require('path');

const User=require('./models/user');
const Expense=require('./models/expense')

const userRouter=require('./routes/user')
const expenseRouter=require('./routes/expense')
const sequelize=require('./util/database')

const asscessLogStream=fs.createWriteStream(path.join(__dirname,'access.log'),
{flag:'a'} )

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://cdn.jsdelivr.net;");
    next();
});

app.use(cors());
app.use(express.json());
app.use('/user',userRouter)
app.use('/expense',expenseRouter);

app.use('/', (req, res) => {
    console.log("url" + req.url);

    // Remove query string from the URL
    const url = req.url.split('?')[0];
    console.log(path.join(__dirname, `public${url}`));

    res.sendFile(path.join(__dirname, `public${url}`));
});


User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });



sequelize.sync()    
.then(r=>{
    app.listen(process.env.PORT,()=>{
        console.log("Database is on  And Server is listing on 5000");
    })

})
.catch(e=>{
    
    console.log(e)})