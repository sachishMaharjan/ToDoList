//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

////////////////////Title section///////////////////////////////////
const titleSchema = {
  name: String
};

const Title = mongoose.model("title", titleSchema);

const title1 = {
  name: "Welcome to your to do List"
};
const title2 ={
  name: "Click + create new list"
};

const title3 = {
  name: "<-- Click here to delete this list"
};

const defaultTitles = [title1, title2, title3];

const listTitleSchema = {
  name: String,
  titles: [titleSchema]
};

const ListTitle = mongoose.model("listTitle", listTitleSchema);

////////////////////Items section///////////////////////////////////

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);


const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);



app.get("/", function(req, res) {
  const day = date.getDate();

  Title.find({}, function(err, foundTitle) {
    if (foundTitle.length === 0) {
      Title.insertMany(defaultTitles, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Added the default title to Database");
        }
      });
      res.redirect("/");
    } else {
      res.render("title", {
        defaultTitle: day,
        newListTitles: foundTitle
      });
    }
  });
});

app.get("/:customTitleName", function(req, res) {
  const customTitleName = req.params.customTitleName;

  List.findOne({
    name: customTitleName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create New lists
        const list = new List({
          name: customTitleName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customTitleName);
      } else {
        //Show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});



app.post("/deleteItem", function(req, res) {
  const checkedItemId = req.body.checkboxItem;
  const listName = req.body.listName;
  List.findOneAndUpdate({
    name: listName
  }, {
    $pull: {
      items: {
        _id: checkedItemId
      }
    }
  }, function(err, foundList) {
    if (!err, foundList) {
      res.redirect("/" + listName);
    }
  });
});

app.post("/deleteTitle", function(req, res) {
  const day = date.getDate();

  const checkedTitleId = req.body.checkbox;
  const titleName = req.body.titleName;

  if (titleName === day) {
    Title.findByIdAndRemove(checkedTitleId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully Deleted Title from the database");
        res.redirect("/");
      }
    });
  }

});
app.post("/", function(req, res) {
  const newTitle = req.body.title;
  const defaultTitle = req.body.defaultTitle;
  //console.log(newTitle);
  const day = date.getDate();

  const title = new Title({
    name: newTitle
  });

  if (defaultTitle == day) {
    title.save();
    res.redirect("/");
  } else {
    ListTitle.findOne({
      name: defaultTitle
    }, function(err, foundList) {
      if (!err) {
        if(!foundList){
          res.redirect("/");
        } else{
        foundList.titles.push(newtitle);
        foundList.save();
        res.redirect("/");
      }
      }
    });
  }
});

app.post("/:customTitleName", function(req, res) {
  const customTitleName = req.body.list || req.body.titlebutton;
  const newItem = req.body.newItem;
  console.log(newItem);

if(customTitleName == req.body.list){
  const item = new Item({
    name: newItem
  });

  List.findOne({
    name: customTitleName
  }, function(err, foundList) {
    if (!err) {
        item.save();
      if(!foundList){
        res.redirect("/" + customTitleName);
      } else{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + customTitleName);
    }
    } else {
      //Show existing list
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }
  });
} else {
  res.redirect("/" +customTitleName);
}

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started Successfully");
});
