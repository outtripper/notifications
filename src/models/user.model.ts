/* eslint-disable @typescript-eslint/no-explicit-any */
import {Entity, model, property} from '@loopback/repository';
import {securityId, UserProfile} from '@loopback/security';
import {customAlphabet} from 'nanoid';
// Define the allowed characters (only numbers)
const numbers = '0123456789';
@model({
  settings: {postgresql: {schema: 'public', table: 'users'}},
})
export class User extends Entity implements UserProfile {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id: string;

  @property({
    type: 'uid',
    required: true,
    default: () => parseInt(customAlphabet(numbers, 10)()),
  })
  uuid: number;

  @property({
    type: 'string',
    generated: false,
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  canonicalname: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
  [securityId]: string;

  [attribute: string]: any;
  name?: string | undefined;
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
