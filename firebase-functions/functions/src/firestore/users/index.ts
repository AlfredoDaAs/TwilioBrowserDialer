import AbstractCollection from '../../firebase/AbstractCollection'
// import { throwUntrustedClientError } from '../../common/FriendlyError'

const collectionName = 'users'

class Collection extends AbstractCollection {
    public defaultValues: any = {
        name: null,
        email: null,
        picture: null,
        isAdmin: false,
        uid: null,
        metadata: null
    }

    public findByEmail = async (email:string): Promise<any> => {
        const result = (await this.collection.where('email', '==', email).get()).docs

        if(result.empty) {
            return null;
        }

        return result[0].data()
    }

    public getAllUsers = async (): Promise<any[]> => {
        const result = (await this.collection.get()).docs

        return result.map((doc:any) => doc.data())
    }
}

export default new Collection(collectionName)