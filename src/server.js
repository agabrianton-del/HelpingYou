const express = require('express');
const apiRoutes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/api', apiRoutes);

app.get('/', (_req, res) => {
  res.send('HelpingYou API is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
