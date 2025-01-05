const setTimeOutMilSec: number = 2000;
const apiEndPoint: string =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

let geminiApiKey: string = '';

const initializeApiKey = async() => {
  try {
    const { geminiApiKey: apiKey } = await chrome.storage.local.get(['geminiApiKey']);
    geminiApiKey = apiKey;
  } catch (error) {
    console.error('Failed to load API key:', error);
  }
};

initializeApiKey();

export const askGemini = async(prompt: string) => {
  if (!geminiApiKey) {
    throw new Error('API key is not initialized');
  }

  const response = await fetch(
    `${apiEndPoint}?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          response_mime_type: 'application/json',
          response_schema: {
            type: 'OBJECT',
            properties: {
              contentType: {
                type: 'STRING',
                enum: ['music', 'podcast', 'etc']
              }
            }
          }
        }
      })
    });
  return await response.json();
};

chrome.tabs.onUpdated.addListener(async(tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
  const { extensionEnabled } = await chrome.storage.local.get(['extensionEnabled']);
  if (extensionEnabled === false) return;
  if (changeInfo.url && changeInfo.url.includes('youtube.com/watch?v=')) {
    try {
      setTimeout(async() => {
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
  async(details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
    const { extensionEnabled } = await chrome.storage.local.get(['extensionEnabled']);
    if (extensionEnabled === false) return;
    if (details.url && details.url.includes('youtube.com/watch?v=')) {
      try {
        setTimeout(async() => {
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

const determineContentType = async(tabTitle: string, videoDuration: number): Promise<string> => {
  const videoTitle: string = tabTitle.replace(' - YouTube', '');

  const systemPrompt: string = `You are an excellent video profiler.
  Please tell me the content type of the following YouTube video.
  Consider the video title and duration,
  and keep in mind that long videos can be podcasts or music compilations.
  Respond with one of the following options: music, podcast, or etc.`;

  const prompt: string = `${systemPrompt}

  Video Title: ${videoTitle}
  Video Duration: ${videoDuration} seconds.

  Which of the following content types best describes this video: music, podcast, or etc? 
  Explain your reasoning, considering if the title suggests:

  * Music videos or live performances
  * Artists, songs, albums, or genres
  * Music-related terms like "official audio" or "lyrics video"`;

  try {
    const geminiRes: GeminiResponse = await askGemini(prompt);
    const resJson: { contentType: string } =
      JSON.parse(geminiRes.candidates[0].content.parts[0].text);
    console.log(`${videoTitle}:\n ${resJson.contentType}`);
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
      chrome.tabs.sendMessage(tabId, { action: 'changePlayBackRate', speed: playbackRate });
      chrome.runtime.sendMessage({ action: 'updatePopup' });
      return;
    }

    chrome.tabs.sendMessage(tabId, { action: 'getVideoDuration' }, async(response) => {
      const videoDuration = response?.duration ?? 0;
      const contentType: string = await determineContentType(tabTitle, videoDuration);

      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });

      switch (contentType) {
      case 'music':
        playbackRate = 1.0;
        break;
      case 'podcast':
        playbackRate = 1.25;
        break;
      case 'etc':
        playbackRate = 2.0;
        break;
      }

      chrome.tabs.sendMessage(tabId, {
        action: 'changePlayBackRate',
        speed: playbackRate
      });

      // 動画タイトル、種類、再生速度をChromeストレージに保存
      chrome.storage.local.set({
        [videoId]: { videoTitle: tabTitle, videoType: contentType, playbackRate: playbackRate },
        videoTitle: tabTitle,
        videoType: contentType,
        playbackRate: playbackRate,
        loadStatus: 'Gemini API'
      });

      chrome.runtime.sendMessage({ action: 'updatePopup' });
    });

  } catch (err) {
    console.error('Error in handleMusicPage:', err);
  }
}
