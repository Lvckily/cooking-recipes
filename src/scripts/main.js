import axios from 'axios';
import { fetchCategories, fetchMealsByCategory, fetchMealDetailsById } from './api';

axios.defaults.baseURL = 'https://www.themealdb.com/api/json/v1/1';

let currentCategory = null;
let showAllMeals = false;

// fungsi render kategori
const renderCategories = async () => {
  try {
    const categories = await fetchCategories();
    const categoriesContainer = document.getElementById('categories');
    const categoryDropdown = document.getElementById('categoryDropdown');

    categoriesContainer.innerHTML = '';
    categoryDropdown.innerHTML = '';

    // membuat tombol ketegori makanan "all"
    const allCategoryButton = document.createElement('a');
    allCategoryButton.textContent = 'All';
    allCategoryButton.addEventListener('click', async () => {
      showAllMeals = false;
      await renderMealsByCategory('');
      highlightCategory(allCategoryButton);
    });
    categoriesContainer.appendChild(allCategoryButton);

    // membuat opsi "all" pada dropdown
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All';
    categoryDropdown.appendChild(allOption);

    // membuat pilihan kategori untuk menu dropdown
    categories.forEach((category) => {
      const categoryElement = document.createElement('a');
      categoryElement.textContent = category.strCategory;
      categoryElement.addEventListener('click', async () => {
        showAllMeals = false;
        await renderMealsByCategory(category.strCategory);
        highlightCategory(categoryElement);
      });
      categoriesContainer.appendChild(categoryElement);

      const option = document.createElement('option');
      option.value = category.strCategory;
      option.textContent = category.strCategory;
      categoryDropdown.appendChild(option);
    });

    highlightCategory(allCategoryButton);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const highlightCategory = (categoryElement) => {
  if (currentCategory) {
    currentCategory.classList.remove('active');
  }
  if (categoryElement) {
    categoryElement.classList.add('active');
    currentCategory = categoryElement;
  }
};

// fungsi render makanan berdasarkan kategori
const renderMealsByCategory = async (category) => {
  const mealsContainer = document.getElementById('meals');

  if (!mealsContainer) {
    console.error('Meals container not found!');
    return;
  }

  mealsContainer.innerHTML = '';

  try {
    let meals;

    if (!category) {
      const response = await axios.get('/search.php?s=');
      meals = response.data.meals || [];
    } else {
      meals = await fetchMealsByCategory(category);
    }

    if (meals.length === 0) {
      console.error(`No meals found for category: ${category}`);
      return;
    }

    // mengatur rendering jumlah card dan baris
    const maxRowsToShow = 1;
    const maxCardsPerRow = 5;
    let currentRow = document.createElement('div');
    currentRow.classList.add('meal-row');
    let mealsToShow = meals;

    if (!showAllMeals) {
      mealsToShow = meals.slice(0, maxRowsToShow * maxCardsPerRow);
    }

    const displayedMealIds = new Set();

    mealsToShow.forEach((meal, index) => {
      if (!displayedMealIds.has(meal.idMeal)) {
        const mealCard = document.createElement('div');
        mealCard.classList.add('meal-card');
        mealCard.innerHTML = `
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <h3>${meal.strMeal}</h3>
        `;
        currentRow.appendChild(mealCard);

        displayedMealIds.add(meal.idMeal);

        // event listener menuju halaman detail
        mealCard.addEventListener('click', async () => {
          try {
            const mealDetails = await fetchMealDetailsById(meal.idMeal);
            if (mealDetails) {
              window.location.href = `info.html?id=${meal.idMeal}`;
            } else {
              console.error(`Meal details not found for ID: ${meal.idMeal}`);
            }
          } catch (error) {
            console.error('Error fetching meal details:', error);
          }
        });

        if ((index + 1) % maxCardsPerRow === 0 || index === mealsToShow.length - 1) {
          mealsContainer.appendChild(currentRow);
          currentRow = document.createElement('div');
          currentRow.classList.add('meal-row');
        }
      }
    });

    // tombol "show all" dan "show less"
    if (!showAllMeals && meals.length > maxRowsToShow * maxCardsPerRow) {
      const showMoreButton = document.createElement('button');
      showMoreButton.innerHTML = 'Show More &#9698;';
      showMoreButton.addEventListener('click', () => {
        showAllMeals = true;
        renderMealsByCategory(category);
      });
      mealsContainer.appendChild(showMoreButton);
    } else if (showAllMeals) {
      const showLessButton = document.createElement('button');
      showLessButton.innerHTML = 'Show Less &#9701;';
      showLessButton.addEventListener('click', () => {
        showAllMeals = false;
        renderMealsByCategory(category);
      });
      mealsContainer.appendChild(showLessButton);
    }
  } catch (error) {
    console.error('Error fetching meals:', error);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await renderCategories();
  await renderMealsByCategory('');

  const searchInput = document.getElementById('recipes');
  const recipesBodyInput = document.getElementById('recipes-body');
  const categoryDropdown = document.getElementById('categoryDropdown');
  const categories = document.getElementById('categories');

  // mengatur tampilan responsif
  const handleScreenSize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      categoryDropdown.style.display = 'flex';
      categoryDropdown.style.color = '#5F6F52';
      categories.style.display = 'none';
    } else {
      categoryDropdown.style.display = 'none';
      categories.style.display = 'flex';
    }
  };

  handleScreenSize();
  window.addEventListener('resize', handleScreenSize);

  categoryDropdown.addEventListener('change', async (event) => {
    const selectedCategory = event.target.value;
    showAllMeals = false;
    await renderMealsByCategory(selectedCategory);
    highlightCategory(); 
  });

  searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.trim();

    if (searchTerm !== '') {
      renderMealsBySearch(searchTerm);
    } else {
      renderMealsByCategory(currentCategory ? currentCategory.textContent : '');
    }
  });

  recipesBodyInput.addEventListener('input', async (event) => {
    const searchTerm = event.target.value.trim();

    if (searchTerm !== '') {
      showAllMeals = true;
      await renderMealsBySearch(searchTerm);
    } else {
      await renderMealsByCategory(currentCategory ? currentCategory.textContent : '');
    }
  });
});

// fungsi render makanan dari pencarian
const renderMealsBySearch = async (searchTerm) => {
  const mealsContainer = document.getElementById('meals');

  if (!mealsContainer) {
    console.error('Meals container not found!');
    return;
  }

  mealsContainer.innerHTML = '';

  try {
    const response = await axios.get(`/search.php?s=${searchTerm}`);
    const meals = response.data.meals;

    if (!meals) {
      console.error(`No meals found for search term: ${searchTerm}`);
      return;
    }

    renderMeals(meals, mealsContainer);
  } catch (error) {
    console.error('Error fetching meals by search:', error);
  }
};

const renderMeals = (meals, mealsContainer) => {
  const maxCardsPerRow = 5;
  let currentRow = document.createElement('div');
  currentRow.classList.add('meal-row');
  let cardsInCurrentRow = 0;

  meals.forEach((meal) => {
    const mealCard = document.createElement('div');
    mealCard.classList.add('meal-card');
    mealCard.dataset.mealId = meal.idMeal; 
    mealCard.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
    `;
    currentRow.appendChild(mealCard);
    cardsInCurrentRow++;

    // Tambahkan event listener untuk setiap kartu makanan
    mealCard.addEventListener('click', async () => {
      try {
        const mealDetails = await fetchMealDetailsById(meal.idMeal);
        if (mealDetails) {
          window.location.href = `info.html?id=${meal.idMeal}`;
        } else {
          console.error(`Meal details not found for ID: ${meal.idMeal}`);
        }
      } catch (error) {
        console.error('Error fetching meal details:', error);
      }
    });

    if (cardsInCurrentRow === maxCardsPerRow) {
      mealsContainer.appendChild(currentRow);
      currentRow = document.createElement('div');
      currentRow.classList.add('meal-row');
      cardsInCurrentRow = 0;
    }
  });

  if (cardsInCurrentRow > 0) {
    mealsContainer.appendChild(currentRow);
  }
};
