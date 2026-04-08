export interface IResult {
    success: boolean,
    error: string
}

export const SuccessResult: IResult = {
    success: true,
    error: ''
}

export function ErrorResult(error: string): IResult {
    return {
        success: false,
        error: error
    }
}
