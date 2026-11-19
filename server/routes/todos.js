const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// Protect all routes with auth middleware
router.use(auth);

// GET / - current user's todos, newest first
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(todos);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST / - create a new todo for current user { title }
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = new Todo({
      user: req.user.id,
      title: title.trim(),
    });

    await todo.save();
    return res.status(201).json(todo);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /:id - update title and/or completed status of a todo
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, completed } = req.body;

    if (title === undefined && completed === undefined) {
      return res.status(400).json({ error: 'Title or completed status must be provided' });
    }

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }

    const todo = await Todo.findOne({ _id: id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (title !== undefined) {
      todo.title = title.trim();
    }

    if (completed !== undefined) {
      todo.completed = completed;
    }

    await todo.save();
    return res.status(200).json(todo);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:id - delete a todo belonging to current user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todo = await Todo.findOneAndDelete({ _id: id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
