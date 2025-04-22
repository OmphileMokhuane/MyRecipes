let dataset = [];

async function fetchRecipes() {
    const loader = document.getElementById('js-preloader');
    if (!loader) {
        console.error('Loader element not found');
        return;
    }

    try { 
        // Show loader
        loader.classList.remove('loaded');
        
        console.log('Attempting to fetch recipes...');
        const response = await fetch('http://localhost:3000/api/recipes');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        dataset = data;
        console.log('Fetched recipes:', dataset);
        
        if (dataset.length === 0) {
            console.warn('No recipes found in the database.');
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
        document.getElementById('recipe-grid').innerHTML = 
            `<div class="error-message">
                <p>Error loading recipes: ${error.message}</p>
                <p>Please check that the server is running.</p>
            </div>`;
    } finally {
        // Hide loader
        loader.classList.add('loaded');
    }
}

// Initial fetch and display
fetchRecipes().then(() => {
    createRecipeCards();
    
    // Add event listener for the "Add Recipe" button
    document.querySelector('header nav ul li a').addEventListener('click', function(event) {
        event.preventDefault();
        openAddRecipeModal();
    });
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
            <div class="recipe-meta">
                <p><i class="far fa-clock"></i> ${recipe.time}</p>
                <p><i class="fas fa-utensils"></i> ${recipe.serving}</p>
                <p><i class="fas fa-signal"></i> ${recipe.difficulty}</p>
            </div>
            <div class="description">
                <p>${recipe.description}</p>
            </div>
            <h3>Ingredients</h3>
            <ul class="ingredients">
                ${recipe.ingredients.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <h3>Instructions</h3>
            <ol class="instructions">
                ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
            </ol>
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

function openAddRecipeModal(){
    const modal = document.getElementById('add-recipe-modal');

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" id="closeModal">&times;</span>
            <h2>Add New Recipe</h2>
            <form id="add-recipe-form">
                <div class="form-group">
                    <label for="title">Recipe Title</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="image">Image URL</label>
                    <input type="text" id="image" name="image" required>
                </div>
                <div class="form-group">
                    <label for="time">Cooking Time</label>
                    <input type="text" id="time" name="time" placeholder="e.g. 30 minutes" required>
                </div>
                <div class="form-group">
                    <label for="serving">Servings</label>
                    <input type="text" id="serving" name="serving" placeholder="e.g. 4 servings" required>
                </div>
                <div class="form-group">
                    <label for="difficulty">Difficulty</label>
                    <select id="difficulty" name="difficulty" required>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="ingredients">Ingredients (one per line)</label>
                    <textarea id="ingredients" name="ingredients" rows="5" placeholder="1 cup flour&#10;2 eggs&#10;1/2 cup sugar" required></textarea>
                </div>
                <div class="form-group">
                    <label for="instructions">Instructions (one step per line)</label>
                    <textarea id="instructions" name="instructions" rows="5" placeholder="Mix dry ingredients&#10;Add wet ingredients&#10;Bake at 350°F for 25 minutes" required></textarea>
                </div>
                <button type="submit" class="submit-btn">Add Recipe</button>
            </form>
        </div>
    `;

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

    // Handle form submission
    document.getElementById('add-recipe-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const newRecipe = {
            id: dataset.length > 0 ? Math.max(...dataset.map(r => r.id)) + 1 : 1,
            title: document.getElementById('title').value,
            image: document.getElementById('image').value,
            time: document.getElementById('time').value,
            serving: document.getElementById('serving').value,
            difficulty: document.getElementById('difficulty').value,
            description: document.getElementById('description').value,
            ingredients: document.getElementById('ingredients').value.split('\n').filter(line => line.trim() !== ''),
            instructions: document.getElementById('instructions').value.split('\n').filter(line => line.trim() !== '')
        };

        // Send POST request to add recipe
        submitNewRecipe(newRecipe);
    });
}

async function submitNewRecipe(recipe) {
    const loader = document.getElementById('js-preloader');
    if (!loader) {
        console.error('Loader element not found');
        return;
    }

    try {
        // Show loader
        loader.classList.remove('loaded');
        
        console.log('Attempting to submit recipe:', recipe);
        
        const response = await fetch('http://localhost:3000/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        await fetchRecipes();
        createRecipeCards();
        
        document.getElementById('add-recipe-modal').classList.add('hidden');
        alert('Recipe added successfully!');
    } catch (error) {
        console.error('Error adding recipe:', error);
        alert(`Error adding recipe: ${error.message}`);
    } finally {
        // Hide loader
        loader.classList.add('loaded');
    }
}