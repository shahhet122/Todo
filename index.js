const express = require("express");
const mongoose = require('mongoose');
const path = require("path");
const bodyParser = require("body-parser");
const moment = require("moment");

const PORT = 5000;

//init app
const app = express();

const connectionUrl = "mongodb://localhost:27017/todoDb";

mongoose
    .connect(connectionUrl)
    .then(() => console.log("Databases connection successful"))
    .catch((error) => console.log(error.message));

const todoSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        
    },desc: String,
}, { timestamps: true });

const Todo = mongoose.model("todo", todoSchema);

//view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
//main page
app.get("/", async(req, res, next) => {
    try {
        const todos=await Todo.find({}).sort({createdAt:1});
        res.locals.moment=moment;
        res.render("index", { title: "List todo" ,todos});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//add todo
app.get("/add-todo", (req, res, next) => {
    try {
        res.render("newTodo", { title: "Add todo" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})
//update todo
app.get("/update-todo", async(req, res, next) => {
    try {
        const { id }=req.query;
        const todo=await Todo.findById(id);
        res.render("updateTodo", { title: "Update todo",todo })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})
//delete todo
app.get("/delete-todo", (req, res, next) => {
    try {
        res.render("deleteTodo", { title: "Delete todo", id: req.query.id});
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post("/add-todo",async(req,res,next)=>{
    try{
        const{title,desc}=req.body;
        if(!title){
            return res.status(400).json({message:"Title is required"});
        }
        const newTodo=new Todo({title,desc});
        await newTodo.save();
        res.redirect("/");
    }catch(error){
        res.status(500).json({message:error.message})
    }
})
app.post("/update-todo/:id",async(req,res,next)=>{
    try{
        const {id}=req.params;
        const {title,desc}=req.body;
        const todo=await Todo.findById(id);
        if(!todo){
            return res.status(404).json({message:"Todo not found"});
        }
        todo.title=title;
        todo.desc=desc;
        await todo.save();
        res.redirect("/");
    }catch(error){
        res.status(500).json({message:error.message})
    }
})
// app.post("/delete-todo/:id",async(req,res,next)=>{
//     try{
//         const {id}=req.query;
//        res.render("deleteTodo",{title:"Delete todo",id});
//     }catch(error){
//         res.status(500).json({message:error.message})
//     }
// }
// );
app.get("/confirm-delete",async(req,res,next)=>{
    try{
       const{id,confirm}=req.query;
       if(confirm==="yes"){ 
        await Todo.findByIdAndDelete(id);
       }
        res.redirect("/");
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
)

//listen server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});