import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Notification, NotificationRelations} from '../models';

export class NotificationRepository extends DefaultCrudRepository<
  Notification,
  typeof Notification.prototype._id,
  NotificationRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongoDbDataSource) {
    super(Notification, dataSource);
  }
}
