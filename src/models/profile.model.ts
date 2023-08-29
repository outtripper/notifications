import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {postgresql: {schema: 'public', table: 'profiles'}},
})
export class Profile extends Entity {
  @property({
    type: 'number',
    required: true,
  })
  user: number;

  @property({
    type: 'string',
    required: true,
  })
  tenant: string;

  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  roles: string[];

  @property({
    type: 'object',
  })
  payload: object;

  constructor(data?: Partial<Profile>) {
    super(data);
  }
}

export interface ProfileRelations {
  // describe navigational properties here
}

export type ProfileWithRelations = Profile & ProfileRelations;
