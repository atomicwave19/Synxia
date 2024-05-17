const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

(async () => {
  const db = await open({
    filename: './novel.db',
    driver: sqlite3.Database
  });

  await db.exec('CREATE TABLE IF NOT EXISTS chapters (id INTEGER PRIMARY KEY, title TEXT, content TEXT)');

  app.get('/api/chapters', async (req, res) => {
    const chapters = await db.all('SELECT * FROM chapters');
    res.json(chapters);
  });

  app.get('/api/chapters/:id', async (req, res) => {
    const { id } = req.params;
    const chapter = await db.get('SELECT * FROM chapters WHERE id = ?', id);
    res.json(chapter);
  });

  app.post('/api/chapters', async (req, res) => {
    const { title, content } = req.body;
    await db.run('INSERT INTO chapters (title, content) VALUES (?, ?)', [title, content]);
    res.status(201).json({ message: 'Chapter created' });
  });

  app.put('/api/chapters/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    await db.run('UPDATE chapters SET title = ?, content = ? WHERE id = ?', [title, content, id]);
    res.json({ message: 'Chapter updated' });
  });

  app.delete('/api/chapters/:id', async (req, res) => {
    const { id } = req.params;
    await db.run('DELETE FROM chapters WHERE id = ?', id);
    res.json({ message: 'Chapter deleted' });
  });

  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
})();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
