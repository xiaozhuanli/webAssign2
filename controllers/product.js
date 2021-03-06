const express=require('express')
const router=express.Router();
//load product model
const productModel = require("../model/products");
const path = require("path");
router.get("/add",(req,res)=>{
    res.render("product/productAdd");
});
router.post("/add",(req,res)=>
{
    const newProduct = {
        name : req.body.name,
        price : req.body.price,
        description : req.body.description,
        category : req.body.category,
        quantity : req.body.quantity,
        bestSeller : req.body.bestSeller,
        status:req.body.status
        
    }

    const product = new productModel(newProduct);
    product.save()
    .then((product)=>{
                req.files.productImg.name=`pro_pic_${product._id}${path.parse(req.files.productImg.name).ext}`
                req.files.productImg.mv(`public/uploads/${req.files.productImg.name}`)
                .then(()=>{
                    productModel.updateOne({_id:product._id})

                    res.redirect(`/product/list/${product._id}`);
                })


                
            })
    .catch(err=>console.log(`Error happened when inserting in the database:${err}`));
   
});

router.get("/list/:id",(req,res)=>{
    //pull from the database, get the results that was returned and 
    //then inject that results into the productDashboard
    productModel.find()
    .then((products)=>{
        //Filter out the information that you want from the arrary
        //of documents that was returned into a new array

        //the call up function will be executed as many times as
        //how many arrarys of documents there
        const filteredProduct=products.map(product=>{
            return {
                id:product._id,
                name:product.name,
                price:product.price,
                description:product.description,
                category:product.category,
                quantity:product.quantity,
                bestSeller:product.bestSeller,
                status:product.status,
                productImg:product.productImg
            }
        });


        res.render("product/productDashboard",{
            data:filteredProduct
        });
    })
    .catch(err=>console.log(`Error happened when pulling data from the database:${err}`));

});
//find(): when to pull multiply values from the database
//findById()
router.get("/edit/:id",(req,res)=>{
    productModel.findById(req.params.id)
    .then((product)=>{
        const {_id,name,price,description,category,quantity,bestSeller,status,productImg}=product;
        res.render("product/productEdit",{
            _id,
            name,
            price,
            description,
            category,
            quantity,
            bestSeller,
            status,
            productImg
    })
})
    .catch(err=>console.log(`Error happened when pulling data from the database:${err}`));

    
})

router.put("/update/:id",(req,res)=>{

    const product=
    {
        name : req.body.name,
        price : req.body.price,
        description : req.body.description,
        category : req.body.category,
        quantity : req.body.quantity,
        bestSeller : req.body.bestSeller,
        status:req.body.status,
        //productImg:req.body.productImg
    }
    productModel.updateOne({_id:req.params.id},product)
    .then((product)=>
    {
        req.files.productImg.name=`pro_pic_${product._id}${path.parse(req.files.productImg.name).ext}`;
        req.files.productImg.mv(`public/uploads/${req.files.productImg.name}`)
        .then(()=>{
            productModel.updateOne({_id:product._id},{
                productImg:req.files.productImg.name
            })
            .then(()=>{
                res.redirect(`/product/list/${product._id}`);
            })
        })
        
    })
    .catch(err=>console.log(`Error happened when updating data from the database:${err}`));

});

router.delete("/delete/:id",(req,res)=>{
    
    productModel.deleteOne({_id:req.params.id})
    .then(()=>{
        res.redirect('/product/list');
    })
    .catch(err=>console.log(`Error happened when deleting data from the database:${err}`));

});

module.exports=router;