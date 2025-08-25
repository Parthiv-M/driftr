import * as unsplash from "unsplash-js";

export const unsplashAPI = unsplash.createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY!
});