console.log('popup.js loaded');

import { render } from 'preact';
import { getApiKeyFromChromeStorage, setApiKeyToChromeStorage } from './lib/apiKey';

window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    render(<MainPopup/>, root);
  }
})


const MainPopup = () => {
  return (
    <>
      <PopupHeader />
      <form id="api-key-form">
        <input
          type="password"
          id="api-key"
          placeholder="Input your API key from aistudio.google.com"
        />
        <button type="submit">Save</button>
      </form>
      <div class="controls-wrapper">
        <div id="status-message" class="status-text">Status: </div>
        <label class="toggle-switch">
          <input type="checkbox" id="extension-toggle" />
          <span class="toggle-slider"></span>
          Enable Extension
        </label>
      </div>
      <VideoInfoElement
        title="Title: "
        kind="Kind: "
        playbackRate="Playback Rate: "
        loadFrom="Processed by: "
      />
    </>
  );
}

const PopupHeader = () => (
  <div class="header">
    <h1>Auto Speed YT</h1>
    <a href="https://github.com/izumiz-dev/auto-speed-yt" target="_blank">View on GitHub</a>
  </div>
)

const VideoInfoElement = ({ title = '', kind = '', playbackRate = '', loadFrom = ''}) => {
  return (
    <div id="video-info">
      <p id="video-title">Title: {title}</p>
      <p id="video-type">Kind: {kind}</p>
      <p id="playback-rate">Playback Rate: {playbackRate}</p>
      <p id="load-status">Processed by: {loadFrom}</p>
    </div>
  );
}

// fooobarrr


const updateVideoInfo = (
  title: string,
  type: string,
  playbackRate: number,
  loadStatus: string
): void => {
  const videoTitleElement = document.getElementById('video-title');
  const videoTypeElement = document.getElementById('video-type');
  const playbackRateElement = document.getElementById('playback-rate');
  const loadStatusElement = document.getElementById('load-status');
  if (videoTitleElement && videoTypeElement && playbackRateElement && loadStatusElement) {
    videoTitleElement.textContent = `Title: ${title}`;
    videoTypeElement.textContent = `Kind: ${type}`;
    playbackRateElement.textContent = `Playback Rate: ${playbackRate}`;
    loadStatusElement.textContent = `Processed by: ${loadStatus}`;
  }
};

const updatePopupContent = (): void => {
  chrome.storage.local.get([
    'videoTitle', 'videoType', 'playbackRate', 'loadStatus'
  ], (result) => {
    const { videoTitle, videoType, playbackRate, loadStatus } = result;
    if (videoTitle && videoType && playbackRate !== undefined) {
      updateVideoInfo(videoTitle, videoType, playbackRate, loadStatus || '');
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const statusMessage: HTMLElement | null = document.getElementById('status-message');
  const form: HTMLElement | null = document.getElementById('api-key-form');
  const input: HTMLElement | null = document.getElementById('api-key');
  let key: string  = '';

  getApiKeyFromChromeStorage().then((apiKey) => {
    key = apiKey;

    if (key) {
      if (statusMessage) {
        statusMessage.textContent = 'API Key: Already set';
        statusMessage.classList.add('status-subdued');
      }
      if (form) {
        form.style.display = 'none';
      }
    }

    if (!form || !statusMessage) {
      console.error('Required elements not found');
      return;
    }

    chrome.storage.local.get([
      'videoTitle',
      'videoType',
      'playbackRate',
      'loadStatus'
    ], (result) => {
      const { videoTitle, videoType, playbackRate, loadStatus } = result;
      if (videoTitle && videoType && playbackRate !== undefined) {
        updateVideoInfo(videoTitle, videoType, playbackRate, loadStatus || '');
      }
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.loadStatus) {
        const loadStatusElement = document.getElementById('load-status');
        if (loadStatusElement) {
          loadStatusElement.textContent = `Processed by: ${changes.loadStatus.newValue}`;
        }
      }
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'updatePopup') {
        updatePopupContent();
      }
    });

    form.addEventListener('submit', (e: SubmitEvent) => {
      e.preventDefault();
      if (!input) return;
      const geminiApiKey = (input as HTMLInputElement).value;
      setApiKeyToChromeStorage(geminiApiKey);

      statusMessage.textContent = 'Submitted!';
      form.style.display = 'none';
    });
  });

  const toggleCheckbox = document.getElementById('extension-toggle') as HTMLInputElement;
  chrome.storage.local.get(['extensionEnabled'], (res) => {
    toggleCheckbox.checked = res.extensionEnabled !== false;
  });
  toggleCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ extensionEnabled: toggleCheckbox.checked });
  });
});

