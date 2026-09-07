// Atualiza a data e a hora
function updateDateTime() {
    const now = new Date();

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long'
    };

    document.getElementById('datetime').innerText =
        now.toLocaleDateString('pt-BR', options);
}


// Busca a localização de uma cidade
async function getCityCoordinates(city) {
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error('Cidade não encontrada.');
    }

    return data.results[0];
}


// Busca a previsão do tempo
async function getWeather(latitude, longitude) {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );

    if (!response.ok) {
        throw new Error('Não foi possível buscar a previsão.');
    }

    return await response.json();
}

// Converte o código meteorológico em uma descrição
function getWeatherDescription(code) {
    const weatherCodes = {
        0: '☀️ Céu limpo',
        1: '🌤️ Principalmente limpo',
        2: '⛅ Parcialmente nublado',
        3: '☁️ Nublado',
        45: '🌫️ Neblina',
        48: '🌫️ Neblina com geada',
        51: '🌦️ Chuvisco leve',
        53: '🌦️ Chuvisco moderado',
        55: '🌧️ Chuvisco intenso',
        61: '🌧️ Chuva leve',
        63: '🌧️ Chuva moderada',
        65: '🌧️ Chuva forte',
        71: '🌨️ Neve leve',
        73: '🌨️ Neve moderada',
        75: '❄️ Neve forte',
        80: '🌦️ Pancadas de chuva leves',
        81: '🌧️ Pancadas de chuva moderadas',
        82: '⛈️ Pancadas de chuva fortes',
        95: '⛈️ Tempestade',
        96: '⛈️ Tempestade com granizo',
        99: '⛈️ Tempestade forte com granizo'
    };

    return weatherCodes[code] || '🌡️ Condição desconhecida';
}

// Mostra a previsão de uma cidade
async function searchWeather() {
    const cityInput = document.getElementById('city');
    const cityName = document.getElementById('city-name');
    const weather = document.getElementById('weather');

    const city = cityInput.value.trim();

    if (!city) {
        alert('Por favor, insira o nome da cidade.');
        return;
    }

    try {
        weather.innerHTML = '<p>Buscando previsão...</p>';

        const location = await getCityCoordinates(city);
        const data = await getWeather(
            location.latitude,
            location.longitude
        );

        cityName.innerText =
            `Previsão do Tempo para ${location.name}`;

        weather.innerHTML = `
        <h2>Previsão do Tempo em ${location.name}</h2>
        <p>${getWeatherDescription(data.current.weather_code)}</p>
        <p>🌡️ Temperatura: ${data.current.temperature_2m}°C</p>
        <p>💧 Umidade: ${data.current.relative_humidity_2m}%</p>
        <p>💨 Vento: ${data.current.wind_speed_10m} km/h</p>
        `;

    } catch (error) {
        weather.innerHTML = `
            <p>Erro: ${error.message}</p>
        `;
    }
}


// Mostra a previsão de Campo Largo
async function showWeather() {
    const city = 'Campo Largo';

    try {
        const location = await getCityCoordinates(city);

        const data = await getWeather(
            location.latitude,
            location.longitude
        );

        document.getElementById('weather').innerHTML = `
        <h2>Previsão do Tempo em ${location.name}</h2>
        <p>${getWeatherDescription(data.current.weather_code)}</p>
        <p>🌡️ Temperatura: ${data.current.temperature_2m}°C</p>
        <p>💧 Umidade: ${data.current.relative_humidity_2m}%</p>
        <p>💨 Vento: ${data.current.wind_speed_10m} km/h</p>
`;

    } catch (error) {
        document.getElementById('weather').innerHTML = `
            <p>Erro: ${error.message}</p>
        `;
    }
}


// Autocomplete das cidades
async function autocomplete() {
    const input = document.getElementById('city');
    const value = input.value.trim();

    if (!value) {
        closeAllLists();
        return;
    }

    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=5&language=pt&format=json`
        );

        const data = await response.json();

        closeAllLists();

        if (!data.results || data.results.length === 0) {
            return;
        }

        const list = document.createElement('div');

        list.id = 'autocomplete-list';
        list.className = 'autocomplete-items';

        input.parentNode.appendChild(list);

        data.results.forEach(item => {
            const div = document.createElement('div');

            div.innerText =
                `${item.name}, ${item.country || ''}`;

            div.addEventListener('click', () => {
                input.value = item.name;
                closeAllLists();
            });

            list.appendChild(div);
        });

    } catch (error) {
        console.error('Erro ao buscar cidades:', error);
    }
}


// Fecha as sugestões
function closeAllLists() {
    const items =
        document.getElementsByClassName('autocomplete-items');

    while (items.length) {
        items[0].parentNode.removeChild(items[0]);
    }
}


// Fecha sugestões ao clicar fora
document.addEventListener('click', (event) => {
    if (event.target !== document.getElementById('city')) {
        closeAllLists();
    }
});


// Volta ao topo
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


// Atualiza a data e hora
setInterval(updateDateTime, 1000);
updateDateTime();