import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Notification, NotificationRelations} from '../models';

export class NotificationsRepository extends DefaultCrudRepository<
  Notification,
  typeof Notification.prototype._id,
  NotificationRelations
> {
  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource,
  ) {
    super(Notification, dataSource);
  }
}
