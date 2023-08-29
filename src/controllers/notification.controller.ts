/* eslint-disable @typescript-eslint/no-unused-vars */
import {inject} from '@loopback/core';
import {FilterExcludingWhere, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  put,
  Request,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import jwt from 'jsonwebtoken';
import {ApiResponse} from '../@types';
import {Notification} from '../models';
import {NotificationsRepository, ProfileRepository} from '../repositories';

export class NotificationController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @repository(NotificationsRepository)
    public notificationRepository: NotificationsRepository,
    @repository(ProfileRepository)
    public profileModel: ProfileRepository,
  ) {}

  @post('/notifications')
  @response(200, {
    description: 'Notification model instance',
    content: {'application/json': {schema: getModelSchemaRef(Notification)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              destinataries: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              msg: {
                type: 'string',
              },
              tenant: {
                type: 'number',
              },
            },
          },
        },
      },
    })
    body: {
      destinataries: string[];
      msg: string;
      tenant: number;
    },
  ): Promise<ApiResponse<Notification>> {
    try {
      const token = this.request.headers.authorization?.split(' ')[1];
      if (!token) throw new HttpErrors.Unauthorized('Token not found');
      jwt.verify(token, process.env.JWT_SECRET as string, err => {
        if (err) throw new HttpErrors.Unauthorized('Invalid token');
      });
      const createdNotification = await this.notificationRepository.create({
        destinataries: JSON.stringify(body.destinataries)
          .replace('[', '{')
          .replace(']', '}') as unknown as string[],
        msg: body.msg,
        tenant: body.tenant,
        profilesThatRead: '{}' as unknown as number[],
      });

      return {
        statusCode: 200,
        ok: true,
        message: 'Notification created',
        data: createdNotification,
      };
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message);
    }
  }

  @get('/notifications')
  @response(200, {
    description: 'Array of notifications by user',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Notification, {includeRelations: true}),
        },
      },
    },
  })
  async findNotifications(): Promise<ApiResponse<Notification[]>> {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) throw new HttpErrors.Unauthorized('Token not found');
    jwt.verify(token, process.env.JWT_SECRET as string, err => {
      if (err) throw new HttpErrors.Unauthorized('Invalid token');
    });
    const decoded = jwt.decode(token) as unknown as {
      email: string;
      canonicalName: string;
      roles: string[];
      username: string;
      id: number;
    };
    console.log(decoded);
    const profile = await this.profileModel.findOne({
      where: {
        user: decoded.id,
      },
    });
    if (!profile) {
      throw new HttpErrors.NotFound('Profile not found');
    }
    if (!decoded) throw new HttpErrors.Unauthorized('Invalid token');
    const notifications = await this.notificationRepository.find();
    if (!notifications || notifications.length === 0)
      throw new HttpErrors.NotFound('No notifications found');
    const queriedNotifications = [];
    for (const role of decoded.roles) {
      for (const notification of notifications) {
        if (notification.destinataries.includes(role)) {
          queriedNotifications.push(notification);
        }
      }
    }

    return {
      ok: true,
      statusCode: 200,
      message: 'Notifications found',
      data: queriedNotifications,
    };
  }

  @get('/notifications/{id}')
  @response(200, {
    description: 'Notification model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Notification, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Notification, {exclude: 'where'})
    filter?: FilterExcludingWhere<Notification>,
  ): Promise<ApiResponse<Notification>> {
    try {
      const foundNotification = await this.notificationRepository.findById(
        id,
        filter,
      );
      if (!foundNotification) {
        throw new HttpErrors.NotFound('Notification not found');
      }
      return {
        statusCode: 200,
        ok: true,
        message: 'Notification found',
        data: foundNotification,
      };
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message);
    }
  }

  @put('/notifications/{id}')
  @response(204, {
    description: 'Notification PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
  ): Promise<ApiResponse<Notification>> {
    try {
      const token = this.request.headers.authorization?.split(' ')[1];
      if (!token) throw new HttpErrors.Unauthorized('Token not found');
      jwt.verify(token, process.env.JWT_SECRET as string, err => {
        if (err) throw new HttpErrors.Unauthorized('Invalid token');
      });
      const decoded = jwt.decode(token, {complete: true});
      const payload = decoded?.payload as unknown as {
        email: string;
        canonicalName: string;
        roles: string[];
        username: string;
        id: number;
      };
      if (!decoded) throw new HttpErrors.Unauthorized('Invalid token');
      const foundNotification = await this.notificationRepository.findById(id);
      if (!foundNotification)
        throw new HttpErrors.NotFound('Notification not found');
      if (foundNotification.profilesThatRead.length === 0) {
        console.log(
          'Saving',
          JSON.stringify([payload.id])
            .replace('[', '{')
            .replace(']', '}') as unknown as number[],
        );
        await this.notificationRepository.updateById(id, {
          profilesThatRead: JSON.stringify([payload.id])
            .replace('[', '{')
            .replace(']', '}') as unknown as number[],
        });
        return {
          statusCode: 204,
          ok: true,
          message: 'Notification updated',
          data: {
            ...foundNotification,
          },
        };
      } else {
        await this.notificationRepository.updateById(id, {
          profilesThatRead: JSON.stringify([
            ...foundNotification.profilesThatRead,
            payload.id,
          ])
            .replace('[', '{')
            .replace(']', '}') as unknown as number[],
        });
      }

      return {
        statusCode: 204,
        ok: true,
        message: 'Notification updated',
        data: {
          ...foundNotification,
        },
      };
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message);
    }
  }
}
