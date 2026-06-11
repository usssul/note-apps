import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ==================== 嵌套子类型定义 ====================

/** 图片场景信息 */
@Schema({ _id: false })
class ImageSceneInfo {
  @Prop() imageScene: string; // WB_PRV | WB_DFT
  @Prop() url: string;
}

/** 视频流信息 */
@Schema({ _id: false })
class VideoStreamItem {
  @Prop() masterUrl: string;
  @Prop([String]) backupUrls: string[];
  // 视频类型专用字段
  @Prop() fps?: number;
  @Prop() videoBitrate?: number;
  @Prop() width?: number;
  @Prop() height?: number;
  @Prop() hdrType?: number;
  @Prop() ssim?: number;
  @Prop() audioCodec?: string;
  @Prop() format?: string;
  @Prop() videoDuration?: number;
  @Prop() audioBitrate?: number;
  @Prop() streamType?: number;
  @Prop() streamDesc?: string;
  @Prop() avgBitrate?: number;
  @Prop() rotate?: number;
  @Prop() vmaf?: number;
  @Prop() defaultStream?: number;
  @Prop() videoCodec?: string;
  @Prop() audioDuration?: number;
  @Prop() audioChannels?: number;
  @Prop() weight?: number;
  @Prop() duration?: number;
  @Prop() volume?: number;
  @Prop() psnr?: number;
  @Prop() qualityType?: string;
  @Prop() size?: number;
  @Prop() resolution?: number;
}

/** 视频流集合（多编码格式） */
@Schema({ _id: false })
class VideoStream {
  @Prop({ type: [Object] }) h264: VideoStreamItem[];
  @Prop({ type: [Object] }) h265: VideoStreamItem[];
  @Prop({ type: [Object] }) h266: VideoStreamItem[];
  @Prop({ type: [Object] }) av1: VideoStreamItem[];
}

/** 图片项 */
@Schema({ _id: false })
class ImageItem {
  @Prop() height: number;
  @Prop() width: number;
  @Prop({ type: [Object] }) infoList: ImageSceneInfo[];
  @Prop() urlPre: string;
  @Prop() urlDefault: string;
  @Prop({ type: Object }) stream: VideoStream;
  @Prop() fileId: string;
  @Prop() url: string;
  @Prop() traceId: string;
  @Prop() livePhoto: boolean;
}

/** 标签信息 */
@Schema({ _id: false })
class TagItem {
  @Prop() id: string;
  @Prop() name: string;
  @Prop() type: string;
}

/** 分享设置 */
@Schema({ _id: false })
class ShareInfo {
  @Prop() unShare: boolean;
}

/** 用户信息 */
@Schema({ _id: false })
class UserInfo {
  @Prop() userId: string;
  @Prop() nickname: string;
  @Prop() avatar: string;
  @Prop() image?: string; // 评论用户使用 image 字段
  @Prop() xsecToken: string;
}

/** 互动信息 */
@Schema({ _id: false })
class InteractInfo {
  @Prop() relation: string;
  @Prop() liked: boolean;
  @Prop() likedCount: string;
  @Prop() collected: boolean;
  @Prop() collectedCount: string;
  @Prop() commentCount: string;
  @Prop() shareCount: string;
  @Prop() followed: boolean;
}

/** 视频 - capa */
@Schema({ _id: false })
class VideoCapa {
  @Prop() duration: number;
}

/** 视频 - consumer */
@Schema({ _id: false })
class VideoConsumer {
  @Prop() originVideoKey: string;
}

/** 视频 - media - video */
@Schema({ _id: false })
class VideoMediaVideo {
  @Prop() bizName: number;
  @Prop() bizId: string;
  @Prop() duration: number;
  @Prop() md5: string;
  @Prop() hdrType: number;
  @Prop() drmType: number;
  @Prop([Number]) streamTypes: number[];
}

/** 视频 - media */
@Schema({ _id: false })
class VideoMedia {
  @Prop() videoId: number;
  @Prop({ type: Object }) video: VideoMediaVideo;
  @Prop({ type: Object }) stream: VideoStream;
}

/** 视频 - image */
@Schema({ _id: false })
class VideoImage {
  @Prop() thumbnailFileid: string;
}

/** 视频类型笔记专用 */
@Schema({ _id: false })
class VideoInfo {
  @Prop({ type: Object }) capa: VideoCapa;
  @Prop({ type: Object }) consumer: VideoConsumer;
  @Prop({ type: Object }) media: VideoMedia;
  @Prop({ type: Object }) image: VideoImage;
}

/** 目标评论信息（回复目标） */
@Schema({ _id: false })
class TargetComment {
  @Prop() id: string;
  @Prop({ type: Object }) userInfo: UserInfo;
}

/** 子评论 */
@Schema({ _id: false })
class SubComment {
  @Prop() id: string;
  @Prop() noteId: string;
  @Prop() status: number;
  @Prop([String]) atUsers: string[];
  @Prop() likeCount: string;
  @Prop({ type: Object }) userInfo: UserInfo;
  @Prop() createTime: number;
  @Prop() ipLocation: string;
  @Prop({ type: Object }) targetComment: TargetComment;
  @Prop() content: string;
  @Prop() liked: boolean;
  @Prop([String]) showTags: string[];
}

/** 评论 */
@Schema({ _id: false })
class CommentItem {
  @Prop() id: string;
  @Prop() noteId: string;
  @Prop() content: string;
  @Prop({ type: Object }) userInfo: UserInfo;
  @Prop({ type: [Object] }) subComments: SubComment[];
  @Prop() subCommentCount: string;
  @Prop() subCommentCursor: string;
  @Prop() subCommentHasMore: boolean;
  @Prop() status: number;
  @Prop([String]) atUsers: string[];
  @Prop() likeCount: string;
  @Prop() liked: boolean;
  @Prop() createTime: number;
  @Prop() ipLocation: string;
  @Prop([String]) showTags: string[];
  @Prop() expended: boolean;
  @Prop() hasMore: boolean;
}

/** 评论集合 */
@Schema({ _id: false })
class Comments {
  @Prop({ type: [Object] }) list: CommentItem[];
  @Prop() cursor: string;
  @Prop() hasMore: boolean;
  @Prop() loading: boolean;
  @Prop() firstRequestFinish: boolean;
}

/** 笔记主体 */
@Schema({ _id: false })
class Note {
  @Prop() xsecToken: string;
  @Prop() type: string; // normal | video
  @Prop() title: string;
  @Prop({ type: Object }) interactInfo: InteractInfo;
  @Prop({ type: [Object] }) tagList: TagItem[];
  @Prop() time: number;
  @Prop({ type: Object }) shareInfo: ShareInfo;
  @Prop() noteId: string;
  @Prop() desc: string;
  @Prop({ type: Object }) user: UserInfo;
  @Prop({ type: [Object] }) imageList: ImageItem[];
  @Prop([String]) atUserList: string[];
  @Prop() lastUpdateTime: number;
  @Prop() ipLocation: string;
  // 视频类型专用
  @Prop({ type: Object }) video?: VideoInfo;
}

// ==================== 主文档 Schema ====================

@Schema({ 
  collection: 'xhs_notes',
  timestamps: true 
})
export class Xhs extends Document {
  @Prop({ required: true })
  _id: string; // 使用 noteId 作为 _id

  @Prop({ type: Object, required: true })
  note: Note;

  @Prop({ type: Object })
  comments: Comments;

  @Prop()
  currentTime: number;

  // 本地收藏标记
  @Prop({ default: false })
  isFavorited: boolean;

  @Prop()
  favoritedAt: Date;

  // 记录原始数据备份（可选）
  @Prop({ type: Object })
  originalData?: any;
}

export const XhsSchema = SchemaFactory.createForClass(Xhs);
