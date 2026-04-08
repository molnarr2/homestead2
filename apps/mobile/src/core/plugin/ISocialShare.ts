
// https://stackoverflow.com/questions/49484159/react-native-can-we-share-an-image-and-text-into-whatsapp

import {IResult} from "../../util/Result.ts";

export default interface ISocialShare {
    shareMessage(socialShare: SocialShareType, phoneNumber: string, imageBase64: string, imageType: string, message: string): Promise<IResult>
    shareTextMessage(socialShare: SocialShareType, phoneNumber: string, message: string): Promise<IResult>
    callNumber(phoneNumber: string): Promise<void>
}

export enum SocialShareType {
    SMS,
    WhatsApp,
    Telegram
}
