let cachedGeminiApiKey: string | null = null;

const getGeminiApiKey = async(): Promise<string> => {
  if (cachedGeminiApiKey) {
    return cachedGeminiApiKey;
  }
  const { geminiApiKey }: { geminiApiKey: string } =
    await chrome.storage.local.get(['geminiApiKey']);
  cachedGeminiApiKey = geminiApiKey;
  return geminiApiKey;
};

export const askGemini = async(prompt: string, apiEndPoint: string) => {
  const geminiApiKey = await getGeminiApiKey();

  try {
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
  } catch (error) {
    console.error(error);
  }
};
