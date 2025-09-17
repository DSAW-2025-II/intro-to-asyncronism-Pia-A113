// script.js
const pokedexContainer = document.getElementById('pokedex');

const totalPokemons = 1118; // Update this if new Pokémon are added

// Function to fetch individual Pokémon data
async function fetchPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();
  return data;
}

// Function to create Pokémon card with ID and abilities
function createPokemonCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon';

  // ID number at the top
  const idNumber = document.createElement('div');
  idNumber.innerText = `#${pokemon.id.toString().padStart(3, '0')}`; // e.g., #001
  idNumber.style.fontWeight = 'bold';

  // Pokémon image
  const img = document.createElement('img');
  img.src = pokemon.sprites.front_default || '';
  img.alt = pokemon.name;

  // Name
  const name = document.createElement('h3');
  name.innerText = pokemon.name;

  // Abilities at the bottom
  const abilitiesDiv = document.createElement('div');
  abilitiesDiv.style.marginTop = '10px';

  // Get ability names
  const abilityNames = pokemon.abilities.map(a => a.ability.name);
  abilitiesDiv.innerText = 'Abilities: ' + abilityNames.join(', ');

  // Append all elements to card
  card.appendChild(idNumber);
  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(abilitiesDiv);

  // Optional: add click event to go to details page
  card.addEventListener('click', () => {
    localStorage.setItem('selectedPokemonId', pokemon.id);
    window.location.href = 'pokemon-details.html';
  });

  return card;
}

// Load all Pokémon
async function loadAllPokemon() {
  for (let i = 1; i <= totalPokemons; i++) {
    try {
      const pokemon = await fetchPokemon(i);
      const card = createPokemonCard(pokemon);
      pokedexContainer.appendChild(card);
    } catch (error) {
      console.error(`Error loading Pokémon ID ${i}:`, error);
    }
  }
}

// Initialize loading
loadAllPokemon();

// Search functionality
document.getElementById('search-button').addEventListener('click', async () => {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  if (!query) {
    alert('Please enter a search term.');
    return;
  }

  // Clear current Pokémon display
  pokedexContainer.innerHTML = '';

  // Check if query is number (ID)
  if (/^\d+$/.test(query)) {
    // Search by ID
    try {
      const pokemon = await fetchPokemon(query);
      const card = createPokemonCard(pokemon);
      pokedexContainer.appendChild(card);
    } catch (error) {
      alert('Pokémon not found.');
    }
  } else {
    // Search by name
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      if (response.ok) {
        const pokemon = await response.json();
        const card = createPokemonCard(pokemon);
        pokedexContainer.appendChild(card);
        return;
      }
    } catch (error) {
      // Not found by name
    }

    // Search by ability
    try {
      const abilityResponse = await fetch(`https://pokeapi.co/api/v2/ability/${query}`);
      if (abilityResponse.ok) {
        const abilityData = await abilityResponse.json();
        const pokemons = abilityData.pokemon;

        // Show Pokémon with this ability
        for (const p of pokemons) {
          const pokemonData = await fetch(p.pokemon.url);
          const card = createPokemonCard(pokemonData);
          pokedexContainer.appendChild(card);
        }
        return;
      }
    } catch (error) {
      // Ability not found
    }

    // If none found
    alert('Pokémon, ID, or ability not found.');
  }
});