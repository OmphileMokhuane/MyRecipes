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