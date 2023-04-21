import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Notification extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  tenant: string;

  @property({
    type: 'number',
    required: true,
  })
  iat: number;

  @property({
    type: 'string',
    required: true,
  })
  msg: string;

  @property({
    type: 'string',
    required: true,
  })
  destinatary: string;

  @property({
    type: 'number',
    required: false,
  })
  readAt: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Notification>) {
    super(data);
  }
}

export interface NotificationRelations {
  // describe navigational properties here
}

export type NotificationWithRelations = Notification & NotificationRelations;
