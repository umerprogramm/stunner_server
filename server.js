const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express()
const CryptoJS = require("crypto-js");
const port = 5000
const cors = require("cors");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const {MongoClient} = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.set('strictQuery', false);

const uri = process.env.URI
const client = new MongoClient(uri)
async function DatabaseConnect(){
  
  try{
    client.connect()
    console.log("mongodb has been connceted");
  }
  catch(e){
    console.log(e)
  }

}
DatabaseConnect()



app.post('/register',cors(corsOptions) ,async (req, res) => {
   
    
   
    const db = client.db('commerce') 
    const collection =  db.collection("users")   
    const email = await collection.findOne({ email:  req.body.email})
    console.log(email)
      if(email){
     res.status(200).json({status : false})
   }else{

      const password = CryptoJS.AES.encrypt(JSON.stringify(req.body.pass), process.env.KEY).toString()
      const user =  {
        first_name: req.body.fname,
        last_name: req.body.lname,
        email: req.body.email,
        password: password, 
        otp : null,
        login_status : false
      };
      const add_user = await collection.insertOne(user)
      res.send(add_user)
      
    
    }
})

app.post('/login',cors(corsOptions),async(req,res)=>{
  
  const db = client.db('commerce') 
    const collection =  db.collection("users")   
    const email = await collection.findOne({ email:  req.body.email})
  try{
    if(email){
      let bytes  = CryptoJS.AES.decrypt(email.password, '@yutslh1267tfriifksoit546^&83');
      let pass = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      console.log(pass);
      if(pass === req.body.pass){
        res.status(200).json({login : true})  
        collection.updateOne({ email: req.body.email  }, { $set: { login_status : true } });  
 
      }else{
        res.status(200).json({login : false})

      }

    }else{
      res.status(200).json({login : false})

    }
      
  }catch(error){
    console.log(error.message)
    res.status(200).json({login : false})

  }
})

app.post('/mail', cors(corsOptions),async (req , res)=>{
  const db = client.db('commerce') 
    const collection =  db.collection("users")   
    const email = await collection.findOne({ email:  req.body.email})
  
  try{
    console.log(email.email)
    const ottp = Math.floor(Math.random() * 10000) + 1
    if (email.email) {
      
    const inserted_ottp =   await collection.updateOne({ email: req.body.email  }, { $set: { otp : ottp } });
        let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'umerprogrammer@gmail.com',
      pass: 'hubv rmvg vatf nqdz'
    }
  });
  let mailOptions = {
    from: 'umerprogrammer@gmail.com',
    to: email.email,
    subject: 'Test email using nodemailer',
    html: `<h1  style="color : red ;">This is your verification code ${ottp}</h1>`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(200).json({login : false})
    } else {
      res.status(200).json({login : true})
    }
  });
    }else{
      res.status(200).json({login : false})
    }
    


  }catch(error){
    console.log(error.message)
    res.status(200).json({login : false})

  }



})
app.post('/verification', cors(corsOptions),async (req,res)=>{

  try{
    const db = client.db('commerce') 
    const collection =  db.collection("users")   
    const email = await collection.findOne({ email:  req.body.email})
    console.log("Db otp:",email.otp)
    console.log("user otp:",req.body.otp)
    console.log(email.otp == req.body.otp)
    if(email.otp == req.body.otp ){
      res.status(200).json({status : true })
    }else{
      res.status(200).json({status : false })

    }


  }catch(error){
    console.log(error.message)
    res.status(200).json({login : false})

  }

})

app.post('/check_login' ,cors(corsOptions),async (req , res)=>{
  const db = client.db('commerce') 
  const collection =  db.collection("users")
  const result = await collection.findOne({ email:  req.body.email})
  res.send({status : result.login_status})


})

app.post('/reset_pass',cors(corsOptions),async (req , res)=>{
  const db = client.db('commerce') 
  const collection =  db.collection("users")   
  const email = await collection.findOne({ email:  req.body.email})
    if(email.email){
      const passward = CryptoJS.AES.encrypt(JSON.stringify(req.body.pass), '@yutslh1267tfriifksoit546^&83').toString()
      console.log(passward)
      const collection = client.db("commerce").collection("users");
      collection.updateOne({ email: req.body.email  }, { $set: { password : passward } });  
      res.status(200).json({res : true})
    }else{
      res.status(200).json({res : false})
    }

 
  
})
app.post('/logout',cors(corsOptions),async (req , res)=>{
  const db = client.db('commerce') 
  const collection =  db.collection("users")   
  const email = await collection.findOne({ email:  req.body.email})
  collection.updateOne({ email: req.body.email  }, { $set: { login_status : false } });  


    

 
  
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
  
