export const setApiKeyToChromeStorage = async (geminiApiKey: string): Promise<void> => {
  try {
    await chrome.storage.local.set({ geminiApiKey });
  } catch (error) {
    console.error(error);
  }
};

export const getApiKeyFromChromeStorage = async (): Promise<string> => {
  try {
    const { geminiApiKey } = await chrome.storage.local.get(['geminiApiKey']);
    return geminiApiKey;
  } catch (error) {
    console.error(error);
    return '';
  }
};