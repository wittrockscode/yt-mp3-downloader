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
  blob?: Blob;
  fullTitle?: string;
  duplicateAnimation: boolean;
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
    fullTitle: creator ? `${title} - ${creator}` : title,
    duplicateAnimation: false,
  } as Video;
};

export const createVideo = (videoInfoJson: any) => {
  return videoTemplate(
    videoInfoJson.original_url,
    videoInfoJson.title,
    videoInfoJson.duration,
    videoInfoJson.thumbnails?.length ? videoInfoJson.thumbnails[0].url : '',
    videoInfoJson.uploader,
    videoInfoJson.id,
  );
};

const videos = ref<Array<Video>>([]);

export const useVideos = () => {
  const addVideo = (video: Video) => {
    videos.value.push(video);
  };

  const removeVideo = (index: number) => {
    videos.value.splice(index, 1);
  };

  return {
    videos,
    addVideo,
    removeVideo,
  };
};