// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_SELECTED_TEXT") {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ selection: selectedText });
  }
  return true; // Indicates that the response is sent asynchronously
});

// Show PromptWeaver modal if not already shown
if (!document.getElementById('promptweaver-modal')) {
  const modal = document.createElement('div');
  modal.id = 'promptweaver-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.32)';
  modal.style.zIndex = '999999';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  const box = document.createElement('div');
  box.style.background = '#181818';
  box.style.color = '#fff';
  box.style.padding = '32px 28px';
  box.style.borderRadius = '16px';
  box.style.boxShadow = '0 4px 32px rgba(0,0,0,0.18)';
  box.style.textAlign = 'center';
  box.style.minWidth = '320px';
  box.style.fontFamily = 'inherit';

  const msg = document.createElement('div');
  msg.textContent = 'PromptWeaver: Would you like to use the extension here?';
  msg.style.fontSize = '1.15rem';
  msg.style.marginBottom = '22px';
  box.appendChild(msg);

  const yesBtn = document.createElement('button');
  yesBtn.textContent = 'Yes';
  yesBtn.style.margin = '0 12px 0 0';
  yesBtn.style.padding = '10px 24px';
  yesBtn.style.background = '#F15B5B';
  yesBtn.style.color = '#fff';
  yesBtn.style.border = 'none';
  yesBtn.style.borderRadius = '8px';
  yesBtn.style.fontWeight = 'bold';
  yesBtn.style.cursor = 'pointer';
  yesBtn.onclick = () => modal.remove();

  const noBtn = document.createElement('button');
  noBtn.textContent = 'No';
  noBtn.style.padding = '10px 24px';
  noBtn.style.background = '#222';
  noBtn.style.color = '#fff';
  noBtn.style.border = 'none';
  noBtn.style.borderRadius = '8px';
  noBtn.style.fontWeight = 'bold';
  noBtn.style.cursor = 'pointer';
  noBtn.onclick = () => modal.remove();

  box.appendChild(yesBtn);
  box.appendChild(noBtn);
  modal.appendChild(box);
  document.body.appendChild(modal);
}
