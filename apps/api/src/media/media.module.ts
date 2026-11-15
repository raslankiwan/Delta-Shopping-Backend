import { Module } from '@nestjs/common';
import { MediaResolver } from './graphql/media.resolver';

/** Media uploads are GraphQL (mediaUpload mutation); files are served statically at /uploads. */
@Module({
  providers: [MediaResolver],
})
export class MediaModule {}
