require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { fetchAllTodos, saveATodo, Todos } = require('./utils');
const path = require('path');


const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)

app.get('/', (req, res) => {
    return res.sendFile('index.html', { root: path.join(__dirname, 'public') });
})

app.get('/todos', async (req, res) => {
    const todoArray = await fetchAllTodos();
    // if (todoArray.length === 0) {
    //     return res.status(404).json({ message: 'empty' })
    // }
    return res.json({ todoArray });
});

app.get('/todos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const todo = await Todos.findById(id);
        if (todo) {
            return res.json({ todo })
        }
        return res.status(404).json({ message: 'todo not found' })
    } catch (error) {
        return res.status(500).json({ message: 'internal error' })
    }

})

app.post('/todos', async (req, res) => {
    const title = req.body.title;
    const completed = req.body.completed;
    const description = req.body.description;

    const id = await saveATodo({ title, completed, description });

    res.status(201).json({ id })
})

app.put('/todos/:id', async (req, res) => {
    const id = req.params.id;
    /*
    By default, when using findByIdAndUpdate(), 
    the method returns the original document before the update was applied. 
    However, by setting { new: true }, 
    you instruct the method to return the modified document instead.
    */
    try {
        const todo = await Todos.findByIdAndUpdate(id, req.body, { new: true });
        if (todo) {
            return res.json({ todo, message: 'todo updated successfully' })
        }
        return res.status(404).json({ message: 'todo not found' })
    } catch (error) {
        return res.status(500).json({ message: 'internal error' })
    }
})

app.delete('/todos/:id', async (req, res) => {
    const id = req.params.id;
    await Todos.findByIdAndDelete(id)
    return res.send();
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Todo Server running on ${port}, http://localhost:${port}`));