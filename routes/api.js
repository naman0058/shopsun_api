var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')

var crypto    = require('crypto');


var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;


router.get('/brands',(req,res)=>{
    pool.query(`select * from brands`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })


  router.get('/category',(req,res)=>{
    pool.query(`select * from categories`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })


  router.get('/subcategory',(req,res)=>{
    pool.query(`select * from sub_categories where category_id = '${req.query.id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })


  router.get('/products',(req,res)=>{
    pool.query(`select p.* ,
  (select c.quantity from carts c where c.product_id = p.id and c.user_id = '${req.query.user_id}'  ) as userquantity
   from products p where sub_category_id = '${req.query.id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })

  

  router.get('/myproduct',(req,res)=>{
    pool.query(`select u.* , 
    (select w.payment_method from wallets w where w.id = u.wallet_id ) as payment_method_detail
    from users_wallet u where u.user_id = '${req.query.user_id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })


  router.get('/single-product',(req,res)=>{
    pool.query(`select * from wallets where id = '${req.query.id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })



  
router.get('/get-address',(req,res)=>{
  pool.query(`select * from address where user_id = '${req.query.user_id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
  })
})



router.post('/save-address',(req,res)=>{
  let body = req.body;
  console.log('body h',req.body)
  pool.query(`insert into address set ?`,body,(err,result)=>{
      if(err) throw err;
      else res.json({
          msg : 'success'
      })
  })
})




router.get('/delete-address',(req,res)=>{
  pool.query(`delete from address where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else res.json({msg:'success'})
  })
})



router.get('/get-single-address',(req,res)=>{
  pool.query(`select * from address where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})




router.post('/update-address', (req, res) => {
  console.log('data',req.body)
  pool.query(`update address set ? where id = ?`, [req.body, req.body.id], (err, result) => {
      if(err) {
          res.json({
              status:500,
              type : 'error',
              description:err
          })
      }
      else {
          res.json({
              status:200,
              type : 'success',
              description:'successfully update'
          })

          
      }
  })
})




router.get('/get-single-profile',(req,res)=>{
  pool.query(`select * from users where id = '${req.query.user_id}'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})




router.post('/update-profile', (req, res) => {
  console.log(req.body)
  pool.query(`update users set ? where id = ?`, [req.body, req.body.id], (err, result) => {
      if(err) {
          res.json({
              status:500,
              type : 'error',
              description:err
          })
      }
      else {
          res.json({
              status:200,
              type : 'success',
              description:'successfully update'
          })

          
      }
  })
})



router.post('/request',function(req, res, next){

	var postData = {
        "appId" : '104544c31bfc16b6c043727605445401',
		"orderId" : req.body.orderId,
		"orderAmount" : req.body.orderAmount,
		"orderCurrency" : 'INR',
		"orderNote" : req.body.orderNote,
		'customerName' : req.body.customerName,
		"customerEmail" : req.body.customerEmail,
		"customerPhone" : req.body.customerPhone,
		"returnUrl" : 'http://kh10nonvegworld.com/checking',
		"notifyUrl" :'http://kh10nonvegworld.com/checking'
	},
	mode = "PROD",
	secretKey = "0ffa4b4850db25a28e732d34e288aa8034a90ff6",
	sortedkeys = Object.keys(postData),
	url="",
	signatureData = "";
	sortedkeys.sort();
	for (var i = 0; i < sortedkeys.length; i++) {
		k = sortedkeys[i];
		signatureData += k + postData[k];
	}
	var signature = crypto.createHmac('sha256',secretKey).update(signatureData).digest('base64');
	postData['signature'] = signature;
	if (mode == "PROD") {
	  url = "https://www.cashfree.com/checkout/post/submit";
	} else {
	  url = "https://test.cashfree.com/billpay/checkout/post/submit";
	}


    res.json(postData)

	//res.render('request',{postData : JSON.stringify(postData),url : url});
});


router.get('/request',(req,res)=>{
   // res.json(req.query.postData)
   let query = JSON.parse(req.query.postData)
    res.render('request',{postData:query})
})


router.post('/response',function(req, res, next){

	var postData = {
	  "orderId" : req.body.orderId,
	  "orderAmount" : req.body.orderAmount,
	  "referenceId" : req.body.referenceId,
	  "txStatus" : req.body.txStatus,
	  "paymentMode" : req.body.paymentMode,
	  "txMsg" : req.body.txMsg,
	  "txTime" : req.body.txTime
	 },
	secretKey = "0ffa4b4850db25a28e732d34e288aa8034a90ff6",

	signatureData = "";
	for (var key in postData) {
		signatureData +=  postData[key];
	}
	var computedsignature = crypto.createHmac('sha256',secretKey).update(signatureData).digest('base64');
	postData['signature'] = req.body.signature;
	postData['computedsignature'] = computedsignature;
	res.render('response',{postData : JSON.stringify(postData)});
});



module.exports = router;