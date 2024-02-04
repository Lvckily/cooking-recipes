import './component/navbarDetail.js';
import '../style/info.css';
import axios from 'axios';

document.addEventListener('DOMContentLoaded', async () => {
  // parameter mealID dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const mealId = urlParams.get('id');

  if (mealId) {
    // memanggil fungsi fetchMealDetailsById
    try {
      const meal = await fetchMealDetailsById(mealId);
      renderMealDetails(meal);
    } catch (error) {
      console.error('Error fetching meal details:', error);
      renderError('Failed to fetch meal details. Please try again later.');
    }
  } else {
    console.error('Meal ID not found in URL parameters');
    renderError('Meal ID not found in URL parameters');
  }
});

// fungsi fetchMealDetailsById
async function fetchMealDetailsById (mealId) {
  try {
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    const meal = response.data.meals[0];

    // cek data ditemukan atau tidak
    if (!meal) {
      throw new Error('Meal details not found');
    }

    return meal;
  } catch (error) {
    throw new Error(`Failed to fetch meal details: ${error.message}`);
  }
}

// fungsi renderMealDetails
function renderMealDetails (meal) {
  const mealNameElement = document.getElementById('meal-name');
  const mealImageElement = document.getElementById('meal-image');
  const cookingStepsElement = document.getElementById('cooking-steps');
  const mealIngredientsElement = document.getElementById('ingredients');

  // cek DOM Element
  if (!mealNameElement || !mealImageElement || !cookingStepsElement || !mealIngredientsElement) {
    console.error('One or more elements not found');
    return;
  }

  mealNameElement.textContent = `${meal.strMeal}`;

  // instruksi memasak
  if (meal.strInstructions) {
    const cookingSteps = meal.strInstructions.split('\r\n');
    const cookingStepsHtml = cookingSteps.map(step => `<p>${step.trim()}</p>`).join('');
    cookingStepsElement.innerHTML = `<h3>Cooking Steps:</h3>${cookingStepsHtml}`;
  } else {
    cookingStepsElement.innerHTML = '<p>Cooking steps not available</p>';
  }

  // gambar makanan
  const imageUrl = meal.strMealThumb.includes('/preview')
    ? meal.strMealThumb
    : `${meal.strMealThumb}/preview`;

  mealImageElement.src = imageUrl;
  mealImageElement.style.imageRendering = 'crisp-edges';

  // bahan-bahan masakan
  const ingredients = getIngredientsList(meal);
  mealIngredientsElement.innerHTML = `<h3>Ingredients:</h3><ul>${ingredients}</ul>`;
}

// fungsi membuat list bahan-bahan masakan
function getIngredientsList (meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && measure) {
      ingredients.push(`<li>${ingredient} - ${measure}</li>`);
    } else {
      break;
    }
  }
  return ingredients.join('');
}

const renderError = (message) => {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
  }
};
