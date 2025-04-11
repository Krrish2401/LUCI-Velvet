export const checkAuth = async(req,res)=>{
    try{
        const res = await fetch('http://localhost:5000/api/user/check-auth',{
            credentials: 'include'
        });
        return res.ok;
    }
    catch(error){
        console.error('Auth failed',error);
        return false;
    }
};