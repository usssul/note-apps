import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, IsObject, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建小红书笔记的 DTO
 * 直接接收完整的 JSON 数据结构
 */
export class CreateXhsDTO {
  @IsObject()
  @IsNotEmpty({ message: 'note 不能为空' })
  note: {
    xsecToken: string;
    type: string;
    title: string;
    interactInfo: {
      relation: string;
      liked: boolean;
      likedCount: string;
      collected: boolean;
      collectedCount: string;
      commentCount: string;
      shareCount: string;
      followed: boolean;
    };
    tagList: Array<{
      id: string;
      name: string;
      type: string;
    }>;
    time: number;
    shareInfo: {
      unShare: boolean;
    };
    noteId: string;
    desc: string;
    user: {
      userId: string;
      nickname: string;
      avatar: string;
      xsecToken: string;
    };
    imageList: Array<{
      height: number;
      width: number;
      infoList: Array<{
        imageScene: string;
        url: string;
      }>;
      urlPre: string;
      urlDefault: string;
      stream: {
        h264?: Array<{ masterUrl: string; backupUrls: string[] }>;
        h265?: Array<{ masterUrl: string; backupUrls: string[] }>;
        h266?: Array<{ masterUrl: string; backupUrls: string[] }>;
        av1?: Array<{ masterUrl: string; backupUrls: string[] }>;
      };
      fileId: string;
      url: string;
      traceId: string;
      livePhoto: boolean;
    }>;
    atUserList: string[];
    lastUpdateTime: number;
    ipLocation: string;
    // 视频类型专用
    video?: {
      capa: { duration: number };
      consumer: { originVideoKey: string };
      media: {
        videoId: number;
        video: {
          bizName: number;
          bizId: string;
          duration: number;
          md5: string;
          hdrType: number;
          drmType: number;
          streamTypes: number[];
        };
        stream: {
          h264?: Array<any>;
          h265?: Array<any>;
          h266?: Array<any>;
          av1?: Array<any>;
        };
      };
      image: { thumbnailFileid: string };
    };
  };

  @IsObject()
  @IsOptional()
  comments?: {
    list: Array<{
      id: string;
      noteId: string;
      content: string;
      userInfo: {
        userId: string;
        nickname: string;
        image: string;
        xsecToken: string;
      };
      subComments: Array<{
        id: string;
        noteId: string;
        status: number;
        atUsers: string[];
        likeCount: string;
        userInfo: {
          userId: string;
          nickname: string;
          image: string;
          xsecToken: string;
        };
        createTime: number;
        ipLocation: string;
        targetComment: {
          id: string;
          userInfo: {
            userId: string;
            nickname: string;
            image: string;
            xsecToken: string;
          };
        };
        content: string;
        liked: boolean;
        showTags: string[];
      }>;
      subCommentCount: string;
      subCommentCursor: string;
      subCommentHasMore: boolean;
      status: number;
      atUsers: string[];
      likeCount: string;
      liked: boolean;
      createTime: number;
      ipLocation: string;
      showTags: string[];
      expended: boolean;
      hasMore: boolean;
    }>;
    cursor: string;
    hasMore: boolean;
    loading: boolean;
    firstRequestFinish: boolean;
  };

  @IsNumber()
  @IsOptional()
  currentTime?: number;
}
