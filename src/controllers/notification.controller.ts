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
  ): Promise<ApiResponse<Notification>> {
    try {
      const token = this.request.headers.authorization?.split(' ')[1];
      if (!token) throw new HttpErrors.Unauthorized('Token not found');
      jwt.verify(token, process.env.JWT_SECRET as string, err => {
        if (err) throw new HttpErrors.Unauthorized('Invalid token');
      });
      const createdNotification = await this.notificationRepository.create(
        notification,
      );
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
  async findUserByDestinataryAndToken(): Promise<ApiResponse<Notification[]>> {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) throw new HttpErrors.Unauthorized('Token not found');
    jwt.verify(token, process.env.JWT_SECRET as string, err => {
      if (err) throw new HttpErrors.Unauthorized('Invalid token');
    });
    const decoded = jwt.decode(token, {complete: true}) as unknown as {
      email: string;
      canonicalName: string;
      roles: string[];
      username: string;
    };
    if (!decoded) throw new HttpErrors.Unauthorized('Invalid token');
    const notifications = await this.notificationRepository.find({
      where: {
        destinatary: decoded.username,
      },
    });
    if (!notifications || notifications.length === 0)
      throw new HttpErrors.NotFound('No notifications found');

    return {
      ok: true,
      statusCode: 200,
      message: 'Notifications found',
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
  ): Promise<ApiResponse<Notification>> {
    try {
      const foundNotification = this.notificationRepository.findById(
        id,
        filter,
      );
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
      const decoded = jwt.decode(token, {complete: true}) as unknown as {
        email: string;
        canonicalName: string;
        roles: string[];
        username: string;
      };
      if (!decoded) throw new HttpErrors.Unauthorized('Invalid token');
      const foundNotification = await this.notificationRepository.findById(id);
      if (!foundNotification)
        throw new HttpErrors.NotFound('Notification not found');
      await this.notificationRepository.updateById(id, {
        readAt: Date.now(),
      });
      return {
        statusCode: 204,
        ok: true,
        message: 'Notification updated',
        data: {
          ...foundNotification,
          readAt: Date.now(),
        },
      };
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message);
    }
  }
}
