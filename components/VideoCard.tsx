import React, {useState, useCallback} from 'react'
import {getCldImageUrl, getCldVideoUrl} from "next-cloudinary"
import { Download, Clock, FileDown, FileUp, PlayCircle } from "lucide-react";
import dayjs from 'dayjs';
import realtiveTime from "dayjs/plugin/relativeTime"
import {filesize} from "filesize"
import { Video } from '@/types';

dayjs.extend(realtiveTime)

interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;
    onDelete?: (video: Video) => void;
}

const  VideoCard: React.FC<VideoCardProps> = ({video, onDownload, onDelete}) => {
    const [isHovered, setIsHovered] = useState(false)
    const [previewError, setPreviewError] = useState(false)
    const [showPlayer, setShowPlayer] = useState(false)

    const handlePreviewError = () => {
      setPreviewError(true);
    };

    const getThumbnailUrl = useCallback((publicId: string) => {
        return getCldImageUrl({
            src: publicId,
            width: 400,
            height: 225,
            crop: "fill",
            gravity: "auto",
            format: "jpg",
            quality: "auto",
            assetType: "video"
        })
    }, [])

    const getFullVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 1920,
            height: 1080,

        })
    }, [])

    const getPreviewVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 400,
            height: 225,
            rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"]

        })
    }, [])

    const formatSize = useCallback((size: number) => {
        return filesize(size)
    }, [])

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
      }, []);


    const compressionPercentage = Math.round(
        (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
    );

    return (
        <>
            <div
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <figure className="aspect-video relative">
                    {isHovered ? (
                        previewError ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <p className="text-red-500">Preview not available</p>
                            </div>
                        ) : (
                            <video
                                src={getPreviewVideoUrl(video.publicId)}
                                autoPlay
                                muted
                                loop
                                className="w-full h-full object-cover"
                                onError={handlePreviewError}
                            />
                        )
                    ) : (
                        <>
                            <img
                                src={getThumbnailUrl(video.publicId)}
                                alt={video.title}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition group"
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowPlayer(true);
                                }}
                                aria-label="Play video"
                            >
                                <PlayCircle size={64} className="text-white opacity-80 group-hover:opacity-100" />
                            </button>
                        </>
                    )}
                    <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
                        <Clock size={16} className="mr-1" />
                        {formatDuration(video.duration)}
                    </div>
                </figure>
                <div className="card-body p-4">
                    <h2 className="card-title text-lg font-bold">{video.title}</h2>
                    <p className="text-sm text-base-content opacity-70 mb-4">
                        {video.description}
                    </p>
                    <p className="text-sm text-base-content opacity-70 mb-4">
                        Uploaded {dayjs(video.createdAt).fromNow()}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                            <FileUp size={18} className="mr-2 text-primary" />
                            <div>
                                <div className="font-semibold">Original</div>
                                <div>{formatSize(Number(video.originalSize))}</div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <FileDown size={18} className="mr-2 text-secondary" />
                            <div>
                                <div className="font-semibold">Compressed</div>
                                <div>{formatSize(Number(video.compressedSize))}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm font-semibold">
                            Compression: <span className="text-accent">{compressionPercentage}%</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button
                                className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none flex items-center justify-center"
                                onClick={() => setShowPlayer(true)}
                                aria-label="Play video"
                            >
                                <PlayCircle size={18} className="text-white" />
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                    onDownload(getFullVideoUrl(video.publicId), video.title)
                                }
                            >
                                <Download size={16} />
                            </button>
                            <button
                                className="btn btn-error btn-sm"
                                onClick={() => onDelete && onDelete(video)}
                                aria-label="Delete video"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                    <div className="relative w-full max-w-3xl mx-auto">
                        <button
                            className="absolute top-2 right-2 text-white text-2xl z-10"
                            onClick={() => setShowPlayer(false)}
                            aria-label="Close video"
                        >
                            &times;
                        </button>
                        <video
                            src={getFullVideoUrl(video.publicId)}
                            controls
                            autoPlay
                            className="w-full h-auto rounded-lg shadow-lg bg-black"
                            style={{ maxHeight: '80vh' }}
                        />
                    </div>
                </div>
            )}
        </>
    );

}

export default VideoCard;
