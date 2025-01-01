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
          const video = document.querySelector('video');
          if (video) {
            video.playbackRate = speed;
            console.log(`Playback rate successfully changed to ${speed}`);
          } else {
            throw new Error('No video element found');
          }
        } catch (error) {
          console.error('Error in changePlayBackRate function:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in the script:', error);
  }
})();
