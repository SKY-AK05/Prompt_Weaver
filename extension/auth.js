
document.addEventListener('DOMContentLoaded', () => {
  const emailPasswordForm = document.getElementById('emailPasswordForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const signInButton = document.getElementById('signInButton');
  const signUpButton = document.getElementById('signUpButton');
  const googleSignInButton = document.getElementById('googleSignInButton');
  const githubSignInButton = document.getElementById('githubSignInButton');
  const authErrorDiv = document.getElementById('auth-error');

  const SUPABASE_URL = 'https://nkmymrhmgaolschqhaoa.supabase.co'; 

  if (!window.supabase) {
    showError('Supabase client is not available. Authentication is disabled.');
    [signInButton, signUpButton, googleSignInButton, githubSignInButton].forEach(btn => {
        if(btn) btn.disabled = true;
    });
    return;
  }

  function showError(message) {
    authErrorDiv.textContent = message;
    authErrorDiv.style.display = 'block';
  }

  function clearError() {
    authErrorDiv.textContent = '';
    authErrorDiv.style.display = 'none';
  }

  async function handleAuthResponse(response, action) {
    if (response.error) {
      console.error(`${action} error:`, response.error);
      showError(response.error.message || `Failed to ${action.toLowerCase()}.`);
    } else if (response.data.user || response.data.session) {
      if (response.data.user && action === 'Sign Up' && !response.data.session) {
        showError(`Sign up successful. Please check your email to confirm your account before signing in.`);
      } else {
        window.location.href = 'menu.html'; // Redirect to menu.html
      }
    } else if (action === 'Sign Up') { // Handle cases where user is returned but no session (email confirmation needed)
        showError(`Sign up successful. Please check your email to confirm your account before signing in.`);
    } else {
      showError(`An unexpected issue occurred during ${action.toLowerCase()}. Please try again.`);
    }
  }

  // Email/Password Sign In
  signInButton.addEventListener('click', async (e) => {
    e.preventDefault();
    clearError();
    const email = emailInput.value;
    const password = passwordInput.value;
    const response = await supabase.auth.signInWithPassword({ email, password });
    handleAuthResponse(response, 'Sign In');
  });

  // Email/Password Sign Up
  signUpButton.addEventListener('click', async (e) => {
    e.preventDefault();
    clearError();
    const email = emailInput.value;
    const password = passwordInput.value;
    if (password.length < 6) {
        showError("Password should be at least 6 characters.");
        return;
    }
    const response = await supabase.auth.signUp({ email, password });
    handleAuthResponse(response, 'Sign Up');
  });

  function parseAuthResponseUrl(redirectUrl) {
    const params = {};
    if (redirectUrl && redirectUrl.includes('#')) {
      const hash = redirectUrl.split('#')[1];
      hash.split('&').forEach(part => {
        const item = part.split('=');
        params[item[0]] = decodeURIComponent(item[1]);
      });
    }
    return {
      access_token: params.access_token,
      refresh_token: params.refresh_token,
      error: params.error,
      error_description: params.error_description
    };
  }

  async function performOAuth(provider) {
    clearError();
    if (!chrome.identity || !chrome.identity.launchWebAuthFlow) {
      showError('Chrome Identity API is not available. OAuth cannot proceed.');
      console.error('Chrome Identity API not found.');
      return;
    }

    const extensionRedirectUri = chrome.identity.getRedirectURL();
    console.log('Using Extension Redirect URI:', extensionRedirectUri);
    console.warn(`IMPORTANT: For OAuth with ${provider} to work, this EXACT URL must be whitelisted:`);
    console.warn(`>>> ${extensionRedirectUri} <<<`);
    console.warn(`Add it to:
      1. Supabase Dashboard (Authentication -> URL Configuration -> Additional Redirect URLs)
      2. Your ${provider === 'google' ? 'Google Cloud Console (OAuth Client ID -> Authorized redirect URIs)' : 'GitHub OAuth App (Authorization callback URL)'}
      3. Ensure your Supabase callback (https://nkmymrhmgaolschqhaoa.supabase.co/auth/v1/callback) is ALSO in Google/GitHub OAuth authorized redirect URIs.`);


    if (!extensionRedirectUri) {
        showError('Could not determine extension redirect URI. Cannot proceed with OAuth.');
        console.error('chrome.identity.getRedirectURL() returned falsy.');
        return;
    }

    const supabaseAuthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(extensionRedirectUri)}`;
    console.log(`Attempting OAuth with URL: ${supabaseAuthUrl}`);

    try {
      chrome.identity.launchWebAuthFlow(
        {
          url: supabaseAuthUrl,
          interactive: true,
        },
        async (responseUrl) => {
          if (chrome.runtime.lastError || !responseUrl) {
            const errorMsg = chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Authorization failed or was cancelled.';
            console.error(`${provider} OAuth error from launchWebAuthFlow:`, errorMsg);
            showError(`Failed to sign in with ${provider}. ${errorMsg}`);
            return;
          }

          console.log(`${provider} OAuth responseUrl (from launchWebAuthFlow):`, responseUrl);
          
          const parsedResponse = parseAuthResponseUrl(responseUrl);

          if (parsedResponse.error) {
            console.error(`${provider} OAuth provider error (parsed from responseUrl):`, parsedResponse.error_description);
            showError(`Error from ${provider}: ${parsedResponse.error_description || parsedResponse.error}`);
            return;
          }

          if (parsedResponse.access_token && parsedResponse.refresh_token) {
            console.log('Tokens extracted, attempting to set session with Supabase.');
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: parsedResponse.access_token,
              refresh_token: parsedResponse.refresh_token,
            });

            if (sessionError) {
              console.error('Supabase setSession error:', sessionError);
              showError(`Failed to establish session with Supabase: ${sessionError.message}`);
            } else if (data.session) {
              console.log('Supabase session established successfully:', data.session);
              window.location.href = 'menu.html'; // Redirect to menu.html
            } else {
              console.error('Supabase setSession did not return a session or user.');
              showError('Could not verify session with Supabase after OAuth.');
            }
          } else {
            console.error('Could not extract tokens from OAuth responseUrl:', responseUrl, 'Parsed:', parsedResponse);
            showError('Failed to get authentication tokens from OAuth provider. Check console for details on responseUrl.');
          }
        }
      );
    } catch (e) {
      console.error(`Error initiating ${provider} OAuth:`, e);
      showError(`An unexpected error occurred while trying to sign in with ${provider}.`);
    }
  }

  googleSignInButton.addEventListener('click', () => performOAuth('google'));
  githubSignInButton.addEventListener('click', () => performOAuth('github'));

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Supabase onAuthStateChange event:', event, 'session:', session);
    if (event === 'SIGNED_IN' && session) {
      if (window.location.pathname.endsWith('auth.html')) {
         console.log('Auth state changed to SIGNED_IN on auth.html, redirecting to menu.html');
         window.location.href = 'menu.html'; // Redirect to menu.html
      }
    }
  });
});

    