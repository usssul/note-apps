import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Xhs } from './entities/xhs.entity';
import { CreateXhsDTO } from './dto/create-xhs.dto';
import { MinioHelperService } from '../common/services/minio-helper.service';

@Injectable()
export class XhsService {
  constructor(
    @InjectModel(Xhs.name)
    private readonly xhsModel: Model<Xhs>,
    private readonly minioHelperService: MinioHelperService,
  ) {}

  async create(createXhsDTO: CreateXhsDTO): Promise<Xhs> {
    const { note, comments, currentTime } = createXhsDTO;
    
    if (!note?.noteId) {
      throw new BadRequestException('noteId 不能为空');
    }

    const existing = await this.xhsModel.findById(note.noteId).exec();
    if (existing) {
      throw new BadRequestException(`笔记已存在: ${note.noteId}`);
    }

    const originalData = JSON.parse(JSON.stringify(createXhsDTO));

    const processedData = await this.processMediaResources(createXhsDTO);

    const xhs = new this.xhsModel({
      _id: note.noteId,
      note: processedData.note,
      comments: processedData.comments,
      currentTime: currentTime || Date.now(),
      originalData,
    });

    return xhs.save();
  }

  private async processMediaResources(data: CreateXhsDTO): Promise<CreateXhsDTO> {
    const { note, comments } = data;
    const processedNote = { ...note };
    const processedComments = comments ? { ...comments } : undefined;

    console.log(`[Xhs] 开始处理媒体资源: ${note.noteId}`);

    if (note.user?.avatar) {
      const avatarUrl = await this.minioHelperService.uploadByUrlToBucket(
        note.user.avatar,
        'avatar'
      );
      processedNote.user = {
        ...note.user,
        avatar: avatarUrl || '',
      };
    }

    if (note.imageList && note.imageList.length > 0) {
      processedNote.imageList = await Promise.all(
        note.imageList.map(async (image) => {
          const processedImage = { ...image };

          if (image.urlDefault) {
            const imageUrl = await this.minioHelperService.uploadByUrlToBucket(
              image.urlDefault,
              'xhs'
            );
            processedImage.urlDefault = imageUrl || '';
          }

          processedImage.urlPre = '';
          processedImage.url = '';
          if (processedImage.infoList) {
            processedImage.infoList = processedImage.infoList.map((info) => ({
              ...info,
              url: '',
            }));
          }

          if (image.livePhoto && image.stream) {
            const videoUrl = this.minioHelperService.selectBestVideoStream(image.stream);
            if (videoUrl) {
              const savedVideoUrl = await this.minioHelperService.uploadByUrlToBucket(
                videoUrl,
                'xhs-video'
              );
              processedImage.stream = {
                h264: savedVideoUrl ? [{ masterUrl: savedVideoUrl, backupUrls: [] }] : [],
                h265: [],
                h266: [],
                av1: [],
              };
            } else {
              processedImage.stream = { h264: [], h265: [], h266: [], av1: [] };
            }
          } else {
            processedImage.stream = { h264: [], h265: [], h266: [], av1: [] };
          }

          return processedImage;
        })
      );
    }

    if (note.type === 'video' && note.video?.media?.stream) {
      const videoUrl = this.minioHelperService.selectBestVideoStream(note.video.media.stream);
      if (videoUrl) {
        const savedVideoUrl = await this.minioHelperService.uploadByUrlToBucket(
          videoUrl,
          'xhs-video'
        );
        processedNote.video = {
          ...note.video,
          media: {
            ...note.video.media,
            stream: {
              h264: savedVideoUrl ? [{ masterUrl: savedVideoUrl, backupUrls: [] }] : [],
              h265: [],
              h266: [],
              av1: [],
            },
          },
        };
      }
    }

    if (comments?.list && comments.list.length > 0) {
      processedComments.list = await Promise.all(
        comments.list.map(async (comment) => {
          const processedComment = { ...comment };

          if (comment.userInfo?.image) {
            const avatarUrl = await this.minioHelperService.uploadByUrlToBucket(
              comment.userInfo.image,
              'avatar'
            );
            processedComment.userInfo = {
              ...comment.userInfo,
              image: avatarUrl || '',
            };
          }

          if (comment.subComments && comment.subComments.length > 0) {
            processedComment.subComments = await Promise.all(
              comment.subComments.map(async (subComment) => {
                const processedSubComment = { ...subComment };

                if (subComment.userInfo?.image) {
                  const avatarUrl = await this.minioHelperService.uploadByUrlToBucket(
                    subComment.userInfo.image,
                    'avatar'
                  );
                  processedSubComment.userInfo = {
                    ...subComment.userInfo,
                    image: avatarUrl || '',
                  };
                }

                if (subComment.targetComment?.userInfo?.image) {
                  const targetAvatarUrl = await this.minioHelperService.uploadByUrlToBucket(
                    subComment.targetComment.userInfo.image,
                    'avatar'
                  );
                  processedSubComment.targetComment = {
                    ...subComment.targetComment,
                    userInfo: {
                      ...subComment.targetComment.userInfo,
                      image: targetAvatarUrl || '',
                    },
                  };
                }

                return processedSubComment;
              })
            );
          }

          return processedComment;
        })
      );
    }

    console.log(`[Xhs] 媒体资源处理完成: ${note.noteId}`);

    return {
      ...data,
      note: processedNote,
      comments: processedComments,
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: { keyword?: string; nickname?: string; title?: string },
  ): Promise<{
    list: Xhs[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: any = {};
    if (search?.keyword) {
      filter.$or = [
        { 'note.user.nickname': { $regex: search.keyword, $options: 'i' } },
        { 'note.title': { $regex: search.keyword, $options: 'i' } },
      ];
    } else {
      if (search?.nickname) {
        filter['note.user.nickname'] = { $regex: search.nickname, $options: 'i' };
      }
      if (search?.title) {
        filter['note.title'] = { $regex: search.title, $options: 'i' };
      }
    }

    const skip = (page - 1) * limit;
    const [list, total] = await Promise.all([
      this.xhsModel
        .find(filter)
        .sort({ currentTime: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.xhsModel.countDocuments(filter).exec(),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(noteId: string): Promise<Xhs> {
    const xhs = await this.xhsModel.findById(noteId).exec();
    if (!xhs) {
      throw new NotFoundException(`笔记不存在: ${noteId}`);
    }
    return xhs;
  }

  async update(noteId: string, updateData: Partial<CreateXhsDTO>): Promise<Xhs> {
    const existing = await this.xhsModel.findById(noteId).exec();
    if (!existing) {
      throw new NotFoundException(`笔记不存在: ${noteId}`);
    }

    let processedData = updateData;
    if (updateData.note || updateData.comments) {
      processedData = await this.processMediaResources({
        note: updateData.note || existing.note,
        comments: updateData.comments || existing.comments,
        currentTime: updateData.currentTime,
      } as CreateXhsDTO);
    }

    const updated = await this.xhsModel
      .findByIdAndUpdate(
        noteId,
        {
          $set: {
            ...(processedData.note && { note: processedData.note }),
            ...(processedData.comments && { comments: processedData.comments }),
            ...(processedData.currentTime && { currentTime: processedData.currentTime }),
          },
        },
        { new: true }
      )
      .exec();

    return updated;
  }

  async remove(noteId: string): Promise<{ deleted: boolean; noteId: string }> {
    const result = await this.xhsModel.findByIdAndDelete(noteId).exec();
    if (!result) {
      throw new NotFoundException(`笔记不存在: ${noteId}`);
    }
    return { deleted: true, noteId };
  }

  async batchCreate(notes: CreateXhsDTO[]): Promise<{
    success: number;
    failed: number;
    results: Array<{ noteId: string; status: 'success' | 'failed'; error?: string }>;
  }> {
    const results: Array<{ noteId: string; status: 'success' | 'failed'; error?: string }> = [];
    let success = 0;
    let failed = 0;

    for (const noteData of notes) {
      try {
        await this.create(noteData);
        results.push({ noteId: noteData.note.noteId, status: 'success' });
        success++;
      } catch (error) {
        results.push({
          noteId: noteData.note?.noteId || 'unknown',
          status: 'failed',
          error: error.message,
        });
        failed++;
      }
    }

    return { success, failed, results };
  }

  async exists(noteId: string): Promise<boolean> {
    const count = await this.xhsModel.countDocuments({ _id: noteId }).exec();
    return count > 0;
  }

  async getStatistics(): Promise< number > {
    try {
      const total = await this.xhsModel.countDocuments({}).exec();
      return total ;
    } catch (error) {
      throw new Error(`获取统计信息失败: ${error.message}`);
    }
  }
}
