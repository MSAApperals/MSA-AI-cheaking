
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize the app
const app = express();
const PORT = 3000;
const DEEPAI_API_KEY = 'YOUR_DEEPAI_API_KEY'; // Replace with your DeepAI API key

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML, CSS, JS from "public" folder
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Text-to-Video Generator</title>
        <style>
            body, html {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #f0f0f0;
            }

            .container {
                text-align: center;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }

            header h1 {
                font-size: 36px;
                color: #333;
            }

            textarea {
                width: 100%;
                height: 200px;
                padding: 10px;
                font-size: 18px;
                border: 2px solid #ddd;
                border-radius: 8px;
                margin: 20px 0;
                resize: none;
            }

            button {
                padding: 10px 20px;
                font-size: 18px;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            }

            button:hover {
                background-color: #218838;
            }

            .spinner {
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 2s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .video-preview {
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>Text-to-Video Generator</h1>
                <p>Enter your text and create a video with it!</p>
            </header>
            <main>
                <section class="input-area">
                    <textarea id="input-text" placeholder="Enter the text you want to convert into a video..."></textarea>
                    <button id="generate-btn">Generate Video</button>
                </section>
                <section class="loading" style="display: none;">
                    <p>Generating your video...</p>
                    <div class="spinner"></div>
                </section>
                <section class="video-preview" style="display: none;">
                    <video id="video-preview" controls></video>
                    <button id="download-btn">Download Video</button>
                </section>
            </main>
        </div>

        <script>
            document.getElementById('generate-btn').addEventListener('click', generateVideo);

            function generateVideo() {
                const inputText = document.getElementById('input-text').value;

                if (!inputText.trim()) {
                    alert("Please enter some text!");
                    return;
                }

                // Show loading animation
                document.querySelector('.loading').style.display = 'block';
                document.querySelector('.input-area').style.display = 'none';

                // Hide previous video preview
                document.querySelector('.video-preview').style.display = 'none';

                // Call the backend to generate video
                fetch('/generate-video', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: inputText })
                })
                .then(response => response.json())
                .then(data => {
                    // Hide loading animation and show video preview
                    document.querySelector('.loading').style.display = 'none';
                    document.querySelector('.video-preview').style.display = 'block';

                    // Set the video source
                    const video = document.getElementById('video-preview');
                    video.src = data.videoUrl;

                    // Enable download button
                    document.getElementById('download-btn').addEventListener('click', function() {
                        window.location.href = data.videoUrl;
                    });
                })
                .catch(error => {
                    console.error('Error generating video:', error);
                    alert("There was an error generating your video.");
                    document.querySelector('.loading').style.display = 'none';
                    document.querySelector('.input-area').style.display = 'block';
                });
            }
        </script>
    </body>
    </html>
    `);
});

// Endpoint to generate video
app.post('/generate-video', async (req, res) => {
    const text = req.body.text;

    try {
        // Call DeepAI API to generate video
        const response = await fetch('https://api.deepai.org/api/text2video', {
            method: 'POST',
            headers: {
                'Api-Key': DEEPAI_API_KEY,
            },
            body: JSON.stringify({ text })
        });

        const data = await response.json();
        
        if (data && data.output_url) {
            res.json({ videoUrl: data.output_url });
        } else {
            res.status(400).json({ error: 'Failed to generate video.' });
        }
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
