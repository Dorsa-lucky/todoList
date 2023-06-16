const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
// const date = require(__dirname + "/date.js");

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
    name: String
});

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));


const item1 = new Item({
    name: "Welcome to your todolist!"
})

const item2 = new Item({
    name: "Hit the + button to add a new item."
})

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res){

    Item.find({}).then(function (myItems){
        if (myItems.length === 0){
            Item.insertMany(defaultItems);
            res.redirect('/');
        } else {
            // const day = date.getDate()
            res.render('list', {listTitle: "Today" , newListItems: myItems}); 
        } 
        
    });
    
})


app.post("/", function(req, res) {

    let itemName = req.body.newItem;
    let listName = req.body.list;
    

    const item = new Item ({
        name: itemName
    });

    if (req.body.list === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
       
    }

    // item.save();
    // res.redirect("/");

    
})

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    console.log(checkedItemId);
    console.log(listName);

    if(listName === "Today") {
        Item.findByIdAndDelete(checkedItemId)
        .then((deletedDocument) => {
            if (deletedDocument) {
                res.redirect('/');
            } else {
                console.log("Document not found");
            };
        });
    } else {
        List.findOneAndUpdate({name: listName}, { $pull: {items: { _id: checkedItemId}}})
        .then(function(updated){
            // console.log(updated);
            res.redirect("/" + listName);
        })
    }

    
   
})


// app.get("/work", function(req, res){
//     res.render("list", {listTitle: "Work List", newListItems: workItems})
// })

app.get("/:customListName", function(req, res){
    const customListName  =  _.capitalize(req.params.customListName);
    

    List.findOne({name: customListName})
    .then (function(foundList){
        if (!foundList){
           const list = new List ({
                name: customListName,
                items: defaultItems
            })
            list.save();

            res.redirect("/" + customListName);

        } else {
            res.render('list', {listTitle: customListName , newListItems: foundList.items});
        }
        
    }) 
   
})


app.get("/about", function(req, res){
    res.render("about");
})


app.listen(3000, function(){
    console.log("server running on port 3000");
})