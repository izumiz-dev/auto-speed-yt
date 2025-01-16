const systemPrompt: string = `You are an excellent video profiler.
  Please tell me the content type of the following YouTube video.
  Consider the video title and duration,
  and keep in mind that long videos can be podcasts or music compilations.
  Respond with one of the following options: music, podcast, or etc.`;

export const prompt = (videoTitle: string, videoDuration: number): string => `${systemPrompt}

  Video Title: ${videoTitle}
  Video Duration: ${videoDuration} seconds.

  Which of the following content types best describes this video: music, podcast, or etc? 
  Explain your reasoning, considering if the title suggests:

  * Music videos or live performances
  * Artists, songs, albums, or genres
  * Music-related terms like "official audio" or "lyrics video"`;
