import AbstractCollection from '../../firebase/AbstractCollection'
// import * as admin from "firebase-admin"

const collectionName = 'contacts'

class Collection extends AbstractCollection {
    public defaultValues: any = {
        firstName: null,
        lastName: null,
        company: null,
        phoneNumber: null
    }

    public async getAll (): Promise<any[]> {
        const result = (await this.collection.get()).docs

        return result.map((doc:any) => doc.data())
    }
}

export default new Collection(collectionName)