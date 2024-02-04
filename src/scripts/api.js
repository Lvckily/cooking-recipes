import axios from 'axios';

// set base URL
axios.defaults.baseURL = 'https://www.themealdb.com/api/json/v1/1';

// Kategori makanan
export const fetchCategories = async () => {
  try {
    const response = await axios.get('/categories.php');
    return response.data.categories; // Mengembalikan array kategori makanan
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// makanan dengan kategori
export const fetchMealsByCategory = async (category) => {
  try {
    const response = await axios.get(`/filter.php?c=${category}`);
    return response.data.meals; // Mengembalikan array makanan berdasarkan kategori
  } catch (error) {
    console.error(`Error fetching meals for category ${category}:`, error);
    throw error;
  }
};

// detail makanan berdasarkan ID
export const fetchMealDetailsById = async (mealId) => {
  try {
    const response = await axios.get(`/lookup.php?i=${mealId}`);
    return response.data.meals[0]; // Mengembalikan detail makanan pertama dari hasil
  } catch (error) {
    console.error(`Error fetching meal details for meal ID ${mealId}:`, error);
    throw error;
  }
};
