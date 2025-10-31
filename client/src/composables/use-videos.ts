import { ref } from "vue";

export type Video = {
  url: string;
  title: string;
  length: string;
  thumbnailURL?: string;
  creator?: string;
  isDownloading: boolean;
  progress: number;
  downloadFinished: boolean;
  error?: string | null;
  status?: string | null;
  id: string;
};

const videoTemplate = (url: string, title: string, length: string, thumbnailURL: string, creator: string, id: string) => {
  return {
    url,
    title,
    length,
    thumbnailURL,
    creator,
    isDownloading: false,
    progress: 0,
    downloadFinished: false,
    error: null,
    id,
  } as Video;
};

const queue = ref<Array<Video>>([]);

export const useVideos = () => {
  const createVideo = (videoInfoJson: any) => {
    addVideo(
      videoTemplate(
        videoInfoJson.original_url,
        videoInfoJson.title,
        videoInfoJson.duration_string,
        videoInfoJson.thumbnails?.length ? videoInfoJson.thumbnails[0].url : '',
        videoInfoJson.uploader,
        videoInfoJson.display_id,
      )
    );
  }

  const addVideo = (video: Video) => {
    queue.value.push(video);
  };

  const removeVideo = (index: number) => {
    queue.value.splice(index, 1);
  };

  return {
    queue,
    addVideo,
    removeVideo,
    createVideo,
  };
};