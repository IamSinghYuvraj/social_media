import mongoose, {Schema, model, models} from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
    email: string;
    password: string;
    username: string;
    profilePicture?: string;
    bookmarks?: string[];
    followers?: string[]; // userIds who follow this user
    following?: string[]; // userIds this user follows
    stats?: {
        videosPosted: number;
        totalLikes: number;
        totalComments: number;
        totalViews: number;
    };
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        username: {type: String, required: true, unique: true, minlength: 3, maxlength: 30},
        profilePicture: {type: String},
        bookmarks: [{ type: String }],
        followers: [{ type: String }],
        following: [{ type: String }],
        stats: {
            videosPosted: {type: Number, default: 0},
            totalLikes: {type: Number, default: 0},
            totalComments: {type: Number, default: 0},
            totalViews: {type: Number, default: 0}
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password, 10)
    }  
    next();
});

const User = models?.User || model<IUser>("User", userSchema);

export default User;