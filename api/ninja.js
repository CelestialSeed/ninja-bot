// File: api/ninja.js

import { verifyKey } from 'discord-interactions';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const rawBody = await getRawBody(req);

  const isValid = verifyKey(rawBody, signature, timestamp, DISCORD_PUBLIC_KEY);
  if (!isValid) return res.status(401).send('Invalid request signature');

  const interaction = JSON.parse(rawBody);

  if (interaction.type === 1) {
    return res.status(200).json({ type: 1 });
  }

  if (interaction.type === 2 && interaction.data.name === 'ping') {
    return res.status(200).json({
      type: 4,
      data: {
        content: '🜃 Ninja Signal Confirmed. Operational Layer Engaged.',
      },
    });
  }

  return res.status(400).send('Unknown interaction');
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
