document.addEventListener('DOMContentLoaded', async () => {
  const categoryButtonsDiv = document.getElementById('categoryButtons');
  const promptsDisplay = document.getElementById('promptsDisplay');
  const logoutButton = document.getElementById('logoutButton');
  const backButton = document.getElementById('backButton');
  const errorDiv = document.getElementById('error');

  let allPrompts = [];
  let currentCategoryPrompts = [];
  let shownPromptsInCategory = []; // IDs of prompts shown in the current session for the current category

  async function checkAuthAndInitialize() {
    if (!window.supabase) {
      showError('Supabase client is not available.');
      return;
    }
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) {
        window.location.href = 'splash.html';
      } else {
        await loadPrompts();
        populateCategories();
      }
    } catch (err) {
      showError(`Authentication error: ${err.message}`);
      console.error("Auth error in magical.js:", err);
    }
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  function clearError() {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }

  async function loadPrompts() {
    try {
      const response = await fetch('prompts.json');
      if (!response.ok) {
        throw new Error(`Failed to load prompts.json: ${response.statusText}`);
      }
      allPrompts = await response.json();
      console.log('Prompts loaded:', allPrompts.length);
    } catch (err) {
      showError(`Error loading prompts: ${err.message}`);
      console.error("Error loading prompts.json:", err);
    }
  }

  function populateCategories() {
    categoryButtonsDiv.innerHTML = '';
    const categories = [...new Set(allPrompts.map(p => p.category))];
    if (categories.length === 0) {
      promptsDisplay.innerHTML = '<p class="placeholder-text">No categories available.</p>';
      return;
    }
    // Category details
    const categoryDetails = {
      'CODING': { icon: '<img src="icons/code-xml.svg" class="category-svg" alt="Coding">', desc: 'Get coding-related prompts' },
      'CREATIVE': { icon: '<img src="icons/component.svg" class="category-svg" alt="Creative">', desc: 'Unleash your creativity' },
      'IMAGE': { icon: '<img src="icons/image-plus.svg" class="category-svg" alt="Image">', desc: 'Generate image prompts' },
      'PSYCHOLOGY': { icon: '<img src="icons/brain.svg" class="category-svg" alt="Psychology">', desc: 'Explore psychology prompts' }
    };
    categories.sort().forEach(category => {
      const upper = category.toUpperCase();
      const details = categoryDetails[upper] || { icon: '✨', desc: '' };
      const card = document.createElement('button');
      card.className = 'category-card';
      card.innerHTML = `
        <span class="category-emoji">${details.icon}</span>
        <span class="category-info">
          <span class="category-title">${upper}</span>
          <span class="category-desc">${details.desc}</span>
        </span>
      `;
      card.addEventListener('click', () => handleCategorySelect(category));
      categoryButtonsDiv.appendChild(card);
    });
  }

  function handleCategorySelect(category) {
    // Hide category buttons after selection
    categoryButtonsDiv.style.display = 'none';
    // Show prompts for selected category
    displayPromptsForButton(category);
  }

  function displayPromptsForButton(category) {
    currentCategoryPrompts = allPrompts.filter(p => p.category === category);
    shownPromptsInCategory = [];
    promptsDisplay.innerHTML = '';
    // Show prompts for the selected category
    displayPrompts(true, category);
  }

  function displayPrompts(isNewCategory = false, forcedCategory = null) {
    clearError();
    if (isNewCategory) {
      promptsDisplay.innerHTML = '';
      shownPromptsInCategory = [];
    }
    const selectedCategory = forcedCategory;
    if (!selectedCategory) {
      promptsDisplay.innerHTML = '<p class="placeholder-text">Please select a category first.</p>';
      return;
    }
    currentCategoryPrompts = allPrompts.filter(p => p.category === selectedCategory);
    
    // Filter out prompts already shown in this session for this category
    const availablePrompts = currentCategoryPrompts.filter(p => !shownPromptsInCategory.includes(p.id));

    if (availablePrompts.length === 0) {
      promptsDisplay.innerHTML += '<p class="placeholder-text">No more new prompts in this category for now!</p>';
      return;
    }

    // Shuffle and pick 5
    const shuffled = availablePrompts.sort(() => 0.5 - Math.random());
    const promptsToDisplay = shuffled.slice(0, 5);

    if (promptsToDisplay.length === 0 && !isNewCategory) { // If not a new category and still no prompts, it means we exhausted them
        promptsDisplay.innerHTML += '<p class="placeholder-text">You have seen all prompts in this category for this session.</p>';
        return;
    }
    
    if (isNewCategory || promptsDisplay.querySelector('.placeholder-text')) {
        promptsDisplay.innerHTML = ''; // Clear placeholder if it exists
    }


    promptsToDisplay.forEach(prompt => {
      shownPromptsInCategory.push(prompt.id); // Add to shown list
      const card = document.createElement('div');
      card.className = 'prompt-card';
      
      const textElement = document.createElement('p');
      textElement.className = 'prompt-card-text';
      textElement.textContent = prompt.text;
      card.appendChild(textElement);

      if (prompt.type === 'image' && prompt.imageUrl) {
        const img = document.createElement('img');
        img.src = prompt.imageUrl;
        img.alt = `Preview for: ${prompt.text.substring(0, 30)}...`;
        img.className = 'prompt-card-image-preview';
        if (prompt.imageHint) {
            img.dataset.aiHint = prompt.imageHint;
        }
        card.appendChild(img);
      }
      
      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copy Prompt';
      copyButton.className = 'copy-prompt-button';
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(prompt.text).then(() => {
          copyButton.textContent = 'Copied!';
          copyButton.classList.add('copied');
          setTimeout(() => {
            copyButton.textContent = 'Copy Prompt';
            copyButton.classList.remove('copied');
          }, 1500);
        }).catch(err => console.error('Failed to copy:', err));
      });
      card.appendChild(copyButton);
      
      promptsDisplay.appendChild(card);
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      clearError();
      if (!window.supabase) {
        showError('Supabase client not available. Logout failed.');
        return;
      }
      logoutButton.textContent = 'Logging out...';
      logoutButton.disabled = true;
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(`Logout failed: ${error.message}`);
        logoutButton.textContent = 'Logout';
        logoutButton.disabled = false;
      } else {
        window.location.href = 'splash.html';
      }
    });
  }
  
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'menu.html';
    });
  }

  checkAuthAndInitialize();
});

    