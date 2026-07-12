const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.MOCK_PORT || '8081', 10);
const failureRate = Number.parseFloat(process.env.MOCK_SERVICE_FAILURE_RATE || '0.4');
const delayMs = Number.parseInt(process.env.MOCK_SERVICE_DELAY_MS || '200', 10);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/enrich', async (req, res) => {
  await wait(delayMs);
  if (Math.random() < failureRate) {
    res.status(503).json({ error: 'temporary failure' });
    return;
  }

  const userId = req.query.userId || 'unknown';
  res.json({
    userId,
    recentActivity: ['profile_view', 'settings_update', 'purchase_complete'],
    loyaltyScore: Math.floor(300 + Math.random() * 600),
  });
});

app.listen(port, () => {
  console.log(`Mock enrichment service listening on ${port}`);
});
