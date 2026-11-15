import { writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { Args, Field, Int, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { uuidv7 } from '@mercato/core';
import { AuthGuard } from '../../auth/auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../auth/permissions';
import { uploadsDir } from '../uploads-dir';

const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif']);
const MAX_BYTES = 5 * 1024 * 1024;

@ObjectType()
export class MediaUploadResultType {
  @Field()
  url!: string;

  @Field()
  filename!: string;

  @Field(() => Int)
  size!: number;
}

/**
 * Media upload as a GraphQL mutation (base64 payload) — keeps uploads fully in
 * GraphQL, no multipart/REST. Files are saved to the uploads dir and served
 * statically at /uploads.
 */
@Injectable()
@Resolver()
export class MediaResolver {
  @Mutation(() => MediaUploadResultType)
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('catalog:write')
  async mediaUpload(
    @Args('filename') filename: string,
    @Args('contentBase64') contentBase64: string,
  ): Promise<MediaUploadResultType> {
    const ext = (extname(filename) || '').toLowerCase();
    if (!ALLOWED.has(ext)) {
      throw new BadRequestException({ code: 'unsupported_type', detail: `Unsupported image type: ${ext}` });
    }
    // Accept optional data: URL prefix.
    const base64 = contentBase64.includes(',') ? contentBase64.slice(contentBase64.indexOf(',') + 1) : contentBase64;
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length === 0) throw new BadRequestException({ code: 'empty_file', detail: 'Empty upload.' });
    if (buffer.length > MAX_BYTES) {
      throw new BadRequestException({ code: 'too_large', detail: 'Max upload size is 5MB.' });
    }
    const name = `${uuidv7()}${ext}`;
    await writeFile(join(uploadsDir(), name), buffer);
    return { url: `/uploads/${name}`, filename: name, size: buffer.length };
  }
}
