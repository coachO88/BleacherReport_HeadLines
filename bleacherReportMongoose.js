//Scraping
const axios = require("axios")
const cheerio = require("cheerio")
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/orlandoDB";
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log ("Connected!")
});

const topStoriesModel = require ("./topStories.js");
// const commentModel = require ("./comment") 

axios.get("https://bleacherreport.com/").then(function(response) {

    let $ = cheerio.load(response.data);
    
    topStoriesModel.deleteMany({
        Favorite:false
    }).then(function(data){
        console.log ("Data Deleted")
    }).catch(function (err){
        if (err) return handleError(err);
    });

    $("li.articleSummary").each(function(i,element){
        
        let sportHeadline = ($(element).children(".articleContent").children(".articleTitle").text());
            
        let sportURL = $(element).children(".articleMedia").children().attr("href");
        
        let sportImage = $(element).children(".articleMedia").children().children().attr("src");
        sportImage = sportImage.split("?")[0];
        let finalImage = sportImage + "?h=500&w=970&q=70&crop_x=center&crop_y=top";


        // console.log(sportHeadline);?h=700&w=1170&q=70&crop_x=center&crop_y=top
        // console.log(sportURL);
        // console.log(sportImage)
        // console.log(finalImage);
        
            topStoriesModel.create({
            sportHeadline: sportHeadline,
            sportURL: sportURL,
            sportImage: finalImage,
        }).then(function (data){
            // console.log (data)
        }).catch(function (err){
            if (err) return handleError(err);
        })
    });
});

//Server

const express = require('express');
const path = require("path");
// =============================================================
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;

//Handle Bars 
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//Handle Bars

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static(__dirname + '/assets'));


app.get("/", function (req, res){
    res.redirect("/top_stories")
});

app.get("/top_stories", function (req, res){

    topStoriesModel.find({
    }).then(function (docs) {
        let hbsObject = {data: docs};
        res.render("index", hbsObject)
    }).catch(function (err){
        if (err) return handleError(err);
    })
});

app.get("/saved", function (req, res){

    topStoriesModel.find({
        Favorite:true
    }).then(function (headlineDocs) {
        
        for (let i = 0; i < headlineDocs.length; i++) {
            let headline = headlineDocs[i].Headline;

            commentModel.find({
                sportHeadline: sportHeadline
            }).then(function (docs){
                let comments = docs
                let headline = docs[0].sportHeadline;
                topStoriesModel.findOneAndUpdate({
                    sportHeadline: sportHeadline,
                    Favorite:true
                },{
                    Comments: comments
                }).then().catch(function (err3){
                    if (err3) return handleError(err3);
                })
            }).catch(function (err2){
                if (err2) return handleError(err2);
            })

            if (i == headlineDocs.length - 1) {
                display()
            }
        };
    }).catch(function (err1){
        if (err1) return handleError(err1);
    });

    function display () {
        topStoriesModel.find({
            Favorite:true
        }).then(function (docs) {
            let hbsObject = {data: docs};
        res.render("favorite", hbsObject)
        }).catch(function (err){
            if (err) return handleError(err);
        });
    }


});

app.get("/alreadyInFavorite", function (req, res){
    res.render("Favorited")
});

app.post("/favorite/:id/:title", function (req, res){
    let id = req.params.id
    let title = req.params.title

    topStoriesModel.find({
        sportHeadline:title,
        Favorite:true
    }).then(function (data){
        //console.log (data.length);
        if (data.length === 0) {
            topStoriesModel.findOneAndUpdate({
                _id:id
            },{
                Favorite:true
            }).then(function (data){
                res.redirect("/favorite")
            }).catch( function (err){
                if (err) return handleError(err);
            })
        } else {
            res.redirect("/alreadyInFavorite")
            //res.json({"FOUND":"FOUND"})
        };
    }); 
});

app.post("/comment/:headline", function (req, res){
    let headline = req.params.sportHeadline;
    // let author = req.body.author;
    let comment = req.body.comment;

    commentModel.create({
        sportHeadline: sportHeadline,
        // Author: author,
        Comment: comment
    }).then(function (data){
        //console.log (data)
    }).catch(function (err){
        if (err) return handleError(err);
    });

    res.redirect("/favorite")
});

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});