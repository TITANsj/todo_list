//jsHint: ESv6

const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

mongoose.connect("mongodb://localhost:27017/itemsdb", {useNewUrlParser: true}, { useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Task 1"
});

const item2 = new Item({
  name: "Task 2"
});

const item3 = new Item({
  name: "Task 3"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
  Item.find(function(err, itemsFound){
    if(itemsFound.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err)
          console.log(err);
        else
          console.log("Successfully inserted all the items");
      });
      res.redirect("/");
    }
    else
      res.render("index", {type: "Today", newListItems: itemsFound});
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
      if(!err){
        if(!foundList){
          const list = new List({
          name: customListName,
          items: defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
        }
        else{
          res.render("index", {type: foundList.name, newListItems: foundList.items});
        }
      }
      else{
        console.log(err);
      }
  });
});

app.post("/", function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item1 = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item1.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item1);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const deletedItem = req.body.delete;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(deletedItem, function(err){
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletedItem}}}, function(err, foundList){
      res.redirect("/" + listName);
    });
  }

});

app.listen("3000", function(){
  console.log("Server started on port 3000");
});
