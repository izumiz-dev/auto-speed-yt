const setTimeOutMillsec: number = 2000;
const apiEndPoint: string =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const geminiApiKey: string = 'your-api-key';

export const askGemini = async(prompt: string) => {
  const response = await fetch(`${apiEndPoint}?key=${geminiApiKey}`,
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
    }
  );
  return await response.json();
};

chrome.tabs.onUpdated.addListener(async(tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
  if (changeInfo.url && changeInfo.url.includes('youtube.com/watch?v=')) {
    try {
      setTimeout(async() => {
        const updatedTab: chrome.tabs.Tab = await chrome.tabs.get(tabId);
        const updatedTitle: string = updatedTab.title || '';
        await handleMusicPage(updatedTitle, changeInfo.url || '', tabId);
      }, setTimeOutMillsec);
    } catch (err) {
      console.error('Error in onUpdated listener:', err);
    }
  }
});

chrome.webNavigation.onCompleted.addListener(
  async(details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
    if (details.url && details.url.includes('youtube.com/watch?v=')) {
      try {
        setTimeout(async() => {
          const updatedTab: chrome.tabs.Tab = await chrome.tabs.get(details.tabId);
          const updatedTitle: string = updatedTab.title || '';
          await handleMusicPage(updatedTitle, details.url || '', details.tabId);
        }, setTimeOutMillsec);
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
  const systemPrompt: string = `
    You are an excellent video profiler.
    Please note that extremely long videos tend to be podcasts,
    but they can also be long due to multiple songs being played.
    Please consider this when making your determination.
    Please tell me the content type of the following YouTube video.
    `;
  const prompt: string = `
    ${systemPrompt}
    Is this YouTube video title and duration related to music, podcast, or etc?
    Video Title: ${videoTitle}
    Video Duration${videoDuration} seconds.`;
  try {
    const geminiRes: GeminiResponse = await askGemini(prompt);
    const resJson: { contentType: string } =
      JSON.parse(geminiRes.candidates[0].content.parts[0].text);
    console.log(`${videoTitle}:\n ${resJson.contentType}`);
    return resJson.contentType;
  } catch (error) {
    console.error('音楽関連の判定中にエラーが発生しました:', error);
    return 'etc';
  }
};

async function handleMusicPage(tabTitle: string, tabUrl: string, tabId: number): Promise<void> {
  let playbackRate: number = 1.75;
  try {
    if (!tabUrl.includes('youtube.com/watch?v=')) return;

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
        playbackRate = 1.75;
        break;
      }

      await chrome.tabs.sendMessage(tabId, {
        action: 'changePlayBackRate',
        speed: playbackRate
      });
    });

  } catch (err) {
    console.error('Error in handleMusicPage:', err);
  }
}
