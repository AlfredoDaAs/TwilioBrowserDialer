// An easy accessor for environmental variables that complies with any environment loading scheme

let envInstance: any = {
    isLoaded: false
}

export const initializeEnvironment = (data: any): void => {
    envInstance = {
        ...data,
        isLoaded: true
    }
}

export default (): any => {
    return envInstance
}