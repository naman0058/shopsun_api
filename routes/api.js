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



  router.get('/products-detail',(req,res)=>{
    pool.query(`select p.* ,
  (select c.quantity from carts c where c.product_id = p.id and c.user_id = '${req.query.user_id}'  ) as userquantity
   from products p where id = '${req.query.id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })

  

  router.get('/myproduct',(req,res)=>{
    pool.query(`select u.* , 
    (select w.payment_method from wallets w where w.id = u.wallet_id ) as payment_method_detail,
    (select w.amount from wallets w where w.id = u.wallet_id ) as product_amount,
    (select w.quantity from wallets w where w.id = u.wallet_id ) as product_quantity,
    (select w.created_at from wallets w where w.id = u.wallet_id ) as product_date,
   (select p.productname from products p where p.id  = (select w.product_id from wallets w where w.id = u.wallet_id) ) as productname,
    (select p.image from products p where p.id  = (select w.product_id from wallets w where w.id = u.wallet_id) ) as productimage,
    (select p.rating from product_user_ratings p where p.product_id  = (select w.product_id from wallets w where w.id = u.wallet_id ) ) as productrating
    from users_wallet u where u.user_id = '${req.query.user_id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })


  router.get('/single-product',(req,res)=>{
    pool.query(`select w.*,
    (select p.productname from products p where p.id  = w.product_id ) as productname,
    (select p.image from products p where p.id  = w.product_id ) as productimage,
    (select r.rating from product_user_ratings r where r.id = w.wallet_id) as productrating
    from wallets w where w.id = '${req.query.id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })


  router.get('/brand-product',(req,res)=>{
    pool.query(`select p.* ,
    (select c.quantity from carts c where c.product_id = p.id and c.user_id = '${req.query.user_id}'  ) as userquantity
     from products p where brand_id = '${req.query.id}'`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
     })
  })


  router.get('/sliders',(req,res)=>{
    pool.query(`select * from sliders order by id desc`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })


  router.get('/search',(req,res)=>{
    pool.query(`select p.* ,
    (select c.quantity from carts c where c.product_id = p.id and c.user_id = '${req.query.user_id}'  ) as userquantity
     from products p where keyword Like '%${req.query.search}%'`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})


router.post('/add-review',(req,res)=>{
  let body = req.body;
  pool.query(`insert into product_user_ratings set ?`,body,(err,result)=>{
    if(err) throw err;
    else res.json({
      msg : 'success'
    })
  })
})



router.get('/all-review',(req,res)=>{
  pool.query(`select r.* ,
              (select u.name from users u where u.id = r.user_id) as username
              from product_user_ratings r where product_id = '${req.query.product_id}' order by id desc`,(err,result)=>{
                if(err) throw err;
                else res.json(result);
              })
})



router.post("/cart-handler", (req, res) => {
  let body = req.body
  console.log(req.body)
  if (req.body.quantity == "0" || req.body.quantity == 0) {
  pool.query(`delete from carts where product_id = '${req.body.product_id}' and  user_id = '${req.body.user_id}'`,(err,result)=>{
      if (err) throw err;
      else {
        res.json({
          msg: "updated sucessfully",
        });
      }
  })
  }
  else {
      pool.query(`select quantity from carts where product_id = '${req.body.product_id}'  and user_id = '${req.body.user_id}' `,(err,result)=>{
          if (err) throw err;
          else if (result[0]) {
             // res.json(result[0])
              pool.query(`update carts set quantity = ${req.body.quantity} ,  where product_id = '${req.body.product_id}'  and user_id = ${req.body.user_id}`,(err,result)=>{
                  if (err) throw err;
                  else {
                      res.json({
                        msg: "updated sucessfully",
                      });
                    }

              })
          }
          else {
               pool.query(`insert into carts set ?`, body, (err, result) => {
               if (err) throw err;
               else {
                 res.json({
                   msg: "updated sucessfully",
                 });
               }
             });

          }

      })
  }

})



router.post("/mycart", (req, res) => {
 
  var query = `select c.*,(select s.productname from products s where s.id = c.product_id) as servicename
  ,(select s.image from products s where s.id = c.product_id) as productlogo,
  (select s.qty from products s where s.id = c.product_id) as productquantity,
  (select s.mrp from products s where s.id = c.product_id) as productprice

  from carts c where c.user_id = '${req.body.user_id}';`
  var query1 = `select count(id) as counter from carts where user_id = '${req.body.user_id}';`
  var query3 = `select c.*,(select s.productname from products s where s.id = c.product_id) as servicename
  ,(select s.image from products s where s.id = c.product_id) as productlogo,
  (select s.qty from products s where s.id = c.product_id) as productquantity,
  (select s.mrp from products s where s.id = c.product_id) as productprice
  from carts c where c.quantity <= (select p.qty from products p where p.id = c.product_id ) and c.user_id = '${req.body.user_id}' ;`
  var query4 = `select count(id) as counter from carts c where c.quantity <= (select p.qty from products p where p.id = c.product_id ) and c.user_id = '${req.body.user_id}';`
  pool.query(query+query1+query3+query4, (err, result) => {
    if (err) throw err;
    else if (result[0][0]) {
      req.body.mobilecounter = result[1][0].counter;
      console.log("MobileCounter", req.body.mobilecounter);
      res.json(result);
    } else
      res.json({
        msg: "empty cart",
      });
  });

});


router.get('/cities',(req,res)=>{
  pool.query(`select * from cities where state_id = '${req.query.state_id}' order by name`,(err,result)=>{
    if(err) throw err;
     else res.json(result)
  })
})


router.get('/states',(req,res)=>{
  pool.query(`select * from states order by name`,(err,result)=>{
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