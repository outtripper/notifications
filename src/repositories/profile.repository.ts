import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Profile, ProfileRelations} from '../models';

export class ProfileRepository extends DefaultCrudRepository<
  Profile,
  typeof Profile.prototype._id,
  ProfileRelations
> {
  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource,
  ) {
    super(Profile, dataSource);
  }
}
