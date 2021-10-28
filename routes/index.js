var express = require('express');
var router = express.Router();
var pool = require('./pool')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/admin/login',(req,res)=>{
  res.render('admin-login',{msg:''})
})



router.post('/admin/login/verification',(req,res)=>{
  console.log('dshj',req.body)
pool.query(`select * from admin where email = '${req.body.email}' and password =${req.body.password}`,(err,result)=>{
  if(err) throw err;
  else if(result[0]){

         req.session.propertyadmin = result[0].id;
         res.redirect('/admin')
  }
  else{
    res.render('admin-login',{msg:'Invalid Credentials'})
  }
})
})



router.get('/logout',(req,res)=>{
  req.session.propertyadmin = null;
  res.redirect('/admin/login')
})


router.get('/admin',(req,res)=>{
  if(req.session.propertyadmin){
    pool.query(`select e.* , (select p.name from partner p where p.id = e.vendorid) as partnername from enquiry e order by id desc limit 20`,(err,result)=>{
      if(err) throw err;
      else res.render('admin',{result})
    })
  }
  else{
    res.render('admin-login',{msg:'Invalid Credentials'})

  }
  
})




router.get('/partner',(req,res)=>{
  if(req.session.propertyadmin){
    res.render('partner')

  }
  else{
    res.render('admin-login',{msg:'Invalid Credentials'})
  }
})



router.post('/partner/insert',(req,res)=>{
	let body = req.body
	console.log(req.body)
	pool.query(`insert into partner set ?`,body,(err,result)=>{
		if(err) throw err;
		else res.json({
			status:200
		})
	})
})



router.get('/partner/show',(req,res)=>{
	pool.query(`select * from partner`,(err,result)=>{
		err ? console.log(err) : res.json(result)
	})
})



router.get('/partner/delete', (req, res) => {
    const { id } = req.query
    pool.query(`delete from partner where id = ${id}`, (err, result) => {
        if(err) throw err;
        else res.json(result);
    })
})

router.post('/partner/update', (req, res) => {
    console.log(req.body)
    pool.query(`update partner set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) throw err;
        else res.json(result);
    })
})




router.get('/all-enquiry',(req,res)=>{
  pool.query(`select e.* , (select p.name from partner p where p.id = e.vendorid) as partnername from enquiry e order by id desc`,(err,result)=>{
    if(err) throw err;
    else res.render('show_enquiry',{result:result})
  })
})

// /partner-enquiry


router.get('/partner-enquiry',(req,res)=>{
  pool.query(`select e.* , (select p.name from partner p where p.id = e.vendorid) as partnername from enquiry e
              where vendorid = '${req.query.id}' order by id desc`,(err,result)=>{
    if(err) throw err;
    else res.render('show_enquiry',{result:result})
    // else res.json(result)
  })
})


// router.get('/all-enquiry',(re,res)=>{
//   pool.query(`select e.* , (select p.name from partner p where p.id = e.vendorid) as partnername from enquiry e order by id desc`,(err,result)=>{
//     if(err) throw err;
//     else res.render('show_enquiry',{result:result})
//   })
// })





router.get('/partner/login',(req,res)=>{
  res.render('partner-login',{msg:''})
})



router.post('/partner/login/verification',(req,res)=>{
  console.log('dshj',req.body)
pool.query(`select * from partner where number = '${req.body.number}' and password =${req.body.password}`,(err,result)=>{
  if(err) throw err;
  else if(result[0]){

         req.session.partner = result[0].id;
         res.redirect('/enquiry')
  }
  else{
    res.render('partner-login',{msg:'Invalid Credentials'})
  }
})
})




router.get('/enquiry',(req,res)=>{
  if(req.session.partner){
    res.render('enquiry',{msg:''})

  }
  else{
    res.render('partner-login',{msg:'Invalid Credentials'})

  }
})




router.post('/enquiry-submit',(req,res)=>{
  let body = req.body;
  body['vendorid'] = req.session.partner
  pool.query(`insert into enquiry set ?`,body,(err,result)=>{
    if(err) throw err;
    // else res.render('enquiry',{msg:'Successfully Submitted'})
    else res.redirect('/enquiry')
  })
})


module.exports = router;
