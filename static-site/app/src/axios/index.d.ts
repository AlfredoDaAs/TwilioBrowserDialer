import { AxiosInstance } from 'axios'

declare function getInstance(): AxiosInstance

export declare function basicParams(): { [key: string]: string }
export = getInstance()