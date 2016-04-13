var express = require('express');
var mongoose = require('mongoose');
var PersonSchema = require('./models/Person');
var bodyParser = require('body-parser');
var router = express.Router();
var url = require('url');
mongoose.connect('mongodb://username:password@ds023490.mlab.com:23490/ciscodemo');
var app = express();

var port = process.env.PORT || 3000;
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);
app.use(bodyParser.text());
app.use('/api', router);
var homeRoute = router.route('/');
homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

var personRoute = router.route('/objects')
var persondetailRoute = router.route('/objects/:objectid')
app.get('/', function (req, res) {
  res.send('Hello World!');
});

personRoute.get(function(req,res){
	var ret_prefix=req.protocol + '://' + req.get('host') + req.originalUrl;
	PersonSchema.find(function(err,obj){
		if(err){
			res.status(500);
        	res.json({
			   "verb": "GET",
			   "url": ret_prefix,
			   "message": err
			});
		}
		else{
			ret=[]
			for(var x=0;x<obj.length;x++){
				var url=ret_prefix+obj[x]["_id"];
				ret.push({"url":url});
			}
			res.json(ret);
		}
	})

})
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
personRoute.post(function(req, res, next) {
	var data = req.body;
	var ret_prefix=req.protocol + '://' + req.get('host') + req.originalUrl;
	if(data==undefined){
		res.status(500)
		res.json({
			   "verb": "POST",
			   "url": ret_prefix,
			   "message": "Internal Error"
			});
	}
	if(IsJsonString(data)==false){
		res.status(500)
		res.json({
			   "verb": "POST",
			   "url": ret_prefix,
			   "message": "Invalid Json Object"
			});

	}
	var obj_data=JSON.parse(data)

  if(obj_data['firstName']==undefined || obj_data['lastName']==undefined){
      res.status(500);
        res.json({
			   "verb": "POST",
			   "url": ret_prefix,
			   "message": "Validation Error: firstname or lastname is missing! "
			});

  }
  else{
  	

    var new_obj=new PersonSchema(obj_data);
    new_obj.save(function (err, post) {
    	if(err){
    		res.status(500);
    		res.json({
			   "verb": "POST",
			   "url": ret_prefix,
			   "message": err
			});
    	}
    	else{
    		res.status(201);
    		post = post.toObject();
    		post.uid=post._id;
  			delete post._id
  			delete post.__v;
    		res.json(post);
    	}
    })
	}
})
persondetailRoute.get(function(req,res){
	var ret_prefix=req.protocol + '://' + req.get('host') + req.originalUrl;
	var objid=req.params.objectid;
  if(objid.match(/^[0-9a-fA-F]{24}$/)){
        PersonSchema.find({_id:objid},function(err,user){
          if(err){
				res.status(500);
            	res.json({
			   "verb": "GET",
			   "url": ret_prefix,
			   "message": err
			});
			}
          if(user.length!=0){

          	user = user[0].toObject();
    		user.uid=user._id;
  			delete user._id
  			delete user.__v
              res.json(user);

          }
          else{
            res.status(404);
            res.json({
			   "verb": "GET",
			   "url": ret_prefix,
			   "message": "Object Not Found"
			});
          }

        })
    }
    else{
      res.status(404);
      res.json({
			   "verb": "GET",
			   "url": ret_prefix,
			   "message": "Object Not Found"
			});
    }


})

persondetailRoute.delete(function(req,res){
	var ret_prefix=req.protocol + '://' + req.get('host') + req.originalUrl;
	var objid=req.params.objectid;
	if(objid.match(/^[0-9a-fA-F]{24}$/)){

		PersonSchema.find({_id:objid},function(err,user){
          if(err)
            res.json({"message":err,"data":[]});
          if(user.length!=0)
            {
            	PersonSchema.remove({"_id":objid},function(err,task){
		          if(err){
		            res.status(500);
		            res.json({
					   "verb": "DELETE",
					   "url": ret_prefix,
					   "message": "Internal Error"
					});
		          }
		          else{
		            res.status(200);
		            res.json();
		          }
		      })
            }
          else{
            res.status(404);
            res.json({
			   "verb": "DELETE",
			   "url": ret_prefix,
			   "message": "Object Not Found"
			});
          }

        })



	}
	else{
		res.status(404);
      	res.json({
			   "verb": "DELETE",
			   "url": ret_prefix,
			   "message": "Object Not Found"
			});
	}

})
persondetailRoute.put(function(req,res,next){
	var ret_prefix=req.protocol + '://' + req.get('host') + req.originalUrl;
	var objid=req.params.objectid;
	if(objid.match(/^[0-9a-fA-F]{24}$/)){
		PersonSchema.find({_id:objid},function(err,user){
			if(err){
				res.status(500);
            	res.json({
					   "verb": "PUT",
					   "url": ret_prefix,
					   "message": "Object not found"
					});
			}
			if(user.length!=0){
				var data = req.body;
	
				if(data==undefined){
					res.status(500)
					res.json({
					   "verb": "PUT",
					   "url": ret_prefix,
					   "message": "Internal Error"
					});
				}
				if(IsJsonString(data)==false){
					res.status(500)
					res.json({
					   "verb": "PUT",
					   "url": ret_prefix,
					   "message": "Invalid Json Object"
					});
				}
				else
				{
					var obj_data=JSON.parse(data)

			  if(obj_data['firstName']==undefined || obj_data['lastName']==undefined){
			      res.status(500);
			        res.json({
					   "verb": "PUT",
					   "url": ret_prefix,
					   "message": "Validation Error: firstname or lastname is missing! "
					});
			  }
			  else{
			  	PersonSchema.update({"_id":objid},{$set:obj_data},function(err,user){
                if(err)
                  {
                  	res.json({
					   "verb": "PUT",
					   "url": ret_prefix,
					   "message": "Object not found"
					});
                  }
                if(user.length!=0)
                  {
                    PersonSchema.find({"_id":objid},function(err,retdata){
                      if(err){
                        res.status(404);
                        res.json({
						   "verb": "PUT",
						   "url": ret_prefix,
						   "message": "User Not Found"
						});

                      }
                      else{
                      	retdata = retdata[0].toObject();
			    		retdata.uid=retdata._id;
			  			delete retdata._id
			  			delete retdata.__v
                          res.json(retdata);
                      }
                    })
                  }
                else{
                  res.status(404);
                  res.json({
						   "verb": "PUT",
						   "url": ret_prefix,
						   "message": "User Not Found"
						});

                }
              })

			  }
				}

				

				

            }
	          else{
	            res.status(404);
	            res.json({
					   "verb": "PUT",
					   "url": ret_prefix,
					   "message": "Object not found"
					});
	          }

		})

	}
	else{
		res.status(404);
        res.json({
					   "verb": "PUT",
					   "url": ret_prefix,
					   "message": "Object not found"
					});
	}

})

app.listen(port);
console.log('Server running on port ' + port);




