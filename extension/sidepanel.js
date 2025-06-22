// Chrome Extension Side Panel Script (Refine Prompt Feature)

class PromptWeaverRefine {
  constructor() {
    console.log('PromptWeaverRefine: constructor called');
    this.checkAuth(); 
    this.currentResultIndex = 0;
    this.refinedPrompts = [];
  }

  async checkAuth() {
    console.log('PromptWeaverRefine: checkAuth called');
    if (!window.supabase) {
      console.error('Supabase client is not available in sidepanel.js. Redirecting to splash.');
      this.redirectToSplash();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('PromptWeaverRefine: Supabase session status -', session ? 'Active' : 'Inactive');
      if (!session) {
        this.redirectToSplash();
      } else {
        this.renderUI();
        this.initializeElements();
        this.attachEventListeners();
        this.fetchAndSetSelectedText().then(selectedTextFetched => {
          console.log('PromptWeaverRefine: fetchAndSetSelectedText completed, fetched:', selectedTextFetched);
          if (!selectedTextFetched) {
            this.loadStoredData();
          }
        });
      }
    } catch (error) {
        console.error('PromptWeaverRefine: Error checking Supabase session in sidepanel:', error);
        this.redirectToSplash();
    }
  }

  redirectToSplash() {
    if (!window.location.pathname.endsWith('splash.html')) { 
        window.location.href = 'splash.html';
    }
  }
  
  renderUI() {
    console.log('PromptWeaverRefine: renderUI called');
    document.getElementById('root').innerHTML = `
      <div class="container">
        <div class="header">
          <img src="icons/padded_icon-48.png" alt="PromptWeaver" class="logo">
          <h1 class="title">Refine Prompt</h1>
          <div class="header-actions">
            <button id="backButton" class="back-button" aria-label="Back to Menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon-svg"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button id="logoutButton" class="logout-button" aria-label="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon-svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
        
        <div id="error" class="error" style="display: none;"></div>
        
        <form id="promptForm" onsubmit="return false;">
          <div id="customStyleSummary" class="form-group" style="display:none;"></div>
          <div class="form-group">
            <label for="inputText" class="label">Enter your idea :</label>
            <textarea 
              id="inputText" 
              class="textarea" 
              placeholder="Describe what you want to create a prompt for..."
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="promptLevel" class="label" style="margin-bottom: 6px; display: block;">Prompt Level:</label>
            <div style="display: flex; gap: 4px; align-items: center;">
              <select id="promptLevel" class="select" style="flex: 1; min-width: 0; height: 38px; font-size: 13px; border-radius: 8px;">
                <option value="Quick">Simple</option>
                <option value="Balanced" selected>Moderate</option>
                <option value="Comprehensive">Expert</option>
              </select>
              <button type="button" id="customizeButton" class="button" style="flex: 1; min-width: 0; height: 38px; font-size: 13px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600;">
                <span style="font-size: 16px;">⭐</span> Customize
              </button>
            </div>
          </div>
          <div id="customizePanel" style="display:none; border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 12px; background: #fafbfc;">
            <div class="form-group">
              <label for="structureStyle" class="label">Structure:</label>
              <select id="structureStyle" class="select"><option value="">None</option><option value="Concise">Concise</option><option value="Expanded">Expanded</option><option value="Step-by-step">Step-by-step</option></select>
            </div>
            <div class="form-group">
              <label for="toneStyle" class="label">Tone:</label>
              <select id="toneStyle" class="select"><option value="">None</option><option value="Creative">Creative</option><option value="Casual">Casual</option><option value="Formal">Formal</option><option value="Witty">Witty</option></select>
            </div>
            <div class="form-group">
              <label for="purposeStyle" class="label">Purpose:</label>
              <select id="purposeStyle" class="select"><option value="">None</option><option value="SEO-Friendly">SEO-Friendly</option><option value="Conversion-Oriented">Conversion-Oriented</option><option value="Informative">Informative</option></select>
            </div>
            <div class="form-group">
              <label for="aiOptimizationStyle" class="label">AI Optimization:</label>
              <select id="aiOptimizationStyle" class="select"><option value="">None</option><option value="GPT-4 Optimized">GPT-4 Optimized</option><option value="Chain-of-Thought">Chain-of-Thought</option><option value="Instructional">Instructional</option></select>
            </div>
            <div class="form-group">
              <label for="audienceStyle" class="label">Audience:</label>
              <select id="audienceStyle" class="select"><option value="">None</option><option value="Beginner-Friendly">Beginner-Friendly</option><option value="Technical">Technical</option><option value="Marketing">Marketing</option></select>
            </div>
            <button type="button" id="applyCustomizeButton" class="button" style="margin-top: 8px; width: 100%;">Apply</button>
          </div>
          <button type="button" id="refineButton" class="button">
            Refine Prompt
          </button>
        </form>
        <div id="results" class="results">
          <!-- Prompt results will be displayed here -->
        </div>
      </div>
    `;
    console.log('UI rendered.');
    // Apply dark theme
    this.applyDarkTheme();
  }


  initializeElements() {
    console.log('PromptWeaverRefine: initializeElements called');
    this.form = document.getElementById('promptForm');
    this.inputText = document.getElementById('inputText');
    this.promptLevel = document.getElementById('promptLevel');
    this.refineButton = document.getElementById('refineButton');
    this.errorDiv = document.getElementById('error');
    this.resultsDiv = document.getElementById('results');
    this.logoutButton = document.getElementById('logoutButton');
    this.backButton = document.getElementById('backButton');
    this.structureStyle = document.getElementById('structureStyle');
    this.toneStyle = document.getElementById('toneStyle');
    this.purposeStyle = document.getElementById('purposeStyle');
    this.aiOptimizationStyle = document.getElementById('aiOptimizationStyle');
    this.audienceStyle = document.getElementById('audienceStyle');
    this.customizePanel = document.getElementById('customizePanel');
    this.customStyleSummary = document.getElementById('customStyleSummary');
    this.customizeButton = document.getElementById('customizeButton');
    this.applyCustomizeButton = document.getElementById('applyCustomizeButton');

    if(!this.refineButton) console.error("PromptWeaverRefine: Refine button not found after UI render!");
  }

  attachEventListeners() {
    console.log('PromptWeaverRefine: attachEventListeners called');
    if (this.refineButton) {
      this.refineButton.addEventListener('click', () => this.handleRefinePrompt());
    } else {
      console.error("PromptWeaverRefine: Cannot attach listener to refineButton, it's null.");
    }
    if (this.inputText) {
        this.inputText.addEventListener('input', () => {
          this.clearError();
          this.saveFormData(); 
        });
    }
    if (this.promptLevel) {
        this.promptLevel.addEventListener('change', () => {
          this.saveFormData();
        });
    }
    if (this.logoutButton) {
        this.logoutButton.addEventListener('click', () => this.handleLogout());
    }
     if (this.backButton) {
        this.backButton.addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
    }
    if (this.customizeButton) {
      this.customizeButton.addEventListener('click', () => {
        this.customizePanel.style.display = this.customizePanel.style.display === 'none' ? '' : 'none';
      });
    }
    if (this.applyCustomizeButton) {
      this.applyCustomizeButton.addEventListener('click', () => {
        this.customizePanel.style.display = 'none';
        this.showCustomStyleSummary();
        this.isCustomizing = true;
      });
    }
  }

  async handleLogout() {
    console.log('PromptWeaverRefine: handleLogout called');
    if (!window.supabase) {
        console.error("Supabase client not available for logout.");
        this.showError("Logout failed: Supabase not available.");
        return;
    }
    this.setLoading(true, this.logoutButton, "Logging out...");
    const { error } = await supabase.auth.signOut();
    this.setLoading(false, this.logoutButton, `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon-svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`); // Restore with icon
    if (error) {
      console.error('Error logging out:', error);
      this.showError('Failed to log out. Please try again.');
    } else {
      this.redirectToSplash();
    }
  }

  async fetchAndSetSelectedText() {
    console.log('PromptWeaverRefine: fetchAndSetSelectedText called');
    return new Promise((resolve) => {
      if (chrome.tabs && typeof chrome.tabs.query === 'function') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs.length > 0 && tabs[0].id) {
            console.log('PromptWeaverRefine: Querying active tab', tabs[0].id);
            chrome.tabs.sendMessage(tabs[0].id, { type: "GET_SELECTED_TEXT" }, (response) => {
              if (chrome.runtime.lastError) {
                console.warn('PromptWeaverRefine: Could not connect to content script on this page. Error:', chrome.runtime.lastError.message);
                resolve(false);
                return;
              }
              if (response && response.selection && response.selection.trim() !== '') {
                console.log('PromptWeaverRefine: Received selected text -', response.selection);
                if (this.inputText) this.inputText.value = response.selection;
                this.saveFormData(); 
                resolve(true);
              } else {
                console.log('PromptWeaverRefine: No selection received or selection is empty.');
                resolve(false);
              }
            });
          } else {
            console.warn('PromptWeaverRefine: No active tab found to get selection from.');
            resolve(false);
          }
        });
      } else {
        console.warn('PromptWeaverRefine: chrome.tabs API not available.');
        resolve(false);
      }
    });
  }

  async loadStoredData() {
    console.log('PromptWeaverRefine: loadStoredData called');
     try {
      const result = await chrome.storage.local.get(['refineInputText', 'refinePromptLevel']);
      if (result.refineInputText && this.inputText && this.inputText.value.trim() === '') {
        this.inputText.value = result.refineInputText;
        console.log('PromptWeaverRefine: Loaded inputText from storage.');
      }
      if (result.refinePromptLevel && this.promptLevel) {
        this.promptLevel.value = result.refinePromptLevel;
        console.log('PromptWeaverRefine: Loaded promptLevel from storage.');
      }
    } catch (error) {
      console.warn('PromptWeaverRefine: No stored data found or error loading.', error);
    }
  }

  async saveFormData() {
    // console.log('PromptWeaverRefine: saveFormData called'); 
    try {
      if (this.inputText && this.promptLevel) {
        await chrome.storage.local.set({
          refineInputText: this.inputText.value,
          refinePromptLevel: this.promptLevel.value
        });
      }
    } catch (error) {
      console.warn('PromptWeaverRefine: Could not save form data.', error);
    }
  }

  clearError() {
    if(this.errorDiv) {
        this.errorDiv.style.display = 'none';
        this.errorDiv.textContent = '';
    }
  }

  showError(message) {
    console.error('PromptWeaverRefine: showError called with message -', message);
    if(this.errorDiv) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
    }
  }

  setLoading(loading, buttonElement = this.refineButton, loadingText = 'Refining...') {
    // console.log('PromptWeaverRefine: setLoading called with loading state -', loading); 
    if (!buttonElement) {
        console.warn("PromptWeaverRefine: setLoading - buttonElement is null");
        return;
    }
    buttonElement.disabled = loading;
    if (loading) {
      buttonElement.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          ${loadingText}
        </div>
      `;
    } else {
      // Restore original button text/HTML based on ID
      if (buttonElement.id === 'refineButton') buttonElement.textContent = 'Refine Prompt';
      else if (buttonElement.id === 'logoutButton') buttonElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon-svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;
      else if (buttonElement.id === 'backButton') buttonElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon-svg"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      else buttonElement.textContent = 'Action'; // Default fallback
    }
  }

  async handleRefinePrompt() {
    console.log('PromptWeaverRefine: handleRefinePrompt called');
    if (!this.inputText || !this.promptLevel || !this.errorDiv || !this.resultsDiv) {
        console.error("PromptWeaverRefine: Core elements not initialized for handleRefinePrompt.");
        this.showError("An internal error occurred. Please try reloading the extension.");
        return;
    }

    const text = this.inputText.value.trim();
    let level = this.promptLevel.value;
    let refinementStyle = undefined;
    if (this.isCustomizing) {
      refinementStyle = [
        this.structureStyle.value,
        this.toneStyle.value,
        this.purposeStyle.value,
        this.aiOptimizationStyle.value,
        this.audienceStyle.value
      ].filter(Boolean).join(', ');
    }

    if (!text) {
      this.showError('Please enter an idea to refine.');
      return;
    }
     if (text.length > 5000) { // Consistent with validation in refine-prompt.ts
      this.showError('Text input is too long (max 5000 characters).');
      return;
    }

    this.clearError();
    this.setLoading(true, this.refineButton, 'Refining...');
    this.resultsDiv.innerHTML = ''; 

    try {
      console.log(`PromptWeaverRefine: Calling refinePromptAPI with instruction: "${text}", level: "${level}", refinementStyle: "${refinementStyle}"`);
      const response = await this.refinePromptAPI(text, level, refinementStyle); 
      console.log('PromptWeaverRefine: API Response -', response);
      
      if (response.success && response.data?.refinedPrompts) {
        this.displayResults(response.data.refinedPrompts);
        // Auto-save to Supabase
        if (window.supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            const createdAt = new Date();
            const expiresAt = new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000);
            await supabase.from("prompts").insert([
              {
                user_id: session.user.id,
                username: session.user.email || 'anonymous',
                prompt_text: text,
                prompt_level: level,
                refined_prompt_text_1: response.data.refinedPrompts[0]?.promptText || null,
                refined_prompt_rating_1: response.data.refinedPrompts[0]?.rating || null,
                refined_prompt_text_2: response.data.refinedPrompts[1]?.promptText || null,
                refined_prompt_rating_2: response.data.refinedPrompts[1]?.rating || null,
                refined_prompt_text_3: response.data.refinedPrompts[2]?.promptText || null,
                refined_prompt_rating_3: response.data.refinedPrompts[2]?.rating || null,
                is_favorite: false,
                is_temporary: true,
                expires_at: expiresAt.toISOString(),
                created_at: createdAt.toISOString(),
              }
            ]);
          }
        }
      } else {
        const errorMessage = response.error || (response.data && response.data.error) || 'Failed to refine prompt. The AI may not have returned valid suggestions.';
        throw new Error(errorMessage);
      }
    } catch (error) {
       let displayMessage = `Error: ${error.message}`;
        if (error.message && error.message.toLowerCase().includes('gemini') && (error.message.toLowerCase().includes('overloaded') || error.message.toLowerCase().includes('503'))) {
            displayMessage = 'The AI model (Google Gemini) is currently busy. Please try again in a few moments.';
        } else if (error.message && (error.message.toLowerCase().includes('did not return the expected') || error.message.toLowerCase().includes('invalid format'))) {
            displayMessage = 'The AI (Google Gemini) returned an unexpected format. Please try rephrasing or try again.';
        } else if (error.message && error.message.toLowerCase().includes('failed to fetch')) {
            displayMessage = 'Network error: Could not connect to the PromptWeaver API. Please check your internet connection and ensure the API service is running.';
        }
      this.showError(displayMessage);
    } finally {
      this.setLoading(false, this.refineButton, 'Refine Prompt');
      this.showCustomStyleSummary(false); // Collapse summary after refining
    }
  }

  async refinePromptAPI(instruction, promptLevel, refinementStyle) {
    const API_BASE_URL = 'https://prompt-weaver.vercel.app'; // Use Vercel URL
    console.log(`PromptWeaverRefine: refinePromptAPI - Sending request to ${API_BASE_URL}/api/refine-prompt`);
    
    const response = await fetch(`${API_BASE_URL}/api/refine-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instruction: instruction,
        promptLevel: promptLevel,
        refinementStyle: refinementStyle
      })
    });
    console.log(`PromptWeaverRefine: refinePromptAPI - Response status: ${response.status}`);

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      let errorText = `API request failed: ${response.status} ${response.statusText}`;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        try {
          const errorJson = await response.json();
          errorText = errorJson.error || errorJson.message || errorText;
        } catch (e) { console.warn("PromptWeaverRefine: Could not parse error JSON from API", e); }
      } else {
          try { errorText = await response.text(); } catch(e) { console.warn("PromptWeaverRefine: Could not get error text from API", e); }
      }
      console.error(`PromptWeaverRefine: refinePromptAPI - Error: ${errorText}`);
      throw new Error(errorText);
    }
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    } else {
        const responseText = await response.text();
        console.error("PromptWeaverRefine: refinePromptAPI - API did not return JSON. Response text:", responseText);
        throw new Error("API did not return JSON.");
    }
  }

  displayResults(prompts) {
    console.log('PromptWeaverRefine: displayResults called with prompts -', prompts);
    if (!this.resultsDiv) {
      console.error("PromptWeaverRefine: resultsDiv not found for displayResults.");
      return;
    }
    this.refinedPrompts = prompts;
    this.currentResultIndex = 0;
    this.renderCurrentResult();
  }

  renderCurrentResult() {
    if (!this.resultsDiv) return;
    if (!this.refinedPrompts || this.refinedPrompts.length === 0) {
      this.resultsDiv.innerHTML = '';
      return;
    }
    const prompt = this.refinedPrompts[this.currentResultIndex];
    this.resultsDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px; gap: 12px;">
        <button id="resultPrevBtn" ${this.currentResultIndex === 0 ? 'disabled' : ''} style="background: none; border: none; font-size: 22px; cursor: pointer; color: #ea5656; opacity: ${this.currentResultIndex === 0 ? '0.4' : '1'}; display: flex; align-items: center; justify-content: center;">
          <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'><polyline points='15 18 9 12 15 6'></polyline></svg>
        </button>
        <span style="font-size: 15px; font-weight: 600; color: #ea5656;">${this.currentResultIndex + 1} / ${this.refinedPrompts.length}</span>
        <button id="resultNextBtn" ${this.currentResultIndex === this.refinedPrompts.length - 1 ? 'disabled' : ''} style="background: none; border: none; font-size: 22px; cursor: pointer; color: #ea5656; opacity: ${this.currentResultIndex === this.refinedPrompts.length - 1 ? '0.4' : '1'}; display: flex; align-items: center; justify-content: center;">
          <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'><polyline points='9 6 15 12 9 18'></polyline></svg>
        </button>
      </div>
      <div class="result-card">
        <div class="result-header">
          <span class="result-title">Suggestion ${this.currentResultIndex + 1}</span>
          <span class="rating">${prompt.rating ? prompt.rating + '/10' : ''}</span>
        </div>
        <div class="result-text">${prompt.promptText.replace(/\n/g, '<br>')}</div>
        <button class="copy-button" data-text="${this.escapeHtml(prompt.promptText)}">Copy</button>
        <button class="refine-again-button" data-text="${this.escapeHtml(prompt.promptText)}">Refine Again</button>
      </div>
    `;
    // Add event listeners for navigation and actions
    const prevBtn = document.getElementById('resultPrevBtn');
    const nextBtn = document.getElementById('resultNextBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (this.currentResultIndex > 0) {
        this.currentResultIndex--;
        this.renderCurrentResult();
      }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (this.currentResultIndex < this.refinedPrompts.length - 1) {
        this.currentResultIndex++;
        this.renderCurrentResult();
      }
    });
    const copyButton = this.resultsDiv.querySelector('.copy-button');
    if (copyButton) copyButton.addEventListener('click', () => this.copyToClipboard(copyButton, prompt.promptText));
    const refineAgainButton = this.resultsDiv.querySelector('.refine-again-button');
    if (refineAgainButton) refineAgainButton.addEventListener('click', () => {
      this.inputText.value = prompt.promptText;
      this.resultsDiv.innerHTML = '';
      this.inputText.focus();
      this.showError('Prompt loaded for further refinement. Edit and click "Refine Prompt".');
    });
  }

  escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  async copyToClipboard(button, text) {
    console.log('PromptWeaverRefine: copyToClipboard called for text -', text);
    try {
      await navigator.clipboard.writeText(text);
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 2000);
    } catch (error) {
      console.error('PromptWeaverRefine: Failed to copy text:', error);
      this.showError('Failed to copy. Please try again or copy manually.');
    }
  }

  showCustomStyleSummary(show = true) {
    if (!this.customStyleSummary) return;
    const selected = [
      this.structureStyle.value,
      this.toneStyle.value,
      this.purposeStyle.value,
      this.aiOptimizationStyle.value,
      this.audienceStyle.value
    ].filter(Boolean);
    if (selected.length === 0 || !show) {
      this.customStyleSummary.style.display = 'none';
      this.customStyleSummary.innerHTML = '';
      return;
    }
    this.customStyleSummary.style.display = '';
    this.customStyleSummary.innerHTML = selected.map(style => `<span style="color:#ea5656;font-weight:600;background:#f25b5b22;padding:2px 8px;border-radius:12px;margin-right:4px;">#${style}</span>`).join(' ');
  }

  // Theme logic
  applyDarkTheme() {
    const root = document.documentElement;
    root.style.setProperty('--bg-main', '#18181b');
    root.style.setProperty('--bg-panel', '#232326');
    root.style.setProperty('--text-main', '#f3f3f7');
    root.style.setProperty('--text-label', '#bdbdc2');
    root.style.setProperty('--border-main', '#33343a');
    root.style.setProperty('--button-main', '#ea5656');
    root.style.setProperty('--button-text', '#fff');
    root.style.setProperty('--select-bg', '#232326');
    root.style.setProperty('--select-text', '#f3f3f7');
    document.body.style.background = 'var(--bg-main)';
    // Update all relevant elements
    const panel = document.getElementById('customizePanel');
    if (panel) {
      panel.style.background = 'var(--bg-panel)';
      panel.style.color = 'var(--text-main)';
      panel.style.borderColor = 'var(--border-main)';
    }
    const selects = document.querySelectorAll('.select');
    selects.forEach(sel => {
      sel.style.background = 'var(--select-bg)';
      sel.style.color = 'var(--select-text)';
      sel.style.borderColor = 'var(--border-main)';
      sel.style.setProperty('color', 'var(--select-text)', 'important');
      sel.style.setProperty('background', 'var(--select-bg)', 'important');
    });
    const textareas = document.querySelectorAll('.textarea');
    textareas.forEach(ta => {
      ta.style.background = 'var(--select-bg)';
      ta.style.color = 'var(--select-text)';
      ta.style.borderColor = 'var(--border-main)';
      ta.style.setProperty('color', 'var(--select-text)', 'important');
      ta.style.setProperty('background', 'var(--select-bg)', 'important');
    });
    const labels = document.querySelectorAll('.label');
    labels.forEach(lab => {
      lab.style.color = 'var(--text-label)';
      lab.style.setProperty('color', 'var(--text-label)', 'important');
    });
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(btn => {
      btn.style.background = 'var(--button-main)';
      btn.style.color = 'var(--button-text)';
      btn.style.border = 'none';
    });
    const resultCards = document.querySelectorAll('.result-card');
    resultCards.forEach(card => {
      card.style.background = 'var(--bg-panel)';
      card.style.color = 'var(--text-main)';
      card.style.borderColor = 'var(--border-main)';
      card.style.setProperty('color', 'var(--text-main)', 'important');
      card.style.setProperty('background', 'var(--bg-panel)', 'important');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('PromptWeaverRefine: DOMContentLoaded event fired for sidepanel.js.');
  new PromptWeaverRefine();
});
