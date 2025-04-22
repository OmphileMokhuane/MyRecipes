const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = 'recipe.db';

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Add CSP headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "connect-src 'self' http://localhost:3000;"
    );
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

// Check & create table + insert dummy data if needed
function initializeDatabase() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            image TEXT,
            time TEXT,
            serving TEXT,
            difficulty TEXT,
            description TEXT,
            ingredients TEXT,
            instructions TEXT,
            category TEXT
        )
    `;
  
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
            return;
        }
  
        console.log('Table check/creation complete.');
    
        // Check if there is any data in the table
        db.get('SELECT COUNT(*) AS count FROM recipes', (err, row) => {
            if (err) {
            console.error('Error checking recipe count:', err.message);
            return;
            }
    
            if (row.count === 0) {
            insertDummyRecipes();
            } else {
                // Check if existing recipes have category field
                db.get('SELECT category FROM recipes LIMIT 1', (err) => {
                    if (err && err.message.includes('no such column')) {
                        // Add category column if it doesn't exist
                        db.run('ALTER TABLE recipes ADD COLUMN category TEXT', (err) => {
                            if (err) {
                                console.error('Error adding category column:', err.message);
                            } else {
                                console.log('Added category column to existing recipes table');
                                updateExistingRecipesWithCategories();
                            }
                        });
                    } else {
                        console.log('Category column already exists in recipes table');
                    }
                });
                console.log(`Database already has ${row.count} recipes.`);
            }
        });
    });
}

// Function to add categories to existing recipes
function updateExistingRecipesWithCategories() {
    const categories = ['Dinner', 'Lunch', 'Dinner', 'Lunch']; // Default categories for the 4 existing recipes
    
    db.all('SELECT id FROM recipes', [], (err, rows) => {
        if (err) {
            console.error('Error selecting recipes for category update:', err.message);
            return;
        }
        
        rows.forEach((row, index) => {
            const category = categories[index % categories.length];
            db.run('UPDATE recipes SET category = ? WHERE id = ?', [category, row.id], (err) => {
                if (err) {
                    console.error(`Error updating category for recipe ID ${row.id}:`, err.message);
                }
            });
        });
        
        console.log('Updated existing recipes with default categories');
    });
}
  
function insertDummyRecipes() {
    const recipes = [
      {
        title: "Butter Chicken",
        image: "/images/food_images/butter_chicken.jpg",
        time: "45 minutes",
        serving: "4 servings",
        difficulty: "Medium",
        description: "A rich and creamy North Indian curry made with tender chicken pieces in a tomato-based sauce with butter and cream. This popular dish is known for its mild, slightly sweet flavor and velvety texture.",
        ingredients: JSON.stringify([
          "500g boneless chicken thighs, cut into pieces",
          "1 cup plain yogurt",
          "2 tbsp lemon juice",
          "2 tsp turmeric powder",
          "2 tbsp garam masala",
          "2 tbsp cumin powder",
          "4 tbsp butter",
          "1 large onion, finely chopped",
          "3 cloves garlic, minced",
          "2 tbsp ginger, grated",
          "2 cups tomato puree",
          "1 cup heavy cream",
          "Salt to taste",
          "Fresh cilantro for garnish"
        ]),
        instructions: JSON.stringify([
          "Marinate chicken in yogurt, lemon juice, turmeric, 1 tbsp garam masala, and 1 tbsp cumin for at least 2 hours.",
          "Heat 2 tbsp butter in a large pan and cook marinated chicken until golden. Remove and set aside.",
          "In the same pan, add remaining butter and sauté onions until translucent.",
          "Add garlic and ginger, cook for 1-2 minutes until fragrant.",
          "Stir in tomato puree, remaining garam masala and cumin. Simmer for 15 minutes.",
          "Return chicken to the pan, cook for 10 minutes.",
          "Reduce heat and stir in cream. Simmer for 5 minutes.",
          "Season with salt to taste and garnish with fresh cilantro before serving."
        ]),
        category: "Dinner"
      },
      {
        title: "Tacos",
        image: "/images/food_images/tacos.jpg",
        time: "30 minutes",
        serving: "6 servings",
        difficulty: "Easy",
        description: "Delicious Mexican street-style tacos with seasoned meat, fresh vegetables, and zesty toppings. These handheld delights are perfect for a casual dinner or festive gathering.",
        ingredients: JSON.stringify([
          "500g ground beef or shredded chicken",
          "12 small corn or flour tortillas",
          "1 packet taco seasoning",
          "1 cup lettuce, shredded",
          "1 cup tomatoes, diced",
          "1/2 cup red onion, finely chopped",
          "1 cup cheddar cheese, shredded",
          "1 avocado, sliced",
          "1/4 cup fresh cilantro, chopped",
          "2 limes, cut into wedges",
          "Sour cream for topping",
          "Hot sauce to taste"
        ]),
        instructions: JSON.stringify([
          "Cook meat in a skillet over medium heat until browned, breaking it apart as it cooks.",
          "Add taco seasoning and 3/4 cup water, simmer until water is reduced and meat is fully coated.",
          "Warm tortillas in a dry pan or microwave for 10-15 seconds.",
          "Assemble tacos by placing meat in tortillas and topping with lettuce, tomatoes, onions, cheese, and avocado.",
          "Garnish with cilantro, a squeeze of lime juice, sour cream, and hot sauce.",
          "Serve immediately while still warm."
        ]),
        category: "Lunch"
      },
      {
        title: "Egg Fried Rice",
        image: "/images/food_images/egg_fried_rice.jpg",
        time: "20 minutes",
        serving: "4 servings",
        difficulty: "Easy",
        description: "A quick and satisfying Asian dish made with leftover rice, scrambled eggs, vegetables, and savory seasonings. This versatile one-pan meal can be customized with your favorite proteins and vegetables.",
        ingredients: JSON.stringify([
          "4 cups cooked rice (preferably day-old, cold rice)",
          "3 eggs, beaten",
          "2 tbsp vegetable oil",
          "2 cloves garlic, minced",
          "1 small onion, diced",
          "1/2 cup carrots, diced",
          "1/2 cup frozen peas",
          "3 green onions, chopped",
          "2-3 tbsp soy sauce",
          "1 tbsp sesame oil",
          "1/2 tsp white pepper",
          "Salt to taste"
        ]),
        instructions: JSON.stringify([
          "Break up any clumps in the cold rice with your hands or a fork.",
          "Heat 1 tbsp oil in a wok or large pan over high heat. Add beaten eggs and scramble until just cooked. Remove and set aside.",
          "Add remaining oil to the pan. Sauté garlic and onion until fragrant.",
          "Add carrots and stir-fry for 2 minutes, then add peas and cook for another minute.",
          "Add rice to the pan, breaking up any clumps. Stir-fry for 3-4 minutes until the rice is heated through.",
          "Return scrambled eggs to the pan and mix well.",
          "Add soy sauce, sesame oil, white pepper, and salt. Toss until everything is well combined.",
          "Stir in green onions and cook for another minute.",
          "Taste and adjust seasonings as needed before serving."
        ]),
        category: "Quick & Easy"
      },
      {
        title: "Gourmet Burger",
        image: "/images/food_images/burger.jpg",
        time: "35 minutes",
        serving: "4 servings",
        difficulty: "Medium",
        description: "A juicy homemade burger with all the fixings, guaranteed to satisfy your cravings. This isn't your average fast-food burger - thick patties, quality ingredients, and thoughtful assembly make this a restaurant-quality meal at home.",
        ingredients: JSON.stringify([
          "800g ground beef (80/20 fat ratio)",
          "4 burger buns, preferably brioche",
          "Salt and pepper to taste",
          "1 tbsp Worcestershire sauce",
          "1 tsp garlic powder",
          "4 slices cheddar or American cheese",
          "4 lettuce leaves",
          "2 large tomatoes, sliced",
          "1 red onion, thinly sliced",
          "4 tbsp mayonnaise",
          "2 tbsp ketchup",
          "2 tbsp mustard",
          "8 slices bacon (optional)",
          "4 tbsp butter for toasting buns"
        ]),
        instructions: JSON.stringify([
          "In a bowl, gently mix ground beef with Worcestershire sauce, garlic powder, salt and pepper. Don't overmix.",
          "Divide the mixture into 4 equal portions and form patties slightly larger than your buns, as they'll shrink when cooking.",
          "Make a slight indentation in the center of each patty with your thumb to prevent it from puffing up while cooking.",
          "Heat a cast-iron skillet or grill to medium-high heat. If using bacon, cook it first and set aside.",
          "Cook the patties for 3-4 minutes per side for medium, or adjust to your preferred doneness.",
          "Add cheese slices on top of patties during the last minute of cooking, cover briefly to melt.",
          "Meanwhile, butter the cut sides of the buns and toast them until golden brown.",
          "Mix mayonnaise, ketchup, and mustard to make a sauce. Spread on both bun halves.",
          "Assemble burgers: bottom bun, sauce, lettuce, patty with melted cheese, tomato, onion, bacon (if using), more sauce, top bun.",
          "Serve immediately with your favorite sides."
        ]),
        category: "Lunch"
      }
    ];
  
    const insertSQL = `
      INSERT INTO recipes (title, image, time, serving, difficulty, description, ingredients, instructions, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    recipes.forEach(recipe => {
      db.run(insertSQL, [
        recipe.title,
        recipe.image,
        recipe.time,
        recipe.serving,
        recipe.difficulty,
        recipe.description,
        recipe.ingredients,
        recipe.instructions,
        recipe.category
      ]);
    });
  
    console.log('Inserted 4 delicious recipes.');
}
  
// API endpoint to fetch recipes
app.get('/api/recipes', (req, res) => {
    db.all('SELECT * FROM recipes', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        // Parse ingredients & instructions
        rows = rows.map(row => ({
          ...row,
          ingredients: JSON.parse(row.ingredients),
          instructions: JSON.parse(row.instructions)
        }));
        res.json(rows);
      }
    });
});

// API endpoint to add a new recipe
app.post('/api/recipes', (req, res) => {
  console.log('POST /api/recipes request received');
  console.log('Request body:', req.body);
  
  const { title, image, time, serving, difficulty, description, ingredients, instructions, category } = req.body;
  
  // Validate required fields
  if (!title || !image || !time || !serving || !difficulty || !description || !ingredients || !instructions || !category) {
    console.log('Validation failed: missing required fields');
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Convert arrays to JSON strings for storage
  try {
    const ingredientsJSON = JSON.stringify(ingredients);
    const instructionsJSON = JSON.stringify(instructions);
    
    const insertSQL = `
      INSERT INTO recipes (title, image, time, serving, difficulty, description, ingredients, instructions, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertSQL, 
      [title, image, time, serving, difficulty, description, ingredientsJSON, instructionsJSON, category], 
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: err.message });
        }
        
        console.log('Recipe successfully added with ID:', this.lastID);
        
        // Return the newly created recipe with its ID
        res.status(201).json({
          id: this.lastID,
          title,
          image,
          time,
          serving,
          difficulty,
          description,
          ingredients,
          instructions,
          category
        });
      }
    );
  } catch (error) {
    console.error('Server error in POST /api/recipes:', error);
    res.status(500).json({ error: error.message });
  }
});
  
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});