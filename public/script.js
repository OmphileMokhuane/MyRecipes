let dataset = [];

async function fetchRecipes() {
    const loader = document.getElementById('js-preloader');
    const recipeGrid = document.getElementById('recipe-grid');

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
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        dataset = data;
        console.log('Fetched recipes:', dataset);
        
        if (dataset.length === 0) {
            recipeGrid.innerHTML = `
                <div class="no-recipes">
                    <p>No recipes found in the database.</p>
                    <button onclick="openAddRecipeModal()" class="add-recipe-btn">
                        Add Your First Recipe
                    </button>
                </div>
            `;
            return;
        }

        createRecipeCards();
    } catch (error) {
        console.error('Error fetching recipes:', error);
        recipeGrid.innerHTML = `
            <div class="error-message">
                <p>Error loading recipes: ${error.message}</p>
                <p>Please try the following:</p>
                <ul>
                    <li>Check your internet connection</li>
                    <li>Make sure the server is running</li>
                    <li>Try refreshing the page</li>
                </ul>
                <button onclick="fetchRecipes()" class="retry-btn">Try Again</button>
            </div>
        `;
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
                    <div class="error-message" id="title-error"></div>
                </div>
                <div class="form-group">
                    <label for="image">Image URL</label>
                    <input type="url" id="image" name="image" required>
                    <div class="error-message" id="image-error"></div>
                </div>
                // ... existing form groups ...
                <div class="form-group">
                    <label for="ingredients">Ingredients (one per line)</label>
                    <textarea id="ingredients" name="ingredients" rows="5" required></textarea>
                    <div class="error-message" id="ingredients-error"></div>
                </div>
                <div class="form-group">
                    <label for="instructions">Instructions (one step per line)</label>
                    <textarea id="instructions" name="instructions" rows="5" required></textarea>
                    <div class="error-message" id="instructions-error"></div>
                </div>
                <div class="form-errors" id="form-errors"></div>
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
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.getElementById('form-errors').textContent = '';
        
        // Validate form fields
        const title = document.getElementById('title').value.trim();
        const image = document.getElementById('image').value.trim();
        const ingredients = document.getElementById('ingredients').value.trim();
        const instructions = document.getElementById('instructions').value.trim();
        
        let isValid = true;
        
        if (!title) {
            document.getElementById('title-error').textContent = 'Recipe title is required';
            isValid = false;
        }
        
        if (!image) {
            document.getElementById('image-error').textContent = 'Image URL is required';
            isValid = false;
        } else if (!isValidUrl(image)) {
            document.getElementById('image-error').textContent = 'Please enter a valid URL';
            isValid = false;
        }
        
        if (!ingredients) {
            document.getElementById('ingredients-error').textContent = 'At least one ingredient is required';
            isValid = false;
        }

        if (!instructions) {
            document.getElementById('instructions-error').textContent = 'At least one instruction step is required';
            isValid = false;
        }
        
        if (!isValid) {
            document.getElementById('form-errors').textContent = 'Please correct the errors above';
            return;
        }
        
        // Get form values and submit if valid
        const newRecipe = {
            id: dataset.length > 0 ? Math.max(...dataset.map(r => r.id)) + 1 : 1,
            title: title,
            image: image,
            time: document.getElementById('time').value,
            serving: document.getElementById('serving').value,
            difficulty: document.getElementById('difficulty').value,
            description: document.getElementById('description').value,
            ingredients: ingredients.split('\n').filter(line => line.trim() !== ''),
            instructions: instructions.split('\n').filter(line => line.trim() !== '')
        };
        
        submitNewRecipe(newRecipe);
    });
}

async function submitNewRecipe(recipe) {
    const loader = document.getElementById('js-preloader');
    const modal = document.getElementById('add-recipe-modal');
    
    if (!loader) {
        console.error('Loader element not found');
        return;
    }

    try {
        loader.classList.remove('loaded');
        
        const response = await fetch('http://localhost:3000/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server returned ${response.status}`);
        }

        await fetchRecipes();
        modal.classList.add('hidden');
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Recipe added successfully!';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
        
    } catch (error) {
        console.error('Error adding recipe:', error);
        document.getElementById('form-errors').textContent = 
            `Error adding recipe: ${error.message}. Please try again.`;
    } finally {
        loader.classList.add('loaded');
    }
}