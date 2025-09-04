const http = require('http');
const path = require('path');
const url = require('url');
const https = require('https');
const fs = require('fs');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    // Route pour servir le fichier HTML de l'interface utilisateur
    if (pathname === '/') {
        // Log de connexion
        console.log(`Nouvelle connexion au site web depuis ${req.socket.remoteAddress}`);
        try {
            const fileContent = fs.readFileSync(path.join(__dirname, 'index.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fileContent);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erreur interne du serveur.');
        }
        return;
    }

    // API pour la météo
    if (pathname === '/api/weather') {
        const city = query.city;
        
        if (!city) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nom de ville manquant.' }));
            return;
        }

        // Log de la requête météo avec la ville
        console.log(`Requête météo reçue pour la ville : ${city}`);

        try {
            // 1. Convertir le nom de la ville en coordonnées
            const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
            
            const geocodeResponse = await new Promise((resolve, reject) => {
                https.get(geocodingUrl, (apiRes) => {
                    let data = '';
                    apiRes.on('data', (chunk) => data += chunk);
                    apiRes.on('end', () => resolve(JSON.parse(data)));
                }).on('error', reject);
            });

            if (!geocodeResponse || !geocodeResponse.results || geocodeResponse.results.length === 0) {
                // Log de l'échec de la recherche de ville
                console.log(`Erreur: Ville "${city}" non trouvée.`);
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Ville non trouvée. Veuillez réessayer.' }));
                return;
            }

            const { latitude, longitude, name } = geocodeResponse.results[0];

            // 2. Obtenir la météo en utilisant les coordonnées
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
            
            const weatherResponse = await new Promise((resolve, reject) => {
                https.get(weatherUrl, (apiRes) => {
                    let data = '';
                    apiRes.on('data', (chunk) => data += chunk);
                    apiRes.on('end', () => resolve(JSON.parse(data)));
                }).on('error', reject);
            });

            // Log de la réponse de l'API Open-Meteo
            console.log('Réponse de l\'API Open-Meteo :', weatherResponse);

            if (!weatherResponse.current_weather) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Données météo non disponibles pour cette ville.' }));
                return;
            }

            const weatherData = {
                name: name,
                temperature: weatherResponse.current_weather.temperature,
                windspeed: weatherResponse.current_weather.windspeed,
                weathercode: weatherResponse.current_weather.weathercode
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(weatherData));

        } catch (error) {
            console.error('Erreur interne du serveur:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erreur interne du serveur.' }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page non trouvée');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Le serveur météo est démarré sur http://localhost:${port}`);
});