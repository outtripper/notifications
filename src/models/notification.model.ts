import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {postgresql: {schema: 'public', table: 'notifications'}},
})
export class Notification extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'number',
    required: true,
    default: () => Date.now(),
  })
  iat: number;

  @property({
    type: 'number',
    required: true,
  })
  tenant: number;

  @property({
    type: 'string',
    required: true,
  })
  msg: string;

  @property({
    type: 'string',
    required: true,
  })
  destinataries: string[];

  @property({
    type: 'string',
    required: true,
    default: () => [],
  })
  profilesThatRead: number[];

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
