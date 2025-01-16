import { askGemini } from './lib/gemini';
import { prompt } from './lib/prompt';

const setTimeOutMilSec: number = 2000;
const apiEndPoint: string =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ extensionEnabled: false });
});

chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
  const { extensionEnabled } = await chrome.storage.local.get(['extensionEnabled']);
  if (extensionEnabled === false) return;
  if (changeInfo.url && changeInfo.url.includes('youtube.com/watch?v=')) {
    try {
      setTimeout(async () => {
        const updatedTab: chrome.tabs.Tab = await chrome.tabs.get(tabId);
        const updatedTitle: string = updatedTab.title || '';
        await handleMusicPage(updatedTitle, changeInfo.url || '', tabId);
      }, setTimeOutMilSec);
    } catch (err) {
      console.error('Error in onUpdated listener:', err);
    }
  }
});

chrome.webNavigation.onCompleted.addListener(
  async (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
    const { extensionEnabled } = await chrome.storage.local.get(['extensionEnabled']);
    if (extensionEnabled === false) return;
    if (details.url && details.url.includes('youtube.com/watch?v=')) {
      try {
        setTimeout(async () => {
          const updatedTab: chrome.tabs.Tab = await chrome.tabs.get(details.tabId);
          const updatedTitle: string = updatedTab.title || '';
          await handleMusicPage(updatedTitle, details.url || '', details.tabId);
        }, setTimeOutMilSec);
      } catch (err) {
        console.error('Error in onCompleted listener:', err);
      }
    }
  });

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

const determineContentType = async (tabTitle: string, videoDuration: number): Promise<string> => {
  const videoTitle: string = tabTitle.replace(' - YouTube', '');

  try {
    const geminiRes: GeminiResponse =
      await askGemini(prompt(videoTitle, videoDuration), apiEndPoint);
    const resJson: { contentType: string } =
      JSON.parse(geminiRes.candidates[0].content.parts[0].text);
    return resJson.contentType;
  } catch (error) {
    console.error(error);
    return 'etc';
  }
};

const getVideoIdFromUrl = (url: string): string | null => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('v');
};

async function handleMusicPage(tabTitle: string, tabUrl: string, tabId: number): Promise<void> {
  let playbackRate: number = 1.0;

  try {
    const videoId = getVideoIdFromUrl(tabUrl);
    if (!videoId) return;

    const storedData = await chrome.storage.local.get([videoId]);

    if (storedData[videoId]) {
      const { videoTitle, videoType, playbackRate } = storedData[videoId];

      await chrome.storage.local.set({
        videoTitle,
        videoType,
        playbackRate,
        loadStatus: 'Local cache'
      });

      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        await chrome.tabs.sendMessage(tabId, {
          action: 'changePlayBackRate',
          speed: playbackRate
        });
      } catch (error) {
        console.error('Failed to send message to tab:', error);
      }

      try {
        chrome.runtime.sendMessage({ action: 'updatePopup' });
      } catch (error) {
        console.error('Failed to send message to update popup:', error);
      }
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const videoDuration = await new Promise<number>((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { action: 'getVideoDuration' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response?.duration ?? 0);
        }
      });
    }).catch(error => {
      console.error('Failed to get video duration:', error);
      return 0;
    });

    const contentType: string = await determineContentType(tabTitle, videoDuration);

    const speedMap = {
      'music': 1.0,
      'podcast': 1.25,
      'etc': 2.0
    } as const;

    playbackRate = speedMap[contentType as keyof typeof speedMap];

    try {
      await chrome.tabs.sendMessage(tabId, {
        action: 'changePlayBackRate',
        speed: playbackRate
      });
    } catch (error) {
      console.error('Failed to send message to tab:', error);
    }

    await chrome.storage.local.set({
      [videoId]: {
        videoTitle: tabTitle,
        videoType: contentType,
        playbackRate: playbackRate
      },
      videoTitle: tabTitle,
      videoType: contentType,
      playbackRate: playbackRate,
      loadStatus: 'Gemini API'
    });

    try {
      chrome.runtime.sendMessage({ action: 'updatePopup' });
    } catch (error) {
      console.error('Failed to send message to update popup:', error);
    }

  } catch (err) {
    console.error('Error in handleMusicPage:', err);
    throw err;
  }
}
