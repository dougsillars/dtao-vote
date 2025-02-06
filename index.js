const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;
app.use(express.static('public'));

// Data storage
let data = [];

// API endpoint URL
const apiUrl = 'https://api.taostats.io/api/call/v1';
const apiParams = {
  full_name: 'SubtensorModule.vote',
  block_start: 700000,
};
// API key from environment variable
const apiKey = process.env.TAOSTATS_API_KEY;

const hotkeyMapping = {
    "0xbc0e6b701243978c1fe73d721c7b157943a713fca9f3c88cad7a9f7799bc6b26": "Taostats & Corcel",
    "0x84d83d08ca89f8e60424ffa286f165c16dd8752e4faa4d8977221e6720678d28": "Openτensor Foundaτion",
    "0x2402d2dd859f24ff5305ce12d54e02f3c2cafe6788af4b405bbe0d407695af37": "tao5",
    "0xe4df2c7397e1443378b4cec0f2fca9dac1d0923d020e7aab11dd41428014ab59": "Yuma, a DCG Company",
    "0xac4ba7704623c5beb4950ef97ddea57c9c12b91938c86f28475f8050741ac956": "Polychain",
    "0xe824c935940357af73c961bdd7387e1ab821ec2939ecd19daafe6081ae9ae674": "Bittensor Guru",
    "0xbefb4b2b719c0dc08273b9293fa8166180fe3c0e6e0fc9f4cb224f429dc8163c": "Datura",
    "0xf28fac64d7a3d8bdbf5b6db34de1607d7e8cd2db343d5f2790057f7f3cec0e1e": "Crucible Labs",
    "0x8cafec513739d2ed72700fe9ef1b4a62c3d0b06ddf6258bb00cbac2cbced5f68": "RoundTable21",
    "0xac9f1bbd2e45cdb5788d6c094284c22e96cbecf1643216f9c51e4cd81e0e9938": "TAO-Validator.com",
    "0x2c36c8b88903c8507aa3a9a6dcfc016caf5cfd3d8bf755b97e63f8f8b7c56836": "Tatsu",
    "0x522f432f51287df57711a3a00f6c7a334b0c813ff178c22649f01566ef4a5d48": "FirstTensor.com",
  };

// Function to fetch data from API and update storage
async function fetchData() {
    try {
        const headers = {
          accept: 'application/json',
          Authorization: apiKey,
        };
        const response = await axios.get(apiUrl, { params: apiParams, headers });
        const voteData = response.data.data;
        const parsedData = voteData.map((vote) => {
        const block = vote.block_number;
        const success = vote.success;
        const actualVote = vote.args.approve;
        const voter = hotkeyMapping[vote.args.hotkey] || vote.args.hotkey;
        const proposal = vote.args.proposal;

         return {
            block,
            hotkey: voter,
            vote: actualVote,
            success,
            proposal,
        };
        });
        data = parsedData.filter((vote) => vote.success == true);
        console.log("data", data)
  } catch (error) {
    console.error(error);
  }
}

// Schedule API calls every 12 seconds
setInterval(fetchData, 12000);

// Route to serve data as a table
app.get('/', (req, res) => {
  const tableHtml = `
    <meta http-equiv="refresh" content="12">
    <link rel="stylesheet" type="text/css" href="/style.css">
    <h1>dTao Vote</h1>
    <div class="table-wrapper">
    <table>
      <thead>
      <tr>
        <th>Block</th>
        <th>Hotkey</th>
        <th>Vote</th>
      </tr>
      </thead>
      <tbody>
      ${data.map((item) => `
        <tr>
          <td>${item.block}</td>
          <td>${item.hotkey}</td>
          <td class="vote-${item.vote ? 'yes' : 'no'}">${item.vote ? 'Yes' : 'No'}</td>
        </tr>
      `).join('')}
    </tbody>
    </table>
    </div>
    <div class="footer">
        <p>Powered by <a href="https://taostats.io"><img width = 200px src="/taostats.jpg" alt="taostats" /></a></p>
    </div>
  `;
  res.send(tableHtml);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});