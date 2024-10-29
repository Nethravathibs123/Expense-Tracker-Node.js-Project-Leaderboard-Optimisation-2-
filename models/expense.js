const Sequelize=require('sequelize');
const sequelize=require('../util/database')

const Expense=sequelize.define('expenses',{

    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
       allowNull:false,
       primaryKey:true        
    },
    expenseAmount:{
        type:Sequelize.BIGINT,
        allowNull:true
    },
    Description:{
        type:Sequelize.STRING,
        allowNull:false

    },
    type:{
        type:Sequelize.ENUM,
        values:['Food','Movie','Pertol','Bills'],
        allowNull:false
    }
})

module.exports=Expense