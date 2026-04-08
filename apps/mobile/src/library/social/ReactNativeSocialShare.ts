// https://stackoverflow.com/questions/49484159/react-native-can-we-share-an-image-and-text-into-whatsapp
// https://stackoverflow.com/questions/46295905/react-native-share-image
// https://react-native-share.github.io/react-native-share/docs/share-open

import ISocialShare, { SocialShareType } from "../../core/plugin/ISocialShare.ts";
import Share from "react-native-share";
import { Alert, Linking, Platform } from "react-native";
import {ErrorResult, IResult, SuccessResult} from "../../util/Result.ts";

function toShareSocial(socialShareType: SocialShareType) {
    if (socialShareType == SocialShareType.Telegram) {
        return Share.Social.TELEGRAM
    } else if (socialShareType == SocialShareType.SMS) {
        return Share.Social.SMS
    } else if (socialShareType == SocialShareType.WhatsApp) {
        return Share.Social.WHATSAPP
    } else {
        return Share.Social.SMS
    }
}

export default class ReactNativeSocialShare implements ISocialShare {

    async shareMessage(socialShare: SocialShareType, phoneNumber: string, imageBase64: string, imageType: string, message: string): Promise<IResult> {
        if (socialShare == SocialShareType.SMS && Platform.OS !== "android") {
            return await this.shareImageMessage(phoneNumber, imageBase64, imageType)
        } else if (Platform.OS == "android" && socialShare == SocialShareType.SMS) {
            return await this.shareAndroidSMSTextMessage(phoneNumber, message)
        } else {
            return await this.shareImageAndTextMessage(socialShare, phoneNumber, imageBase64, imageType, message)
        }
    }

    async shareImageAndTextMessage(socialShare: SocialShareType, phoneNumber: string, imageBase64: string, imageType: string, message: string): Promise<IResult> {
        const url = 'data:' + imageType + ';base64,' + imageBase64

        const shareOptions = {
            title: '',
            message: message,
            url: url,
            social: toShareSocial(socialShare),
            whatsAppNumber: phoneNumber,
            recipient: phoneNumber,
            filename: '',
        };

        const result = await Share.shareSingle(shareOptions)
        if (!result.success) {
            return ErrorResult(result.message)
        }

        return SuccessResult
    }

    /** On Samsung phones this is the only way it works.
     * */
    async shareAndroidSMSTextMessage(phoneNumber: string, message: string): Promise<IResult> {
        await Linking.openURL("sms:" + phoneNumber + "?body=" + encodeURI(message))
        return SuccessResult
    }

    async shareTextMessage(socialShare: SocialShareType, phoneNumber: string, message: string): Promise<IResult> {
        const shareOptions = {
            title: '',
            message: message,
            url: '',
            social: toShareSocial(socialShare),
            whatsAppNumber: phoneNumber,  // country code + phone number
            recipient: phoneNumber,
            filename: '' , // only for base64 file in Android
        };

        const result = await Share.shareSingle(shareOptions)
        if (!result.success) {
            return ErrorResult(result.message)
        }

        return SuccessResult
    }

    async shareImageMessage(phoneNumber: string, imageBase64: string, imageType: string): Promise<IResult> {
        const url = 'data:' + imageType + ';base64,' + imageBase64

        const shareOptions = {
            title: '',
            message: '',
            url: url,
            social: Share.Social.SMS,
            whatsAppNumber: phoneNumber,  // country code + phone number
            recipient: phoneNumber,
            filename: '' , // only for base64 file in Android
        };

        const result = await Share.shareSingle(shareOptions)
        if (!result.success) {
            return ErrorResult(result.message)
        }

        return SuccessResult
    }

    async callNumber(phoneNumber: string): Promise<void> {
        let myPhoneNumber = ""
        if (Platform.OS !== 'android') {
            myPhoneNumber = `telprompt:${phoneNumber}`
        } else {
            myPhoneNumber = `tel:${phoneNumber}`
        }
        const result = await Linking.canOpenURL(myPhoneNumber)
        if (result) {
            await Linking.openURL(myPhoneNumber)
        } else {
            Alert.alert('Phone number is not available')
        }
    }
}
