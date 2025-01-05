interface WindowWithChangePlayBackRateInitialized extends Window {
  changePlayBackRateInitialized?: boolean;
}

(() => {
  try {

    const windowWithChangePlayBackRateInitialized =
      window as WindowWithChangePlayBackRateInitialized;

    if (
      typeof windowWithChangePlayBackRateInitialized.changePlayBackRateInitialized === 'undefined'
    ) {
      windowWithChangePlayBackRateInitialized.changePlayBackRateInitialized = true;

      chrome.runtime.onMessage.addListener(
        (message: { action: string; speed: number }, sender, sendResponse) => {
          try {
            if (message.action === 'changePlayBackRate') {
              changePlayBackRate(message.speed);
            } else if (message.action === 'getVideoDuration') {
              const video = document.querySelector('video');
              sendResponse({ duration: video?.duration ?? 0 });
              return true;
            }
          } catch (error) {
            console.error('Error changing playback rate:', error);
          }
        });

      function changePlayBackRate(speed: number) {
        try {
          chrome.storage.local.get(['extensionEnabled'], (result) => {
            console.log('Extension enabled:', result.extensionEnabled);
            if (result.extensionEnabled) {
              const video = document.querySelector('video');
              if (video) {
                video.playbackRate = speed;
              } else {
                throw new Error('No video element found');
              }
            } else {
              console.log('Extension is disabled, playback rate change aborted.');
            }
          });
        } catch (error) {
          console.error('Error in changePlayBackRate function:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in the script:', error);
  }
})();
