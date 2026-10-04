const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsDiv = document.getElementById('results');

// Task 6: fetch the JSON data
function fetchData() {
  return fetch('travel_recommendation_api.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    });
}

// Test: shows the data in the browser console (F12)
fetchData()
  .then(data => console.log('Travel data:', data))
  .catch(error => console.error('Error fetching data:', error));

// Task 10 (optional): time zones by place name
const timeZones = {
  'australia': 'Australia/Sydney', 'sydney': 'Australia/Sydney', 'melbourne': 'Australia/Melbourne',
  'japan': 'Asia/Tokyo', 'tokyo': 'Asia/Tokyo', 'kyoto': 'Asia/Tokyo',
  'brazil': 'America/Sao_Paulo', 'rio': 'America/Sao_Paulo', 'são paulo': 'America/Sao_Paulo',
  'cambodia': 'Asia/Phnom_Penh', 'angkor': 'Asia/Phnom_Penh',
  'india': 'Asia/Kolkata', 'taj mahal': 'Asia/Kolkata',
  'french polynesia': 'Pacific/Tahiti', 'bora bora': 'Pacific/Tahiti',
  'brasil': 'America/Sao_Paulo', 'copacabana': 'America/Sao_Paulo'
};

function getTime(name) {
  const lower = name.toLowerCase();
  for (const key in timeZones) {
    if (lower.includes(key)) {
      const options = { timeZone: timeZones[key], hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
      return new Date().toLocaleTimeString('en-US', options);
    }
  }
  return null;
}

// Build one result card
function createCard(item) {
  const time = getTime(item.name);
  const fallback = 'https://picsum.photos/seed/' + encodeURIComponent(item.name) + '/400/250';
  return `
    <div class="card">
      <img src="${item.imageUrl}" alt="${item.name}" onerror="this.onerror=null;this.src='${fallback}';">
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        ${time ? `<p class="time">Local time: ${time}</p>` : ''}
      </div>
    </div>`;
}

// Tasks 7 and 8: keyword search
function searchRecommendations() {
  const keyword = searchInput.value.trim().toLowerCase();

  if (!keyword) {
    resultsDiv.innerHTML = '<p class="message">Please enter a keyword such as beach, temple or country.</p>';
    return;
  }

  fetchData()
    .then(data => {
      let results = [];

      if (keyword.includes('beach')) {                 // beach, beaches, Beach, BEACH
        results = data.beaches;
      } else if (keyword.includes('temple')) {         // temple, temples
        results = data.temples;
      } else if (keyword.includes('countr')) {         // country, countries
        data.countries.forEach(country => results.push(...country.cities));
      } else {
        // Bonus: match a specific country or city name, e.g. "japan"
        data.countries.forEach(country => {
          if (country.name.toLowerCase().includes(keyword)) {
            results.push(...country.cities);
          } else {
            country.cities.forEach(city => {
              if (city.name.toLowerCase().includes(keyword)) results.push(city);
            });
          }
        });
        [...data.beaches, ...data.temples].forEach(place => {
          if (place.name.toLowerCase().includes(keyword)) results.push(place);
        });
      }

      if (results.length === 0) {
        resultsDiv.innerHTML = '<p class="message">No recommendations found. Try "beach", "temple" or "country".</p>';
      } else {
        resultsDiv.innerHTML = results.map(createCard).join('');
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      resultsDiv.innerHTML = '<p class="message">Something went wrong. Please try again.</p>';
    });
}

// Task 9: clear results
function clearResults() {
  resultsDiv.innerHTML = '';
  searchInput.value = '';
}

// Results only appear after clicking Search
searchBtn.addEventListener('click', searchRecommendations);
clearBtn.addEventListener('click', clearResults);