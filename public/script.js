let dataset = [];

async function fetchRecipes() {
    try { 
        const response = await fetch('http://localhost:3000/api/recipes');
        const data = await response.json();
        dataset = data; // Store the fetched data in dataset
        console.log('Fetched recipes:', dataset); // Debug log
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}

// Initial fetch and display
fetchRecipes().then(() => {
    createRecipeCards();
});

// Function to show recipe cards
function createRecipeCards(){
    const recipeGrid = document.getElementById('recipe-grid');
    // Clear previous cards
    recipeGrid.innerHTML = '';
    
    if (dataset.length === 0) {
        recipeGrid.innerHTML = '<p>No recipes found</p>';
        return;
    }
    
    dataset.forEach(recipe => {
        recipeGrid.innerHTML += `
          <a href="#" class="recipe-card" data-id="${recipe.id}">
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <h3>${recipe.title}</h3>
            <p><i class="far fa-clock"></i> ${recipe.time}</p>
            <p><i class="fas fa-utensils"></i> ${recipe.serving}</p>
            <span class="difficulty">${recipe.difficulty}</span>
          </a>`;
    });

    //Add event listeners to recipe cards
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', function(event) {
            event.preventDefault();
            const recipeId = this.getAttribute('data-id');
            openRecipeInfoModal(recipeId);
        });
    });
}

function openRecipeInfoModal(recipeId) {
    const recipe = dataset.find(r => r.id === parseInt(recipeId));
    if (!recipe) return;

    const modal = document.getElementById('recipeModal');
    modal.innerHTML = `
            <div class="modal-content">
            <span class="close" id="closeModal">&times;</span>
            <h2>${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}">
            <p><i class="far fa-clock"></i> ${recipe.time}</p>
            <p>${recipe.description}</p>
            <h3>Ingredients:</h3>
            <ul>${recipe.ingredients.map(item => `<li>${item}</li>`).join('')}</ul>
            <h3>Instructions:</h3>
            <ol>${recipe.instructions.map(step => `<li>${step}</li>`).join('')}</ol>
            </div>`;

    // show modal
    modal.classList.remove('hidden'); 

    // Hide modal on close button click
    document.getElementById('closeModal').addEventListener('click', function() {
        modal.classList.add('hidden');
    });

    // Hide modal on outside click
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
}