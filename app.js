const els = {
  publisher: document.querySelector('#publisher-repo'),
  owner: document.querySelector('#target-owner'),
  visibility: document.querySelector('#visibility'),
  prompt: document.querySelector('#prompt'),
  copy: document.querySelector('#copy'),
  download: document.querySelector('#download'),
  status: document.querySelector('#status'),
};

let template = '';

function render() {
  if (!template) return;
  const publisher = els.publisher.value.trim() || 'owner/sandbox-publisher';
  const owner = els.owner.value.trim() || publisher.split('/')[0] || 'owner';
  const visibility = els.visibility.value;

  els.prompt.value = template
    .replaceAll('{{PUBLISHER_REPO}}', publisher)
    .replaceAll('{{TARGET_OWNER}}', owner)
    .replaceAll('{{DEFAULT_VISIBILITY}}', visibility);

  const params = new URLSearchParams();
  params.set('repo', publisher);
  params.set('owner', owner);
  params.set('visibility', visibility);
  history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
}

async function loadTemplate() {
  const response = await fetch('./prompt.template.md', { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  template = await response.text();

  const params = new URLSearchParams(location.search);
  if (params.get('repo')) els.publisher.value = params.get('repo');
  if (params.get('owner')) els.owner.value = params.get('owner');
  if (params.get('visibility') === 'public' || params.get('visibility') === 'private') {
    els.visibility.value = params.get('visibility');
  }
  render();
  els.status.textContent = 'Ready';
}

async function copyPrompt() {
  await navigator.clipboard.writeText(els.prompt.value);
  const previous = els.copy.textContent;
  els.copy.textContent = 'Copied';
  els.status.textContent = 'Prompt copied to clipboard';
  setTimeout(() => {
    els.copy.textContent = previous;
    els.status.textContent = 'Ready';
  }, 1400);
}

function downloadPrompt() {
  const blob = new Blob([els.prompt.value], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chatgpt-sandbox-publisher-prompt.md';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

for (const input of [els.publisher, els.owner, els.visibility]) {
  input.addEventListener('input', render);
  input.addEventListener('change', render);
}

els.copy.addEventListener('click', () => {
  copyPrompt().catch(() => {
    els.prompt.select();
    document.execCommand('copy');
    els.status.textContent = 'Prompt copied to clipboard';
  });
});
els.download.addEventListener('click', downloadPrompt);

loadTemplate().catch((error) => {
  els.status.textContent = 'Could not load prompt template';
  els.prompt.value = `Failed to load prompt.template.md\n\n${error}`;
});
