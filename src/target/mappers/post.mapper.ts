import { PostEntity } from "../../common/post.entity";
import { Result } from "../../lib/result";
import { WpPostCreateDTO } from "../dto/types.dto";

type PostCreateData = {
    post: WpPostCreateDTO,
    meta: {
        originalUrl: string[],
        aliasUrls: string[],
    }
}

const entityToDto = (entity: PostEntity): Promise<Result<WpPostCreateDTO>> => {
    try {
        const { title, content, tags } = entity;
    } catch (err: unknown) {

    }
}