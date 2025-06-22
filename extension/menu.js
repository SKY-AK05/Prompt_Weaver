
document.addEventListener('DOMContentLoaded', () => {
  const refinePromptButton = document.getElementById('refinePromptButton');
  const magicalPromptsButton = document.getElementById('magicalPromptsButton');
  const logoutButton = document.getElementById('logoutButton');
  const errorMessageDiv = document.getElementById('error-message');

  async function checkAuthAndInitialize() {
    if (!window.supabase) {
      showError('Supabase client is not available. Cannot proceed.');
      disableButtons();
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      if (!session) {
        console.log('No active session, redirecting to splash.');
        window.location.href = 'splash.html'; // Redirect to splash, which will handle auth flow
      } else {
        console.log('Active session found. Menu initialized.');
        // User is authenticated, menu can be used.
      }
    } catch (error) {
      console.error('Error checking Supabase session in menu:', error);
      showError(`Session error: ${error.message}. Please try logging in again.`);
      // Potentially redirect to splash or auth if session is critical for all menu operations
      // For now, just shows an error and disables buttons if needed.
      // setTimeout(() => { window.location.href = 'splash.html'; }, 3000);
    }
  }

  function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
  }

  function clearError() {
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
  }
  
  function disableButtons() {
    if(refinePromptButton) refinePromptButton.disabled = true;
    if(magicalPromptsButton) magicalPromptsButton.disabled = true;
  }

  if (refinePromptButton) {
    refinePromptButton.addEventListener('click', () => {
      window.location.href = 'sidepanel.html';
    });
  }

  if (magicalPromptsButton) {
    magicalPromptsButton.addEventListener('click', () => {
      window.location.href = 'magical.html';
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
        console.error('Error logging out:', error);
        showError(`Logout failed: ${error.message}`);
        logoutButton.textContent = 'Logout';
        logoutButton.disabled = false;
      } else {
        window.location.href = 'splash.html'; // Redirect to splash after logout
      }
    });
  }

  checkAuthAndInitialize();
});

    