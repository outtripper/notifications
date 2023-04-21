import {inject} from '@loopback/core';
import {FilterExcludingWhere, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
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
import {NotificationRepository} from '../repositories';

export class NotificationController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
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
          schema: getModelSchemaRef(Notification, {
            title: 'NewNotification',
            exclude: ['_id'],
          }),
        },
      },
    })
    notification: Omit<Notification, '_id'>,
  ): Promise<Notification> {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token not found');
    jwt.verify(token, process.env.JWT_SECRET as string, err => {
      if (err) throw new Error('Invalid token');
    });
    return this.notificationRepository.create(notification);
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
  async findUserByDestinataryAndToken(): Promise<ApiResponse<Notification[]>> {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token not found');
    jwt.verify(token, process.env.JWT_SECRET as string, err => {
      if (err) throw new Error('Invalid token');
    });
    const decoded = jwt.decode(token, {complete: true}) as unknown as {
      email: string;
      canonicalName: string;
      roles: string[];
      username: string;
    };
    if (!decoded) throw new Error('Invalid token');
    const notifications = await this.notificationRepository.find({
      where: {
        destinatary: decoded.username,
      },
    });
    if (!notifications || notifications.length === 0)
      throw new Error('No notifications found');

    return {
      ok: true,
      statusCode: 200,
      data: notifications,
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
  ): Promise<Notification> {
    return this.notificationRepository.findById(id, filter);
  }

  @put('/notifications/{id}')
  @response(204, {
    description: 'Notification PUT success',
  })
  async replaceById(@param.path.string('id') id: string): Promise<void> {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token not found');
    jwt.verify(token, process.env.JWT_SECRET as string, err => {
      if (err) throw new Error('Invalid token');
    });
    await this.notificationRepository.updateById(id, {
      readAt: Date.now(),
    });
  }
}
