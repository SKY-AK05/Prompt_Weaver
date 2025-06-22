
document.addEventListener('DOMContentLoaded', () => {
  const getStartedButton = document.getElementById('getStartedButton');

  if (!window.supabase) {
    console.error('Supabase client is not loaded. Authentication checks will not work.');
    if (getStartedButton) {
        getStartedButton.textContent = 'Error: Supabase Missing';
        getStartedButton.disabled = true;
         // Display a more user-friendly error on the page itself
        const errorDiv = document.createElement('p');
        errorDiv.textContent = 'Critical error: Supabase library not found. Please reinstall or contact support.';
        errorDiv.style.color = '#E53E3E'; // Accent red
        errorDiv.style.marginTop = '10px';
        getStartedButton.parentElement.appendChild(errorDiv);
    }
    return;
  }
  
  getStartedButton.addEventListener('click', async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = 'menu.html'; // Go to main menu if logged in
      } else {
        window.location.href = 'auth.html'; // Go to auth if not logged in
      }
    } catch (error) {
      console.error('Error checking Supabase session:', error);
      // Fallback to auth page if session check fails
      window.location.href = 'auth.html';
    }
  });
});

    