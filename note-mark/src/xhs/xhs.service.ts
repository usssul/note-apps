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
    search?: { keyword?: string; nickname?: string; title?: string; userId?: string; type?: string; isFavorited?: boolean },
  ): Promise<{
    list: Xhs[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    typeCounts: { type: string; count: number }[];
    favoritedCount: number;
  }> {
    const filter: any = {};
    if (search?.userId) {
      filter['note.user.userId'] = search.userId;
    } else if (search?.keyword) {
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

    // type 过滤可与任意条件组合（AND）
    if (search?.type) {
      filter['note.type'] = search.type;
    }

    // 收藏过滤
    if (search?.isFavorited !== undefined) {
      filter.isFavorited = search.isFavorited;
    }

    const skip = (page - 1) * limit;
    const [list, total, typeCounts, favoritedCount] = await Promise.all([
      this.xhsModel
        .find(filter)
        .sort({ currentTime: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.xhsModel.countDocuments(filter).exec(),
      // 类型分布计数（不受 filter 影响，始终全局）
      this.xhsModel.aggregate([
        { $group: { _id: '$note.type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } },
      ]).exec(),
      // 收藏总数（全局）
      this.xhsModel.countDocuments({ isFavorited: true }).exec(),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      typeCounts,
      favoritedCount,
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

  /**
   * 切换收藏状态
   * @returns 更新后的文档
   */
  async toggleFavorite(noteId: string): Promise<Xhs> {
    const note = await this.xhsModel.findById(noteId).exec();
    if (!note) {
      throw new NotFoundException(`笔记不存在: ${noteId}`);
    }

    const newState = !note.isFavorited;
    const updated = await this.xhsModel
      .findByIdAndUpdate(
        noteId,
        {
          $set: {
            isFavorited: newState,
            favoritedAt: newState ? new Date() : null,
          },
        },
        { new: true },
      )
      .exec();

    return updated;
  }

  async getStatistics(): Promise< number > {
    try {
      const total = await this.xhsModel.countDocuments({}).exec();
      return total ;
    } catch (error) {
      throw new Error(`获取统计信息失败: ${error.message}`);
    }
  }

  async getDashboardStats() {
    try {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const [
        totalCount,
        typeDistribution,
        monthlyTrend,
        topCollectedUsers,
        interactionTotals,
        topLikedNotes,
        tagCloud,
        regionDistribution,
        recentNotes,
      ] = await Promise.all([
        // 总笔记数
        this.xhsModel.countDocuments({}).exec(),

        // 笔记类型分布 (normal / video)
        this.xhsModel.aggregate([
          { $group: { _id: '$note.type', count: { $sum: 1 } } },
          { $project: { type: '$_id', count: 1, _id: 0 } },
        ]).exec(),

        // 月度趋势
        this.xhsModel.aggregate([
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m',
                  date: { $toDate: { $ifNull: ['$note.time', '$currentTime'] } },
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { month: '$_id', count: 1, _id: 0 } },
        ]).exec(),

        // 收录最多的博主（Top 10，按笔记数排序）
        this.xhsModel.aggregate([
          {
            $group: {
              _id: '$note.user.userId',
              nickname: { $first: '$note.user.nickname' },
              avatar: { $first: '$note.user.avatar' },
              noteCount: { $sum: 1 },
            },
          },
          { $sort: { noteCount: -1 } },
          { $limit: 10 },
          {
            $project: {
              userId: '$_id',
              nickname: 1,
              avatar: 1,
              noteCount: 1,
              _id: 0,
            },
          },
        ]).exec(),

        // 互动总和（处理 "1.1万"、"10+" 等非标格式）
        this.xhsModel.aggregate([
          {
            $addFields: {
              _rawLiked: {
                $cond: { if: { $in: [{ $ifNull: ['$note.interactInfo.likedCount', ''] }, ['', null]] }, then: '0', else: '$note.interactInfo.likedCount' },
              },
              _rawCollected: {
                $cond: { if: { $in: [{ $ifNull: ['$note.interactInfo.collectedCount', ''] }, ['', null]] }, then: '0', else: '$note.interactInfo.collectedCount' },
              },
              _rawComment: {
                $cond: { if: { $in: [{ $ifNull: ['$note.interactInfo.commentCount', ''] }, ['', null]] }, then: '0', else: '$note.interactInfo.commentCount' },
              },
              _rawShare: {
                $cond: { if: { $in: [{ $ifNull: ['$note.interactInfo.shareCount', ''] }, ['', null]] }, then: '0', else: '$note.interactInfo.shareCount' },
              },
            },
          },
          {
            $addFields: {
              _cleanLiked: {
                $cond: { if: { $regexMatch: { input: '$_rawLiked', regex: '万' } }, then: { $replaceAll: { input: '$_rawLiked', find: '万', replacement: '' } }, else: '$_rawLiked' },
              },
              _cleanCollected: {
                $cond: { if: { $regexMatch: { input: '$_rawCollected', regex: '万' } }, then: { $replaceAll: { input: '$_rawCollected', find: '万', replacement: '' } }, else: '$_rawCollected' },
              },
              _cleanComment: {
                $cond: { if: { $regexMatch: { input: '$_rawComment', regex: '万' } }, then: { $replaceAll: { input: '$_rawComment', find: '万', replacement: '' } }, else: '$_rawComment' },
              },
              _cleanShare: {
                $cond: { if: { $regexMatch: { input: '$_rawShare', regex: '万' } }, then: { $replaceAll: { input: '$_rawShare', find: '万', replacement: '' } }, else: '$_rawShare' },
              },
            },
          },
          {
            $addFields: {
              _numLiked: { $convert: { input: '$_cleanLiked', to: 'double', onError: 0, onNull: 0 } },
              _numCollected: { $convert: { input: '$_cleanCollected', to: 'double', onError: 0, onNull: 0 } },
              _numComment: { $convert: { input: '$_cleanComment', to: 'double', onError: 0, onNull: 0 } },
              _numShare: { $convert: { input: '$_cleanShare', to: 'double', onError: 0, onNull: 0 } },
            },
          },
          {
            $addFields: {
              likedNum: {
                $cond: { if: { $regexMatch: { input: '$_rawLiked', regex: '万' } }, then: { $multiply: ['$_numLiked', 10000] }, else: '$_numLiked' },
              },
              collectedNum: {
                $cond: { if: { $regexMatch: { input: '$_rawCollected', regex: '万' } }, then: { $multiply: ['$_numCollected', 10000] }, else: '$_numCollected' },
              },
              commentNum: {
                $cond: { if: { $regexMatch: { input: '$_rawComment', regex: '万' } }, then: { $multiply: ['$_numComment', 10000] }, else: '$_numComment' },
              },
              shareNum: {
                $cond: { if: { $regexMatch: { input: '$_rawShare', regex: '万' } }, then: { $multiply: ['$_numShare', 10000] }, else: '$_numShare' },
              },
            },
          },
          {
            $group: {
              _id: null,
              totalLikes: { $sum: '$likedNum' },
              totalCollects: { $sum: '$collectedNum' },
              totalComments: { $sum: '$commentNum' },
              totalShares: { $sum: '$shareNum' },
            },
          },
          { $project: { _id: 0 } },
        ]).exec(),

        // Top 10 点赞笔记（aggregation 转数值排序，likedCount 是字符串如 "934"、"1.1万"、空串）
        this.xhsModel.aggregate([
          {
            $addFields: {
              // 空字符串和 null 统一视为 '0'
              _rawLiked: {
                $cond: {
                  if: { $in: [{ $ifNull: ['$note.interactInfo.likedCount', ''] }, ['', null]] },
                  then: '0',
                  else: '$note.interactInfo.likedCount',
                },
              },
            },
          },
          {
            $addFields: {
              _cleanLiked: {
                $cond: { if: { $regexMatch: { input: '$_rawLiked', regex: '万' } }, then: { $replaceAll: { input: '$_rawLiked', find: '万', replacement: '' } }, else: '$_rawLiked' },
              },
            },
          },
          {
            $addFields: {
              _numLiked: { $convert: { input: '$_cleanLiked', to: 'double', onError: 0, onNull: 0 } },
            },
          },
          {
            $addFields: {
              likedCountNum: {
                $cond: { if: { $regexMatch: { input: '$_rawLiked', regex: '万' } }, then: { $multiply: ['$_numLiked', 10000] }, else: '$_numLiked' },
              },
            },
          },
          { $sort: { likedCountNum: -1 } },
          { $limit: 10 },
          {
            $project: {
              'note.noteId': 1,
              'note.title': 1,
              'note.type': 1,
              'note.user.userId': 1,
              'note.user.nickname': 1,
              'note.user.avatar': 1,
              'note.imageList.urlDefault': 1,
              'note.interactInfo.likedCount': 1,
              'note.interactInfo.collectedCount': 1,
              'note.time': 1,
            },
          },
        ]).exec(),

        // 热门标签云（前 50）
        this.xhsModel.aggregate([
          { $unwind: { path: '$note.tagList', preserveNullAndEmptyArrays: false } },
          {
            $group: {
              _id: '$note.tagList.name',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 50 },
          { $project: { name: '$_id', count: 1, _id: 0 } },
        ]).exec(),

        // 地区分布
        this.xhsModel.aggregate([
          {
            $match: {
              'note.ipLocation': { $nin: [null, ''] },
            },
          },
          {
            $group: {
              _id: '$note.ipLocation',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 20 },
          { $project: { region: '$_id', count: 1, _id: 0 } },
        ]).exec(),

        // 最近 7 天收录
        this.xhsModel.find(
          { currentTime: { $gte: sevenDaysAgo } },
          {
            'note.noteId': 1,
            'note.title': 1,
            'note.type': 1,
            'note.user.userId': 1,
            'note.user.nickname': 1,
            'note.user.avatar': 1,
            'note.imageList.urlDefault': 1,
            'note.interactInfo.likedCount': 1,
            currentTime: 1,
          },
        )
          .sort({ currentTime: -1 })
          .limit(10)
          .lean()
          .exec(),
      ]);

      // 统计总用户数（去重）
      const uniqueUsers = await this.xhsModel.distinct('note.user.userId').exec();

      return {
        totalCount,
        uniqueUserCount: uniqueUsers.length,
        typeDistribution,
        monthlyTrend,
        topCollectedUsers,
        interactionTotals: interactionTotals[0] || {
          totalLikes: 0,
          totalCollects: 0,
          totalComments: 0,
          totalShares: 0,
        },
        topLikedNotes,
        tagCloud,
        regionDistribution,
        recentNotes,
      };
    } catch (error) {
      throw new Error(`获取仪表盘统计失败: ${error.message}`);
    }
  }
}
