import mongoose, {Schema, model, models} from "mongoose";

export const VIDEO_DIMENSIONS = {
    width: 1080,
    height: 1920,
} as const;

export interface IComment {
    _id?: mongoose.Types.ObjectId;
    userId: string;
    userEmail: string;
    userProfilePicture?: string;
    text: string;
    createdAt?: Date;
}

export interface ICaption {
    text: string;
    startTime: number;
    endTime: number;
}

export interface IVideo {
    _id?: mongoose.Types.ObjectId;
    caption: string;
    videoUrl: string;
    thumbnailUrl:  string;
    userId: string;
    userEmail: string;
    userProfilePicture?: string;
    likes: string[];
    comments: IComment[];
    captions: ICaption[];
    controls?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    transformation?: {
        height: number;
        width: number;
        quality?: number;
    }
}

// Define comment schema
const commentSchema = new Schema<IComment>({
    userId: {type: String, required: true},
    userEmail: {type: String, required: true},
    userProfilePicture: {type: String},
    text: {type: String, required: true, maxlength: 500},
}, {timestamps: true});

const captionSchema = new Schema<ICaption>({
    text: {type: String, required: true},
    startTime: {type: Number, required: true},
    endTime: {type: Number, required: true},
});

const videoSchema = new Schema<IVideo>({
    caption: {type: String, required: true, maxlength: 2000},
    videoUrl: {type: String, required: true},
    thumbnailUrl: {type: String, required: true},
    userId: {type: String, required: true},
    userEmail: {type: String, required: true},
    userProfilePicture: {type: String},
    likes: [{type: String}],
    comments: [commentSchema],
    captions: [captionSchema],
    controls: {type: Boolean, default: true},
    transformation: {
        height: {type: Number, default: VIDEO_DIMENSIONS.height},
        width: {type: Number, default: VIDEO_DIMENSIONS.width},
        quality:{type: Number, min: 1, max: 100}
    }  
}, {timestamps: true})

const Video = models?.Video || model<IVideo>("Video", videoSchema);

export default Video;