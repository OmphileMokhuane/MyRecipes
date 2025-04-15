let dataset = [];

function createRecipeCards(){
    const recipeGrid = document.getElementById('recipe-grid');
    recipeGrid.innerHTML = ''; // Clear previous cards
    
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
            event.preventDefault(); // Prevent default anchor behavior
            const recipeId = this.getAttribute('data-id');
            showRecipeDetails(recipeId);
        });
    });
}

function openRecipeInfoModal() {
    const recipe = dataset.find(r => r.id === recipeId);
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