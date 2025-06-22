document.addEventListener('DOMContentLoaded', async () => {
  const categoryButtonsDiv = document.getElementById('categoryButtons');
  const promptsDisplay = document.getElementById('promptsDisplay');
  const logoutButton = document.getElementById('logoutButton');
  const backButton = document.getElementById('backButton');
  const errorDiv = document.getElementById('error');

  let allPrompts = [];
  let currentCategoryPrompts = [];
  let shownPromptsInCategory = []; // IDs of prompts shown in the current session for the current category
  let currentView = 'categories'; // To track navigation state

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
    clearError();
    if (!window.supabase) {
      showError('Supabase client is not available.');
      return;
    }
    try {
      console.log('Fetching prompts from Supabase...');
      const { data, error } = await supabase
        .from('magical_prompts')
        .select('*');

      if (error) {
        throw error;
      }

      allPrompts = data;
      console.log('Prompts loaded successfully from Supabase:', allPrompts.length);
    } catch (err) {
      showError(`Error loading prompts: ${err.message}`);
      console.error("Error loading prompts from Supabase:", err);
    }
  }

  function populateCategories() {
    if (!categoryButtonsDiv) return;
    categoryButtonsDiv.innerHTML = '';
    const categories = [...new Set(allPrompts.map(p => p.category.toUpperCase()))];
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
      const details = categoryDetails[category] || { icon: '✨', desc: '' };
      const card = document.createElement('button');
      card.className = 'category-card';
      card.innerHTML = `
        <span class="category-emoji">${details.icon}</span>
        <span class="category-info">
          <span class="category-title">${category}</span>
          <span class="category-desc">${details.desc}</span>
        </span>
      `;
      card.addEventListener('click', () => handleCategorySelect(category));
      categoryButtonsDiv.appendChild(card);
    });
  }

  function handleCategorySelect(category) {
    currentView = 'prompts';
    categoryButtonsDiv.style.display = 'none';
    promptsDisplay.style.display = 'block';
    shownPromptsInCategory = []; // Reset for new category
    displayMorePrompts(category); // Display initial set
  }

  function displayMorePrompts(category) {
    clearError();
    promptsDisplay.innerHTML = ''; // Clear previous prompts and button

    const availablePrompts = allPrompts.filter(p => p.category.toUpperCase() === category && !shownPromptsInCategory.includes(p.id));

    if (availablePrompts.length === 0) {
      const message = document.createElement('p');
      message.className = 'placeholder-text';
      message.textContent = shownPromptsInCategory.length > 0 ? 'No more prompts in this category!' : 'No prompts found for this category.';
      promptsDisplay.appendChild(message);
      return;
    }

    const shuffled = availablePrompts.sort(() => 0.5 - Math.random());
    const promptsToDisplay = shuffled.slice(0, 3);

    promptsToDisplay.forEach(prompt => {
      shownPromptsInCategory.push(prompt.id);
      const card = createPromptCard(prompt);
      promptsDisplay.appendChild(card);
    });

    // Check if there are still more prompts available to decide whether to show the button
    const moreAvailable = allPrompts.filter(p => p.category.toUpperCase() === category && !shownPromptsInCategory.includes(p.id));
    if (moreAvailable.length > 0) {
      addGetMoreButton(category);
    }
  }

  function addGetMoreButton(category) {
    const getMoreBtn = document.createElement('button');
    getMoreBtn.textContent = 'Get More Prompts';
    getMoreBtn.id = 'getMoreBtn';
    getMoreBtn.className = 'button'; // Re-use existing button style
    getMoreBtn.addEventListener('click', () => displayMorePrompts(category));
    promptsDisplay.appendChild(getMoreBtn); // Use appendChild to add it to the bottom
  }

  function createPromptCard(prompt) {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    
    const textElement = document.createElement('p');
    textElement.className = 'prompt-card-text';
    textElement.textContent = prompt.prompt_text;
    card.appendChild(textElement);

    if (prompt.type === 'image' && prompt.image_url) {
      const img = document.createElement('img');
      img.src = prompt.image_url;
      img.alt = `Preview for: ${prompt.prompt_text.substring(0, 30)}...`;
      img.className = 'prompt-card-image-preview';
      if (prompt.image_hint) {
        img.dataset.aiHint = prompt.image_hint;
      }
      card.appendChild(img);
    }
    
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy Prompt';
    copyButton.className = 'copy-prompt-button';
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(prompt.prompt_text).then(() => {
        copyButton.textContent = 'Copied!';
        copyButton.classList.add('copied');
        setTimeout(() => {
          copyButton.textContent = 'Copy Prompt';
          copyButton.classList.remove('copied');
        }, 1500);
      }).catch(err => console.error('Failed to copy:', err));
    });
    card.appendChild(copyButton);

    return card;
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
      clearError();
      if (currentView === 'prompts') {
        currentView = 'categories';
        promptsDisplay.innerHTML = '';
        promptsDisplay.style.display = 'none';
        categoryButtonsDiv.style.display = 'grid';
      } else {
        window.location.href = 'menu.html';
      }
    });
  }

  checkAuthAndInitialize();
});

    