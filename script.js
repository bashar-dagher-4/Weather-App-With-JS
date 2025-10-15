
        // عناصر DOM
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const loading = document.getElementById('loading');
        const weatherContent = document.getElementById('weather-content');
        const errorDiv = document.getElementById('error');
        const errorMessage = document.getElementById('error-message');
        const celsiusBtn = document.getElementById('celsius-btn');
        const fahrenheitBtn = document.getElementById('fahrenheit-btn');
        const recentSearches = document.getElementById('recent-searches');
        const recentList = document.getElementById('recent-list');
        
        const cityName = document.getElementById('city-name');
        const dateElement = document.getElementById('date');
        const temperature = document.getElementById('temperature');
        const weatherIcon = document.getElementById('weather-icon');
        const weatherDescription = document.getElementById('weather-description');
        const humidity = document.getElementById('humidity');
        const windSpeed = document.getElementById('wind-speed');
        const pressure = document.getElementById('pressure');
        const visibility = document.getElementById('visibility');

        //variables
        let currentUnit = 'metric';
        let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

        //key of openWeatherMap
        const apiKey = '576200f04271f2a335dcf7bef2fd8ad1';
        
        //update date
        function updateDate() {
            const now = new Date();
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('en', options);
        }

        //update background
        function updateBackground(weatherMain) {
            const body = document.body;
            if (weatherMain.includes('Clear')) {
                body.style.background = 'linear-gradient(135deg, #1a2980, #26d0ce)';
            } else if (weatherMain.includes('Cloud')) {
                body.style.background = 'linear-gradient(135deg, #616161, #9bc5c3)';
            } else if (weatherMain.includes('Rain') || weatherMain.includes('Drizzle')) {
                body.style.background = 'linear-gradient(135deg, #373B44, #4286f4)';
            } else if (weatherMain.includes('Thunderstorm')) {
                body.style.background = 'linear-gradient(135deg, #0F2027, #203A43, #2C5364)';
            } else if (weatherMain.includes('Snow')) {
                body.style.background = 'linear-gradient(135deg, #8e9eab, #eef2f3)';
            } else {
                body.style.background = 'linear-gradient(135deg, #1a2980, #26d0ce)';
            }
        }

        //update icon
        function updateWeatherIcon(weatherMain) {
            if (weatherMain === 'Clear') {
                weatherIcon.innerHTML = '<i class="fas fa-sun"></i>';
            } else if (weatherMain === 'Clouds') {
                weatherIcon.innerHTML = '<i class="fas fa-cloud"></i>';
            } else if (weatherMain === 'Rain' || weatherMain === 'Drizzle') {
                weatherIcon.innerHTML = '<i class="fas fa-cloud-rain"></i>';
            } else if (weatherMain === 'Thunderstorm') {
                weatherIcon.innerHTML = '<i class="fas fa-bolt"></i>';
            } else if (weatherMain === 'Snow') {
                weatherIcon.innerHTML = '<i class="fas fa-snowflake"></i>';
            } else if (weatherMain === 'Mist' || weatherMain === 'Fog') {
                weatherIcon.innerHTML = '<i class="fas fa-smog"></i>';
            } else {
                weatherIcon.innerHTML = '<i class="fas fa-cloud-sun"></i>';
            }
        }

        //get data
        async function getWeatherData(city) {
            try {
                showLoading();
                
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${apiKey}&lang=en`
                );
                
                if (!response.ok) {
                    throw new Error('not found any city');
                }
                
                const data = await response.json();
                displayWeatherData(data);
                
                addToRecentCities(city);
                
            } catch (error) {
                showError("404 " + error.message);
            }
        }

        //view data
        function displayWeatherData(data) {
            cityName.textContent = data.name;
            
            const temp = Math.round(data.main.temp);
            temperature.textContent = `${temp}°${currentUnit === 'metric' ? 'C' : 'F'}`;
            
            humidity.textContent = `${data.main.humidity}%`;
            windSpeed.textContent = `${Math.round(data.wind.speed)}${currentUnit === 'metric' ? 'km/h' : 'mill/s'}`;
            pressure.textContent = `${data.main.pressure}hPa`;
            visibility.textContent = `${(data.visibility / 1000).toFixed(1)}km`;
            weatherDescription.textContent = data.weather[0].description;
            
            updateWeatherIcon(data.weather[0].main);
            updateBackground(data.weather[0].main);
            
            weatherContent.classList.add('fade-in');
            setTimeout(() => {
                weatherContent.classList.remove('fade-in');
            }, 500);
            
            hideLoading();
            weatherContent.style.display = 'block';
        }
        //recent city with local storage
        function addToRecentCities(city) {
            //don't repeat
            if (!recentCities.includes(city)) {
                recentCities.unshift(city);
                
                //save 5 cities
                if (recentCities.length > 5) {
                    recentCities.pop();
                }
                
                //save in localStorage
                localStorage.setItem('recentCities', JSON.stringify(recentCities));
                
                //update
                updateRecentCitiesDisplay();
            }
        }

        //update recent city in ui
        function updateRecentCitiesDisplay() {
            if (recentCities.length > 0) {
                recentList.innerHTML = '';
                recentCities.forEach(city => {
                    const cityElement = document.createElement('div');
                    cityElement.className = 'recent-item';
                    cityElement.textContent = city;
                    cityElement.addEventListener('click', () => {
                        searchInput.value = city;
                        getWeatherData(city);
                    });
                    recentList.appendChild(cityElement);
                });
                recentSearches.style.display = 'block';
            } else {
                recentSearches.style.display = 'none';
            }
        }

        //get location
        function getWeatherByLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async position => {
                        try {
                            showLoading();
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            
                            const response = await fetch(
                               ` https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}&lang=en`
                            );
                            
                            if (!response.ok) {
                                throw new Error('Error with responsive');
                            }
                            
                            const data = await response.json();
                            displayWeatherData(data);
                            
                        } catch (error) {
                            showError("Error with responsive" + error.message);
                            getWeatherData("homs");
                        }
                    },
                    error => {
                        getWeatherData("homs");
                    }
                );
            } else {
                getWeatherData("homs");
            }
        }

        //loading
        function showLoading() {
            loading.style.display = 'block';
            weatherContent.style.display = 'none';
            errorDiv.style.display = 'none';
        }

        //hide loading
        function hideLoading() {
            loading.style.display = 'none';
        }

        //error
        function showError(message) {
            loading.style.display = 'none';
            weatherContent.style.display = 'none';
            errorDiv.style.display = 'block';
            errorMessage.textContent = message;
        }

        //when start
        document.addEventListener('DOMContentLoaded', function() {
            updateDate();
            updateRecentCitiesDisplay();
            getWeatherByLocation();
            
            
            searchBtn.addEventListener('click', function() {
                const city = searchInput.value.trim();
                if (city) {
                    getWeatherData(city);
                }
            });
            
            
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const city = searchInput.value.trim();
                    if (city) {
                        getWeatherData(city);
                    }
                }
            });
            
           
            celsiusBtn.addEventListener('click', function() {
                if (currentUnit !== 'metric') {
                    currentUnit = 'metric';
                    celsiusBtn.classList.add('active');
                    fahrenheitBtn.classList.remove('active');
                    
                    
                    const currentCity = cityName.textContent;
                    if (currentCity !== '') {
                        getWeatherData(currentCity);
                    }
                }
            });
            
            fahrenheitBtn.addEventListener('click', function() {
                if (currentUnit !== 'imperial') {
                    currentUnit = 'imperial';
                    fahrenheitBtn.classList.add('active');
                    celsiusBtn.classList.remove('active');
                    
                    
                    const currentCity = cityName.textContent;
                    if (currentCity !== '') {
                        getWeatherData(currentCity);
                    }
                }
            });
        });
    