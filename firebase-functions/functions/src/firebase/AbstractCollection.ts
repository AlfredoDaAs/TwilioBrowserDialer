import { throwDatabaseFailure } from '../common/FriendlyError'
import { firestore } from './index'
import shortUuid from "../common/shortUuid"

// NOTE - Google Cloud documentation is WAY better than Firebase documentation
// https://cloud.google.com/nodejs/docs/reference/firestore/0.17.x/Query#select

// none of these fields are directly "settable" on any entity. However, all entities have them
export interface IFirestoreCollectionEntityFields {
    id: string,                                                                 // our id
    createdAt: number,                                                          // set by the create function
    updatedAt: number                                                           // set by the create and update functions
    deletedAt: number|null                                                      // set by the delete function
}

abstract class AbstractCollection {

    constructor(readonly collectionName: string) {}

    public get firestore(): FirebaseFirestore.Firestore {
        return firestore()
    }

    public get collection(): FirebaseFirestore.DocumentData {
        return firestore().collection(this.collectionName)
    }

    public newId(): string {
        return shortUuid.newFriendlyUuid()
    }

    // abstract

    abstract defaultValues : any

    // simple CRUD

    public async createOne(obj: any, overrideId?: string): Promise<string> {
        const defaultedAndValidObj = this.limitAndDefaultCreateKeys(obj)
        const now = new Date().getTime()
        const newId = overrideId || this.newId()

        const newObj = {
            ...defaultedAndValidObj,
            id: newId,                                                          // ID must be set explcitly above or generated
            createdAt: now,                                                     // Created at can only be set by this function
            updatedAt: now,                                                     // Updated at can only be set by this function or the update function
            deletedAt: null                                                     // Object cannot start deleted
        }

        try {
            await this.collection.doc(newId).create(newObj)
            return newId
        } catch (e) {
            console.error(e)
            return throwDatabaseFailure('create failed: ' + e.message)
        }
    }

    public async readOne(id: string): Promise<any> {
        try {
            return (await this.collection.doc(id).get()).data()
        } catch (e) {
            console.error(e)
            return throwDatabaseFailure('read failed: ' + e.message)
        }
    }

    public async updateOne(id: string, obj: any): Promise<boolean> {
        const validObj = this.limitToApprovedKeys(obj)

        const changeObj = {
            ...validObj,
            updatedAt: Date.now()                                               // This function always overrides the updatedAt
        }
        delete(obj.id)                                                          // You cannot override our id
        delete(obj.createdAt)                                                   // cannot modify the created at datetime
        delete(obj.deletedAt)                                                   // delete must happen explicitly

        try {
            await this.collection.doc(id).update(changeObj)
            return true
        } catch (e) {
            console.error(e)
            return throwDatabaseFailure('update failed: ' + e.message)
        }
    }

    public async updateOneWithoutChecks(id: string, obj: any): Promise<boolean> {
        try {
            await this.collection.doc(id).update(obj)
            return true
        } catch (e) {
            console.error(e)
            return throwDatabaseFailure('update failed: ' + e.message)
        }
    }

    public async cleanupOne(id: string): Promise<boolean> {

        const currentObj = await this.readOne(id)

        if(!currentObj) {
            return throwDatabaseFailure('cleanup failed: object does not exist' + id)
        }

        const defaultedAndValidObj = this.limitAndDefaultCreateKeys(currentObj)
        defaultedAndValidObj.id = currentObj.id
        defaultedAndValidObj.createdAt = currentObj.createdAt
        defaultedAndValidObj.updatedAt = Date.now()
        defaultedAndValidObj.deletedAt = currentObj.deletedAt

        try {
            await this.collection.doc(id).set(defaultedAndValidObj)
            return true
        } catch (e) {
            console.error(e)
            return throwDatabaseFailure('cleanup failed: ' + e.message)
        }
    }

    public async deleteOne(id: string): Promise<boolean> {
        try {
            await this.collection.doc(id).update({deletedAt: Date.now()})
            return true
        } catch (e) {
            console.error(e)
            return throwDatabaseFailure('deletedAt failed: ' + e.message)
        }
    }

    // utility functions

    public limitToApprovedKeys(inObj:any) {
        const approvedData = {} as any
        for(const key of Object.keys(inObj)) {

            let exists = true

            if(key.includes('.')) {

                const keyPath = key.split('.')

                let currentPosition = this.defaultValues
                for(const keyStep of keyPath) {
                    currentPosition = currentPosition[keyStep]
                    if(currentPosition === undefined) {
                        exists = false
                        break
                    }
                }

            } else if(this.defaultValues[key] === undefined) {
                exists = false
            }

            if(exists) {
                approvedData[key] = inObj[key]
            }
        }
        return approvedData
    }

    public limitAndDefaultCreateKeys (inObj:any) {

        // filter inbound data to only approved keys

        const objWithApprovedKeys = this.limitToApprovedKeys(inObj)

        // apply defaults if needed

        const result = {
            ...this.defaultValues,
            ...objWithApprovedKeys
        }

        return result
    }

    public paginatedQuery = async (inQuery:any, lastCursor:string, limitSize:number) => {
        let query = inQuery

        try {
            if(lastCursor !== null) {
                const splitCursor = lastCursor.split('|')
                if(splitCursor.length > 1) {
                    query = query.startAfter(splitCursor)
                }
                else {
                    query = query.startAfter(splitCursor[0])
                }

            }
        } catch (e) {
            // do nothing. If the cursor is bad, just pretend there was no cursor
        }

        const results = await query.limit(limitSize).get()

        return results.docs.map((doc: any)=>(doc.data()))
    }

    public paginatedQueryV2 = async (inQuery:any, lastCursor:any[]|any|null|undefined, limitSize:number) => {
        let query = inQuery

        if(lastCursor !== null && lastCursor !== undefined) {
            query = query.startAfter(...lastCursor)
        }

        const results = await query.limit(limitSize).get()

        return results.docs.map((doc: any)=>(doc.data()))
    }
}

export default AbstractCollection