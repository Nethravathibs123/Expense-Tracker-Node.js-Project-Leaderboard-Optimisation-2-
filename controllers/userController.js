
const userService=require('../services/userService')

module.exports.postUser=async (req,res,next)=>{

    const result=await userService.createUser(req);

    return res.status(result.status).json({ message: result.message, error: result.error });
   
}

module.exports.loginUser=async(req,res,next)=>{
   
    const { email, password } = req.body;
   

    const result = await userService.loginUser(email, password);
console.log('in controller '+ result.message+" "+result.error);
    return res.status(result.status).json({ message: result.message, token: result.token, error: result.error });
};